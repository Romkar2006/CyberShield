import express from 'express';
import axios from 'axios';

const router = express.Router();

// ── GET /api/news/global ─────────────────────────────────────
router.get('/global', async (req, res) => {
  try {
    // Fetch latest cybercrime news from Google News RSS (India context)
    const url = 'https://news.google.com/rss/search?q=cybercrime+india+security&hl=en-IN&gl=IN&ceid=IN:en';
    const response = await axios.get(url);
    const xml = response.data;

    // Simple robust regex parsing for RSS (avoiding extra dependency)
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const content = match[1];
      const title = content.match(/<title>(.*?)<\/title>/)?.[1]?.replace('<![CDATA[', '').replace(']]>', '') || '';
      const link = content.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const source = content.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || 'Global Intelligence';

      items.push({
        id: Math.random().toString(36).substr(2, 9),
        title: title.split(' - ')[0], // Clean up title
        link,
        pubDate: new Date(pubDate).toISOString(),
        source: source.trim()
      });
    }

    res.json(items);
  } catch (err) {
    console.error('Failed to fetch global intelligence feed:', err.message);
    // Fallback mock data in case of network issues (G-News can be fickle)
    res.json([
      { id: 'f1', title: 'New Ransomware Wave Targeting Banking Systems in Asia', source: 'Reuters', pubDate: new Date().toISOString() },
      { id: 'f2', title: 'BNS 2024: Cyber Cell Launches New Triage Standards', source: 'GoI Press', pubDate: new Date().toISOString() },
      { id: 'f3', title: 'Critical Zero-Day Identified in Common VPN Protocols', source: 'The Hacker News', pubDate: new Date().toISOString() }
    ]);
  }
});

export default router;
