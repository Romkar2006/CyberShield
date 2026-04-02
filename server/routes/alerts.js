import express from 'express';
import { ScamAlert } from '../models/index.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/alerts/active (public) ─────────────────────────
router.get('/active', async (req, res) => {
  try {
    const alerts = await ScamAlert.find({ is_active: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('-__v');
    res.json(alerts);
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// ── GET /api/alerts (admin) ──────────────────────────────────
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const alerts = await ScamAlert.find().sort({ createdAt: -1 }).select('-__v');
    res.json(alerts);
  } catch (err) {
    console.error('Get all alerts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/alerts (admin) ─────────────────────────────────
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { title, description, severity, affected_cities, scam_type } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }
    const alert = await ScamAlert.create({
      title,
      description,
      severity:        severity || 'High',
      affected_cities: affected_cities || [],
      scam_type:       scam_type || '',
      created_by:      'admin',
      is_active:       false
    });
    res.json(alert);
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/alerts/:id/toggle (admin) ─────────────────────
router.patch('/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const alert = await ScamAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    alert.is_active = !alert.is_active;
    if (alert.is_active) alert.published_at = new Date();
    await alert.save();

    res.json({ is_active: alert.is_active, published_at: alert.published_at });
  } catch (err) {
    console.error('Toggle alert error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
