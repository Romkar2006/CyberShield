import { Entity, FraudPattern } from '../models/index.js';

const PATTERNS = [
  { type: 'phone',        regex: /(?:\+91|0)?[6-9]\d{9}/g },
  { type: 'upi_id',       regex: /[\w.\-]+@(?:oksbi|ybl|ibl|axl|paytm|upi|icici|sbi|hdfc|okaxis|okicici)/g },
  { type: 'url',          regex: /https?:\/\/[^\s]+/g },
  { type: 'email',        regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { type: 'bank_account', regex: /\b\d{9,18}\b/g },
  { type: 'ip_address',   regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g },
];

const THRESHOLD = 3;

export async function extractAndStoreEntities(text, refNo) {
  for (const { type, regex } of PATTERNS) {
    const matches = [...new Set(text.match(regex) || [])];
    for (const value of matches) {
      try {
        await Entity.findOneAndUpdate(
          { type, value },
          {
            $addToSet: { complaint_refs: refNo },
            $inc:      { count: 1 },
            $set:      { last_seen: new Date() },
            $setOnInsert: { first_seen: new Date() }
          },
          { upsert: true, new: true }
        );
        const entity = await Entity.findOne({ type, value });
        if (entity && entity.count >= THRESHOLD) {
          await FraudPattern.findOneAndUpdate(
            { entity_value: value, entity_type: type },
            {
              $set:      { complaint_count: entity.count, status: 'ACTIVE' },
              $addToSet: { complaints: refNo },
              $setOnInsert: { pattern_id: `PAT-${Date.now()}`, severity: 'HIGH' }
            },
            { upsert: true }
          );
        }
      } catch (err) {
        // Duplicate key on upsert race condition — safe to ignore
        if (err.code !== 11000) console.error('Entity upsert error:', err.message);
      }
    }
  }
}
