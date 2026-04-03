import express from 'express';
import { nanoid } from 'nanoid';
import { Complaint, User } from '../models/index.js';
import { detectLanguage, translateToEnglish } from '../utils/langDetect.js';
import { classifyWithZephyr, calculateConfidence, getVictimGuidance } from '../utils/huggingface.js';
import { getBnsSections, getDepartment, getCityCoords } from '../utils/bnsMapper.js';
import { extractAndStoreEntities } from '../utils/patternDetector.js';
import { sendWelcomeEmail, sendFirEmail, sendOfficerAssignmentEmail } from '../utils/emailSender.js';
import { verifyAdmin, verifyUser } from '../middleware/auth.js';

const router = express.Router();

// ── POST /api/complaints/classify ────────────────────────────
router.post('/classify', async (req, res) => {
  try {
    const { text, email, name, city, phone, evidence_url } = req.body;

    // 1. Validate
    if (!text || !email || !name) {
      return res.status(400).json({ error: 'text, email, and name are required' });
    }

    // 2. Sanitize
    const cleanText = text.trim().slice(0, 2000).replace(/<script[^>]*>.*?<\/script>/gi, '');

    // 3. Detect language
    const detected_language = detectLanguage(cleanText);

    // 4. Translate to English
    const english_text = await translateToEnglish(cleanText, detected_language);

    // 5. Classify with Zephyr 7B
    const { categories, severity, source } = await classifyWithZephyr(english_text);

    // 6. Calculate confidence
    const confidence = calculateConfidence(categories, severity, source);

    // 7. BNS sections
    const bns_sections = getBnsSections(categories);

    // 8. Department
    const department = getDepartment(categories);

    // 9. City coordinates
    const location = getCityCoords(city);

    // 10. Generate unique reference number
    const ref_no = `FIR-${nanoid(8).toUpperCase()}`;

    // 11. Victim guidance
    const victim_guidance = getVictimGuidance(severity);

    // 12. Save to MongoDB
    const complaint = await Complaint.create({
      ref_no,
      original_text: cleanText,
      translated_text: english_text,
      detected_language,
      categories,
      severity,
      department,
      bns_sections,
      victim_email: email.toLowerCase().trim(),
      victim_name: name.trim(),
      victim_phone: phone || '',
      city: city || '',
      location,
      evidence_url: evidence_url || null,
      history: [{
        status: 'RECEIVED',
        changed_by: 'system',
        note: 'Complaint submitted via CyberShield AI portal',
        timestamp: new Date()
      }]
    });

    // 13. Async operations — fire them and catch separately for better debug visibility
    extractAndStoreEntities(cleanText, ref_no).catch(err => console.error(`[ComplaintRoute] Entity extraction failed for ${ref_no}:`, err));

    // We await these in production if we suspect silent failures, 
    // although this adds 1-2 seconds to the response time.
    Promise.all([
      sendWelcomeEmail(email, { ref_no, categories, severity, name }),
      sendFirEmail(email, { ref_no, categories, severity, department, bns_sections, original_text: cleanText, translated_text: english_text, name, city: city || '' })
    ]).then(() => {
      console.log(`[ComplaintRoute] All emails dispatched for ${ref_no}`);
    }).catch(err => {
      console.error(`[ComplaintRoute] Email delivery failed for ${ref_no}:`, err);
    });

    // 14. Return the full complaint document augmented with meta-stats for the result page
    return res.json({
      ...complaint.toObject(),
      confidence,
      victim_guidance,
      email_sent: true
    });

  } catch (err) {
    console.error('Classify error:', err);
    res.status(500).json({ error: 'Classification failed. Please try again.' });
  }
});

// ── GET /api/complaints/:ref_no ──────────────────────────────
router.get('/:ref_no', async (req, res) => {
  try {
    const complaint = await Complaint
      .findOne({ ref_no: req.params.ref_no })
      .select('-victim_email -__v');
    if (!complaint) return res.status(404).json({ error: 'Case not found' });
    res.json(complaint);
  } catch (err) {
    console.error('Get complaint error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/complaints/update (admin) ──────────────────────
router.post('/update', verifyAdmin, async (req, res) => {
  try {
    const { ref_no, status, assigned_officer, department, note } = req.body;

    const allowed = ['RECEIVED', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED'];
    if (!ref_no || !status) {
      return res.status(400).json({ error: 'ref_no and status are required' });
    }
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const historyEntry = {
      status,
      changed_by: assigned_officer || req.admin?.email || 'admin',
      note: note || '',
      timestamp: new Date()
    };

    const updateFields = { status };
    if (assigned_officer !== undefined) updateFields.assigned_officer = assigned_officer;
    if (department !== undefined) updateFields.department = department;

    const updated = await Complaint.findOneAndUpdate(
      { ref_no },
      {
        $set: updateFields,
        $push: { history: historyEntry }
      },
      { new: true, select: '-victim_email -__v' }
    );

    if (!updated) return res.status(404).json({ error: 'Case not found' });

    // Trigger Assignment Email to Officer
    if (assigned_officer) {
      User.findOne({ name: assigned_officer, role: 'admin' })
        .then(officer => {
          if (officer && officer.email) {
            sendOfficerAssignmentEmail(officer.email, {
              ref_no: updated.ref_no,
              severity: updated.severity,
              name: updated.victim_name,
              department: updated.department,
              categories: updated.categories
            }).catch(err => console.error(`[AssignmentNotify] Failed for ${ref_no}:`, err));
          }
        })
        .catch(err => console.error(`[AssignmentNotify] DB Lookup failed for ${assigned_officer}:`, err));
    }

    res.json(updated);
  } catch (err) {
    console.error('Update complaint error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/complaints/user/my-cases (citizen) ─────────────
router.get('/user/my-cases', verifyUser, async (req, res) => {
  try {
    // We find the user first to get their email
    const user = await Complaint.find({ victim_email: req.user.email }).sort({ createdAt: -1 });
    res.json(user);
  } catch (err) {
    console.error('Get my-cases error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
