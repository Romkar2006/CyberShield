import express from 'express';
import { Complaint } from '../models/index.js';
import { CITY_COORDS } from '../utils/bnsMapper.js';

const router = express.Router();

// ── GET /api/heatmap (public) ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const results = await Complaint.aggregate([
      { $match: { city: { $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const maxCount = results.length > 0 ? results[0].count : 1;

    const heatmapData = results
      .filter(r => CITY_COORDS[r._id])
      .map(r => ({
        city:      r._id,
        lat:       CITY_COORDS[r._id].lat,
        lng:       CITY_COORDS[r._id].lng,
        count:     r.count,
        intensity: Math.min(r.count / maxCount, 1)   // 0-1 for Leaflet heat plugin
      }));

    res.json(heatmapData);
  } catch (err) {
    console.error('Heatmap error:', err);
    res.status(500).json({ error: 'Heatmap query failed' });
  }
});

export default router;
