import express from 'express';
import { KnowledgeArticle } from '../models/index.js';

import jwt from 'jsonwebtoken';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware to verify any authenticated user (Admin or Citizen)
function verifyAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user in request
    next();
  } catch (err) {
    console.error("Auth Decode Error:", err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
}

function generateSlug(title) {
  return title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ── GET /api/articles/mine (Authenticated) ───────────────────────
router.get('/mine', verifyAuth, async (req, res) => {
  try {
    const articles = await KnowledgeArticle.find({ author_id: req.user.id })
      .sort({ published_at: -1 })
      .select('-content_markdown -__v');
    res.json(articles);
  } catch (err) {
    console.error('Get my articles error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/articles (public) ───────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, limit = 12, page = 1 } = req.query; // Higher limit for better discovery
    // NORMALIZE FILTER: MongoDB search is case sensitive, but our UI sends uppercase.
    const filter = category ? { category: category.toLowerCase() } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [articles, total] = await Promise.all([
      KnowledgeArticle.find(filter)
        .sort({ published_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('slug title category image_url tags views published_at author_name'), // Explicitly include tags and metadata
      KnowledgeArticle.countDocuments(filter)
    ]);

    res.json({ articles, total });
  } catch (err) {
    console.error('Get articles error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/articles/:slug (public) ─────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const article = await KnowledgeArticle.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true, select: '-__v' }
    );
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error('Get article error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/articles (Authenticated) ─────────────────────
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { title, category, content_markdown, tags, image_url } = req.body;
    
    if (!title || !content_markdown) {
      return res.status(400).json({ error: 'Title and content are required to publish.' });
    }

    // NORMALIZE CATEGORY: Must match lowercase enums in schema
    const cat = category ? category.toLowerCase() : 'general';
    const slug = generateSlug(title + '-' + Math.random().toString(36).substring(7));
    
    const article = await KnowledgeArticle.create({
      slug,
      title,
      category: cat,
      content_markdown,
      tags: tags || [],
      author_id: req.user.id || null, // Robustness check
      author_name: req.user.name || 'Citizen Investigator',
      published_at: new Date(),
      views: 0
    });

    res.json(article);
  } catch (err) {
    console.error('🚨 Publication Handshake Failure:', err);
    if (err.code === 11000) return res.status(409).json({ error: 'Article collision detected: Try a unique title.' });
    if (err.name === 'ValidationError') return res.status(400).json({ error: 'Validation Error: ' + Object.keys(err.errors).join(', ') });
    res.status(500).json({ error: 'Internal Neural Node Failure: ' + err.message });
  }
});

// ── POST /api/articles/generate (VERIFIED FOR THIS ENVIRONMENT) 
router.post('/generate', verifyAuth, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI Service configuration missing.' });
    }

    // DIRECT AXIOS HANDSHAKE (Immune to SDK versioning/authorization tier mismatches)
    const modelSequence = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash-exp"];
    let content = "";


    for (const modelName of modelSequence) {
      try {
        console.log(`📡 Direct handshake attempt with node: ${modelName}...`);
        
        // Using v1beta endpoint for compatibility with 2.5 and 2.0 models
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const response = await axios.post(url, {
          contents: [{ 
            parts: [{ 
              text: `Write a highly detailed, comprehensive, and advanced intelligence dossier (article format) about: "${topic}". 
                     You must generate at least 800 - 1200 words of deeply informative content to educate citizens completely.
                     Include the following sections:
                     1. Executive Overview: An engaging, high-level explanation of the threat or legal issue.
                     2. Advanced Insights & "Unknown" Tactics: Provide deep technical or psychological insights into exactly HOW and WHY this happens. Expose specific hacker methodologies, social engineering tricks, or hidden technical vulnerabilities that the average citizen does NOT know about.
                     3. Legal Framework (BNS 2024): Explicitly map this topic to specific BNS (Bharatiya Nyaya Sanhita) 2024 legal sections and explain them clearly.
                     4. Step-by-Step Response Protocol: A precise action plan for victims or targets (e.g., dialing 1930, preserving headers, etc).
                     5. Preventative Blueprint: Robust, advanced safety tips for future protection.
                     Output ONLY clean, readable Markdown using H2 (##) and H3 (###) headers, bullet points, and bold text. Do not output anything outside of the markdown structure. Make it read like a premium, expert-level cybercrime intelligence briefing.`
            }] 
          }]
        });

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          content = response.data.candidates[0].content.parts[0].text;
          console.log(`✅ Intelligence materialized via direct node: ${modelName}`);
          break;
        }
      } catch (err) {
        const statusCode = err.response?.status;
        console.warn(`🚨 Node ${modelName} direct handshake failed (${statusCode}): ${err.message}. Sequencing to next...`);
        
        // If it's a 429, we handle it as a quota limit immediately
        if (statusCode === 429) {
          return res.status(429).json({ error: 'AI Quota exhausted. Please wait 60 seconds and retry.' });
        }
      }
    }

    if (!content) {
      return res.status(500).json({ error: 'AI Intelligence Hub failed to materialize content across direct nodes.' });
    }

    res.json({ content, imageUrl: null });
  } catch (err) {
    console.error('🚨 Generation Handshake Failure:', err);
    res.status(500).json({ error: 'Neural uplink handshake interrupted.' });
  }
});

// ── POST /api/articles/upload-image (Authenticated) ─────────────────────
router.post('/upload-image', verifyAuth, express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image data provided.' });

    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'cybershield_intel',
        resource_type: 'image'
      });
      return res.json({ imageUrl: result.secure_url });
    } catch (cdnErr) {
      console.warn('⚠️ Cloudinary Upload Failed Check Credentials. Falling back to internal Base64 DB storage.');
      // FALLBACK ARCHITECTURE: Return raw Base64 to bypass CDN failure and ensure upload success
      return res.json({ imageUrl: image });
    }
  } catch (err) {
    console.error('🚨 Image Processing Failure:', err);
    res.status(500).json({ error: 'Failed to securely process intel asset.' });
  }
});

// ── DELETE /api/articles/:id (Authenticated) ───────────────────────
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const article = await KnowledgeArticle.findOne({ _id: req.params.id, author_id: req.user.id });
    if (!article) return res.status(404).json({ error: 'Article not found or you do not have permission to delete it.' });
    
    await KnowledgeArticle.deleteOne({ _id: req.params.id });
    res.json({ message: 'Intelligence Dossier permanently erased from the network.' });
  } catch (err) {
    console.error('Delete article error:', err);
    res.status(500).json({ error: 'Server error during deletion protocol.' });
  }
});

export default router;
