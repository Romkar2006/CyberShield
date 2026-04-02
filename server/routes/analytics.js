import express from 'express';
import { Complaint, FraudPattern } from '../models/index.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/analytics (admin) ───────────────────────────────
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [categories, monthly, severity, cities] = await Promise.all([
      Complaint.aggregate([
        { $unwind: '$categories' },
        { $group: { _id: '$categories', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { name: '$_id', count: 1, _id: 0 } }
      ]),
      Complaint.aggregate([
        { $group: {
            _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
        { $project: {
            month: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] },
            count: 1, _id: 0
        }}
      ]),
      Complaint.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $project: { level: '$_id', count: 1, _id: 0 } }
      ]),
      Complaint.aggregate([
        { $match: { city: { $ne: '' } } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { city: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    const len   = monthly.length;
    const trend = len >= 2
      ? Math.round(((monthly[len - 1].count - monthly[len - 2].count) / monthly[len - 2].count) * 100)
      : 0;

    res.json({ categories, monthly, severity, cities, trend });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Analytics query failed' });
  }
});

export default router;
