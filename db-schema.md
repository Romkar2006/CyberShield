# CyberShield — Database Schema
# Read gemini.md and backend.md FIRST. Then read this file completely.
# This file defines every MongoDB collection, field, index, and relationship.
# Build the database layer EXACTLY as specified here — no deviations.

---

## Database Setup

```
Provider:   MongoDB Atlas M0 (free tier)
Database:   cybershield
ODM:        Mongoose 8.x
URI format: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cybershield
```

All schemas live in: `server/models/index.js`
Export every model as a named export from this single file.
Use `mongoose.Schema` and `mongoose.model` for every collection.
Add `{ timestamps: true }` to every schema — auto-creates `createdAt` and `updatedAt`.

---

## Collection 1 — complaints (CORE — most important)

This is the primary collection. Every citizen complaint lives here.
Every other collection either feeds into this or is fed by it.

### Mongoose Schema

```javascript
import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  status:     { type: String, required: true },
  changed_by: { type: String, default: 'system' },
  note:       { type: String, default: '' },
  timestamp:  { type: Date, default: Date.now }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  ref_no: {
    type:     String,
    required: true,
    unique:   true,
    index:    true
  },
  original_text: {
    type:     String,
    required: true,
    maxlength: 2000
  },
  translated_text: {
    type:    String,
    default: ''
  },
  detected_language: {
    type:    String,
    enum:    ['hindi', 'hinglish', 'english'],
    default: 'english'
  },
  categories: {
    type:     [String],
    required: true,
    validate: { validator: v => v.length >= 1 && v.length <= 2, message: 'Max 2 categories' }
  },
  severity: {
    type:    String,
    enum:    ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  department: {
    type:    String,
    default: 'Cyber Crime Cell'
  },
  bns_sections: {
    type:    [String],
    default: []
  },
  victim_email: {
    type:     String,
    required: true,
    lowercase: true,
    trim:     true
  },
  victim_name: {
    type:     String,
    required: true,
    trim:     true
  },
  status: {
    type:    String,
    enum:    ['RECEIVED', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED'],
    default: 'RECEIVED'
  },
  assigned_officer: {
    type:    String,
    default: ''
  },
  city: {
    type:    String,
    default: ''
  },
  location: {
    type:    locationSchema,
    default: () => ({})
  },
  evidence_url: {
    type:    String,
    default: null
  },
  escalation_sent: {
    type:    Boolean,
    default: false
  },
  history: {
    type:    [historySchema],
    default: []
  }
}, { timestamps: true });
```

### Indexes for complaints

```javascript
complaintSchema.index({ ref_no: 1 },             { unique: true });
complaintSchema.index({ victim_email: 1 });
complaintSchema.index({ status: 1, severity: 1 });
complaintSchema.index({ severity: 1 });
complaintSchema.index({ city: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ location: '2dsphere' });
```

### Field Reference

| Field | Type | Allowed Values | Notes |
|-------|------|---------------|-------|
| ref_no | String | FIR-XXXXXXXX | nanoid(8).toUpperCase() — primary identifier |
| original_text | String | any | Exactly what user typed — never modified |
| translated_text | String | any | Google Translate output — empty if already English |
| detected_language | String | hindi / hinglish / english | Set by franc detection |
| categories | Array[String] | 27 crime categories | Max 2 items |
| severity | String | Critical / High / Medium / Low | Set by Zephyr 7B |
| department | String | 7 departments | From DEPARTMENT_MAP in bnsMapper.js |
| bns_sections | Array[String] | BNS 2024 sections | From BNS_SECTIONS dict |
| victim_email | String | valid email | NEVER returned in public API routes |
| victim_name | String | any | Display name only |
| status | String | 4 values | Only moves forward — never backward |
| assigned_officer | String | any | Empty until admin assigns |
| city | String | 10 Indian cities | From dropdown — drives heatmap |
| location | Object | {lat, lng} | City coordinates from CITY_COORDS dict |
| evidence_url | String | Cloudinary URL | null if no upload |
| escalation_sent | Boolean | true/false | Prevents duplicate escalation emails |
| history | Array[Object] | see below | Append-only — never modify existing entries |

### history[] entry structure

```json
{
  "status":     "ASSIGNED",
  "changed_by": "Insp. Sharma",
  "note":       "Case forwarded to Cyber Crime Cell",
  "timestamp":  "2026-03-18T11:45:00.000Z"
}
```

### Initial history entry (set on complaint creation)

```javascript
history: [{
  status:     'RECEIVED',
  changed_by: 'system',
  note:       'Complaint submitted via CyberShield AI portal',
  timestamp:  new Date()
}]
```

### Export

```javascript
export const Complaint = mongoose.model('Complaint', complaintSchema);
```

---

## Collection 2 — users

Citizen accounts and admin accounts. Victims who don't register
still appear in complaints via victim_email — no account required
for filing or tracking complaints.

### Mongoose Schema

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true
  },
  password_hash: {
    type:     String,
    required: true
  },
  name: {
    type:     String,
    required: true,
    trim:     true
  },
  role: {
    type:    String,
    enum:    ['user', 'admin'],
    default: 'user'
  },
  language_pref: {
    type:    String,
    enum:    ['english', 'hinglish', 'hindi'],
    default: 'english'
  }
}, { timestamps: true });
```

### Indexes for users

```javascript
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
```

### Field Reference

| Field | Type | Allowed Values | Notes |
|-------|------|---------------|-------|
| email | String | valid email | Primary login identifier — unique |
| password_hash | String | bcryptjs hash | NEVER store plaintext password |
| name | String | any | Shown in profile page and FIR documents |
| role | String | user / admin | admin gets access to /admin routes |
| language_pref | String | english / hinglish / hindi | CyberBot responds in this language |

### Password hashing (always use this)

```javascript
import bcrypt from 'bcryptjs';

// On register — hash before saving
const password_hash = await bcrypt.hash(plainPassword, 12);

// On login — verify
const isValid = await bcrypt.compare(plainPassword, user.password_hash);
```

### Export

```javascript
export const User = mongoose.model('User', userSchema);
```

---

## Collection 3 — entities

Stores every phone number, UPI ID, URL, email address, and bank
account number extracted from complaint text via regex.
Powers the fraud pattern detection system.

### Mongoose Schema

```javascript
const entitySchema = new mongoose.Schema({
  type: {
    type:     String,
    enum:     ['phone', 'upi_id', 'url', 'email', 'bank_account'],
    required: true
  },
  value: {
    type:     String,
    required: true,
    trim:     true
  },
  complaint_refs: {
    type:    [String],
    default: []
  },
  count: {
    type:    Number,
    default: 1,
    min:     1
  },
  first_seen: {
    type:    Date,
    default: Date.now
  },
  last_seen: {
    type:    Date,
    default: Date.now
  }
}, { timestamps: true });
```

### Indexes for entities

```javascript
entitySchema.index({ value: 1, type: 1 }, { unique: true });
entitySchema.index({ count: -1 });
entitySchema.index({ type: 1 });
```

### Field Reference

| Field | Type | Allowed Values | Notes |
|-------|------|---------------|-------|
| type | String | phone / upi_id / url / email / bank_account | Determines which regex matched |
| value | String | extracted text | The actual phone number, UPI ID etc. |
| complaint_refs | Array[String] | FIR ref_no values | All complaints containing this entity |
| count | Number | >= 1 | Number of complaints mentioning this entity |
| first_seen | Date | any | When first extracted |
| last_seen | Date | any | Most recent complaint mentioning it |

### Regex patterns that populate this collection

```javascript
const PATTERNS = [
  { type: 'phone',        regex: /(?:\+91|0)?[6-9]\d{9}/g },
  { type: 'upi_id',       regex: /[\w.\-]+@(?:oksbi|ybl|ibl|axl|paytm|upi|icici|sbi|hdfc|okaxis|okicici)/g },
  { type: 'url',          regex: /https?:\/\/[^\s]+/g },
  { type: 'email',        regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { type: 'bank_account', regex: /\b\d{9,18}\b/g },
];
```

### Upsert logic (used in patternDetector.js)

```javascript
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
```

### Fraud trigger threshold

```javascript
const FRAUD_THRESHOLD = 3;
// When entity.count >= 3 → create/update FraudPattern document
```

### Export

```javascript
export const Entity = mongoose.model('Entity', entitySchema);
```

---

## Collection 4 — fraud_patterns

Created automatically when 3+ complaints share the same entity.
Never created manually — only by patternDetector.js.
Shown as alert cards on the admin SOC dashboard.

### Mongoose Schema

```javascript
const fraudPatternSchema = new mongoose.Schema({
  pattern_id: {
    type:   String,
    unique: true
  },
  entity_type: {
    type:     String,
    enum:     ['phone', 'upi_id', 'url', 'email', 'bank_account'],
    required: true
  },
  entity_value: {
    type:     String,
    required: true
  },
  complaint_count: {
    type:    Number,
    default: 0
  },
  severity: {
    type:    String,
    enum:    ['CRITICAL', 'HIGH', 'MEDIUM'],
    default: 'HIGH'
  },
  status: {
    type:    String,
    enum:    ['ACTIVE', 'RESOLVED'],
    default: 'ACTIVE'
  },
  complaints: {
    type:    [String],
    default: []
  }
}, { timestamps: true });
```

### Indexes for fraud_patterns

```javascript
fraudPatternSchema.index({ pattern_id: 1 }, { unique: true });
fraudPatternSchema.index({ entity_value: 1, entity_type: 1 });
fraudPatternSchema.index({ status: 1 });
fraudPatternSchema.index({ complaint_count: -1 });
```

### Field Reference

| Field | Type | Allowed Values | Notes |
|-------|------|---------------|-------|
| pattern_id | String | PAT-XXXXXXXX | Auto-generated: `PAT-${Date.now()}` |
| entity_type | String | 5 entity types | Mirrors Entity.type |
| entity_value | String | any | The shared entity (e.g. abc@oksbi) |
| complaint_count | Number | >= 3 | Synced from Entity.count |
| severity | String | CRITICAL/HIGH/MEDIUM | Always HIGH for detected patterns |
| status | String | ACTIVE / RESOLVED | Admin can mark RESOLVED |
| complaints | Array[String] | FIR ref_no values | All complaints in this pattern |

### Upsert logic (used in patternDetector.js)

```javascript
await FraudPattern.findOneAndUpdate(
  { entity_value: value, entity_type: type },
  {
    $set: {
      complaint_count: entity.count,
      status: 'ACTIVE'
    },
    $addToSet: { complaints: refNo },
    $setOnInsert: {
      pattern_id: `PAT-${Date.now()}`,
      severity:   'HIGH'
    }
  },
  { upsert: true }
);
```

### Export

```javascript
export const FraudPattern = mongoose.model('FraudPattern', fraudPatternSchema);
```

---

## Collection 5 — scam_alerts

Admin-created public alerts. When is_active is true, the alert
appears as a red dismissible banner on EVERY page of the website.
Citizens see it automatically on the next page load.

### Mongoose Schema

```javascript
const scamAlertSchema = new mongoose.Schema({
  title: {
    type:      String,
    required:  true,
    maxlength: 100,
    trim:      true
  },
  description: {
    type:      String,
    required:  true,
    maxlength: 300,
    trim:      true
  },
  severity: {
    type:    String,
    enum:    ['Critical', 'High', 'Medium'],
    default: 'High'
  },
  affected_cities: {
    type:    [String],
    default: []
  },
  scam_type: {
    type:    String,
    default: ''
  },
  is_active: {
    type:    Boolean,
    default: false
  },
  created_by: {
    type:    String,
    default: 'admin'
  },
  published_at: {
    type:    Date,
    default: null
  }
}, { timestamps: true });
```

### Indexes for scam_alerts

```javascript
scamAlertSchema.index({ is_active: 1 });
scamAlertSchema.index({ createdAt: -1 });
scamAlertSchema.index({ severity: 1 });
```

### Field Reference

| Field | Type | Allowed Values | Notes |
|-------|------|---------------|-------|
| title | String | max 100 chars | Short alert title for banner |
| description | String | max 300 chars | 1–2 sentences shown below title |
| severity | String | Critical / High / Medium | Controls banner color |
| affected_cities | Array[String] | city names | Optional — can be empty |
| scam_type | String | any | e.g. "Loan App Fraud", "UPI Scam" |
| is_active | Boolean | true/false | true = showing on all pages |
| created_by | String | any | Admin identifier |
| published_at | Date | any | Set when is_active flips to true |

### Toggle logic (PATCH /api/alerts/:id/toggle)

```javascript
alert.is_active = !alert.is_active;
if (alert.is_active) {
  alert.published_at = new Date();
}
await alert.save();
```

### GET /api/alerts/active query

```javascript
ScamAlert.find({ is_active: true })
  .sort({ createdAt: -1 })
  .limit(3)
```

### Export

```javascript
export const ScamAlert = mongoose.model('ScamAlert', scamAlertSchema);
```

---

## Collection 6 — knowledge_articles

Knowledge Hub articles. Can be written manually by admin or
AI-generated via POST /api/articles/generate (Google Gemini).

### Mongoose Schema

```javascript
const articleSchema = new mongoose.Schema({
  slug: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true
  },
  title: {
    type:     String,
    required: true,
    trim:     true
  },
  category: {
    type:    String,
    enum:    ['phishing', 'upi_fraud', 'social_media', 'banking', 'identity_theft', 'general'],
    default: 'general'
  },
  content_markdown: {
    type:     String,
    required: true
  },
  tags: {
    type:    [String],
    default: []
  },
  views: {
    type:    Number,
    default: 0,
    min:     0
  },
  published_at: {
    type:    Date,
    default: Date.now
  }
}, { timestamps: true });
```

### Indexes for knowledge_articles

```javascript
articleSchema.index({ slug: 1 },     { unique: true });
articleSchema.index({ category: 1 });
articleSchema.index({ views: -1 });
articleSchema.index({ published_at: -1 });
```

### Field Reference

| Field | Type | Allowed Values | Notes |
|-------|------|---------------|-------|
| slug | String | url-safe string | Auto-generated from title — unique URL |
| title | String | any | Article headline |
| category | String | 6 values | Used for filtering in Knowledge Hub |
| content_markdown | String | Markdown | Rendered by react-markdown on frontend |
| tags | Array[String] | any | e.g. ["UPI", "fraud", "prevention"] |
| views | Number | >= 0 | Auto-incremented on each GET request |
| published_at | Date | any | Controls sort order in article list |

### Slug generation logic

```javascript
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
```

### View increment on GET

```javascript
KnowledgeArticle.findOneAndUpdate(
  { slug: req.params.slug },
  { $inc: { views: 1 } },
  { new: true }
);
```

### Export

```javascript
export const KnowledgeArticle = mongoose.model('KnowledgeArticle', articleSchema);
```

---

## Complete models/index.js file

Build this single file containing ALL schemas and exports:

```javascript
import mongoose from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────
const historySchema = new mongoose.Schema({
  status:     { type: String, required: true },
  changed_by: { type: String, default: 'system' },
  note:       { type: String, default: '' },
  timestamp:  { type: Date, default: Date.now }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number
}, { _id: false });

// ── Complaint ─────────────────────────────────────────────────
const complaintSchema = new mongoose.Schema({
  ref_no:             { type: String, required: true, unique: true },
  original_text:      { type: String, required: true, maxlength: 2000 },
  translated_text:    { type: String, default: '' },
  detected_language:  { type: String, enum: ['hindi','hinglish','english'], default: 'english' },
  categories:         { type: [String], required: true },
  severity:           { type: String, enum: ['Critical','High','Medium','Low'], default: 'Medium' },
  department:         { type: String, default: 'Cyber Crime Cell' },
  bns_sections:       { type: [String], default: [] },
  victim_email:       { type: String, required: true, lowercase: true, trim: true },
  victim_name:        { type: String, required: true, trim: true },
  status:             { type: String, enum: ['RECEIVED','ASSIGNED','UNDER_INVESTIGATION','RESOLVED'], default: 'RECEIVED' },
  assigned_officer:   { type: String, default: '' },
  city:               { type: String, default: '' },
  location:           { type: locationSchema, default: () => ({}) },
  evidence_url:       { type: String, default: null },
  escalation_sent:    { type: Boolean, default: false },
  history:            { type: [historySchema], default: [] }
}, { timestamps: true });

complaintSchema.index({ ref_no: 1 },             { unique: true });
complaintSchema.index({ victim_email: 1 });
complaintSchema.index({ status: 1, severity: 1 });
complaintSchema.index({ severity: 1 });
complaintSchema.index({ city: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ location: '2dsphere' });

// ── User ──────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  name:          { type: String, required: true, trim: true },
  role:          { type: String, enum: ['user','admin'], default: 'user' },
  language_pref: { type: String, enum: ['english','hinglish','hindi'], default: 'english' }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

// ── Entity ────────────────────────────────────────────────────
const entitySchema = new mongoose.Schema({
  type:           { type: String, enum: ['phone','upi_id','url','email','bank_account'], required: true },
  value:          { type: String, required: true, trim: true },
  complaint_refs: { type: [String], default: [] },
  count:          { type: Number, default: 1, min: 1 },
  first_seen:     { type: Date, default: Date.now },
  last_seen:      { type: Date, default: Date.now }
}, { timestamps: true });

entitySchema.index({ value: 1, type: 1 }, { unique: true });
entitySchema.index({ count: -1 });

// ── FraudPattern ──────────────────────────────────────────────
const fraudPatternSchema = new mongoose.Schema({
  pattern_id:      { type: String, unique: true },
  entity_type:     { type: String, enum: ['phone','upi_id','url','email','bank_account'], required: true },
  entity_value:    { type: String, required: true },
  complaint_count: { type: Number, default: 0 },
  severity:        { type: String, enum: ['CRITICAL','HIGH','MEDIUM'], default: 'HIGH' },
  status:          { type: String, enum: ['ACTIVE','RESOLVED'], default: 'ACTIVE' },
  complaints:      { type: [String], default: [] }
}, { timestamps: true });

fraudPatternSchema.index({ pattern_id: 1 }, { unique: true });
fraudPatternSchema.index({ entity_value: 1, entity_type: 1 });
fraudPatternSchema.index({ status: 1 });

// ── ScamAlert ─────────────────────────────────────────────────
const scamAlertSchema = new mongoose.Schema({
  title:           { type: String, required: true, maxlength: 100, trim: true },
  description:     { type: String, required: true, maxlength: 300, trim: true },
  severity:        { type: String, enum: ['Critical','High','Medium'], default: 'High' },
  affected_cities: { type: [String], default: [] },
  scam_type:       { type: String, default: '' },
  is_active:       { type: Boolean, default: false },
  created_by:      { type: String, default: 'admin' },
  published_at:    { type: Date, default: null }
}, { timestamps: true });

scamAlertSchema.index({ is_active: 1 });
scamAlertSchema.index({ createdAt: -1 });

// ── KnowledgeArticle ──────────────────────────────────────────
const articleSchema = new mongoose.Schema({
  slug:             { type: String, required: true, unique: true, lowercase: true, trim: true },
  title:            { type: String, required: true, trim: true },
  category:         { type: String, enum: ['phishing','upi_fraud','social_media','banking','identity_theft','general'], default: 'general' },
  content_markdown: { type: String, required: true },
  tags:             { type: [String], default: [] },
  views:            { type: Number, default: 0, min: 0 },
  published_at:     { type: Date, default: Date.now }
}, { timestamps: true });

articleSchema.index({ slug: 1 },        { unique: true });
articleSchema.index({ category: 1 });
articleSchema.index({ views: -1 });

// ── Exports ───────────────────────────────────────────────────
export const Complaint       = mongoose.model('Complaint',       complaintSchema);
export const User            = mongoose.model('User',            userSchema);
export const Entity          = mongoose.model('Entity',          entitySchema);
export const FraudPattern    = mongoose.model('FraudPattern',    fraudPatternSchema);
export const ScamAlert       = mongoose.model('ScamAlert',       scamAlertSchema);
export const KnowledgeArticle = mongoose.model('KnowledgeArticle', articleSchema);
```

---

## Collection Relationships

```
USERS ──────────────────────────────────── COMPLAINTS
  user.email == complaint.victim_email
  One user files many complaints
  Complaints exist even without a user account (no auth required to file)

COMPLAINTS ─────────────────────────────── ENTITIES
  After complaint save → patternDetector.js extracts entities from original_text
  Each extracted entity upserted into entities collection
  complaint.ref_no added to entity.complaint_refs array

ENTITIES ───────────────────────────────── FRAUD_PATTERNS
  When entity.count >= 3 → FraudPattern document created/updated
  All complaint ref_nos stored in fraudPattern.complaints array
  Admin sees fraud pattern alert cards on SOC dashboard
```

---

## Data Flow — What Happens When a Complaint is Filed

```
1. POST /api/complaints/classify receives { text, email, name, city }

2. franc detects language → Google Translate if not English

3. HuggingFace Zephyr 7B classifies → { categories[], severity }

4. bnsMapper.js maps → { bns_sections[], department }

5. nanoid(8) generates → ref_no = "FIR-A3X9K2M1"

6. Complaint.create({
     ref_no,
     original_text:   text,
     translated_text: englishText,
     detected_language,
     categories,
     severity,
     department,
     bns_sections,
     victim_email:    email,
     victim_name:     name,
     city,
     location:        CITY_COORDS[city],
     history: [{ status: 'RECEIVED', changed_by: 'system', note: '...', timestamp: now }]
   })

7. ASYNC (non-blocking): extractAndStoreEntities(text, ref_no)
   → regex extracts entities
   → Entity.findOneAndUpdate() upserts each entity
   → if entity.count >= 3: FraudPattern.findOneAndUpdate() upserts pattern

8. ASYNC (non-blocking): sendWelcomeEmail() + sendFirEmail()

9. Return { ref_no, categories, severity, department, bns_sections, detected_language }
```

---

## MongoDB Atlas Setup Steps

```
1. Go to mongodb.com/atlas → Create free account
2. Create free M0 cluster (any region)
3. Database Access → Add New User → username + password
4. Network Access → Add IP → 0.0.0.0/0 (allow all — for dev/demo)
5. Connect → Drivers → copy connection string
6. Replace <password> in the string with your actual password
7. Add to server/.env as MONGODB_URI
8. Restart server → should print "MongoDB connected"
```

---

## Verification Queries (run in MongoDB Atlas Data Explorer after first complaint)

```javascript
// Count total complaints
db.complaints.countDocuments()

// Find all Critical complaints
db.complaints.find({ severity: 'Critical' })

// Find case by ref_no
db.complaints.findOne({ ref_no: 'FIR-XXXXXXXX' })

// Check entities extracted from complaints
db.entities.find().sort({ count: -1 }).limit(10)

// Check if any fraud patterns detected
db.fraudpatterns.find({ status: 'ACTIVE' })

// Check active scam alerts
db.scamalerts.find({ is_active: true })
```

---

## Summary

```
Total collections:  6
Core collection:    complaints (links to all others)
Auto-populated:     entities, fraud_patterns (by patternDetector.js)
Admin-managed:      scam_alerts, knowledge_articles
Auth:               users

Total indexes:      17 across all collections
Critical indexes:   ref_no (unique), location (2dsphere), victim_email, status+severity
```
