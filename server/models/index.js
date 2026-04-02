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
  victim_phone:       { type: String, default: '' },
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
  phone:         { type: String, default: '' },
  role:          { type: String, enum: ['user','admin'], default: 'user' },
  // Professional Fields for Admin/Inspectors
  rank:           { type: String, default: 'Inspector' },
  badge_id:       { type: String, default: '' },
  department:     { type: String, default: 'Cyber Crime Cell' },
  specialization: { type: String, default: 'General Cybercrime' },
  years_of_service:{ type: Number, default: 0 },
  profile_image:  { type: String, default: '' },
  language_pref: { type: String, enum: ['english','hinglish','hindi'], default: 'english' },
  otp_code:      { type: String, default: null },
  otp_expires_at:{ type: Date, default: null },
  
  // Dynamic Admin Data
  achievements: [{
    title: String,
    description: String,
    date: String,
    time: String,
    icon_type: String // 'Shield', 'BadgeCheck', 'Lock', etc.
  }],
  performance_stats: {
    active_workload: { type: Number, default: 0 },
    avg_response_time: { type: Number, default: 0 }, // in minutes
    intelligence_accuracy: { type: Number, default: 0 }, // percentage
    resolution_rate: { type: Number, default: 0 }, // percentage
    system_uptime: { type: Number, default: 100 }, // percentage
    critical_escalations: { type: Number, default: 0 }
  }
}, { timestamps: true });


userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

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
entitySchema.index({ type: 1 });

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
fraudPatternSchema.index({ complaint_count: -1 });

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
scamAlertSchema.index({ severity: 1 });

// ── KnowledgeArticle ──────────────────────────────────────────
const articleSchema = new mongoose.Schema({
  slug:             { type: String, required: true, unique: true, lowercase: true, trim: true },
  title:            { type: String, required: true, trim: true },
  category:         { type: String, enum: ['phishing','upi_fraud','social_media','banking', 'identity_theft', 'general', 'legal', 'sop', 'threat', 'guide'], default: 'general' },
  content_markdown: { type: String, required: true },
  tags:             { type: [String], default: [] },
  views:            { type: Number, default: 0, min: 0 },
  author_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  author_name:      { type: String, default: 'Anonymous' },
  published_at:     { type: Date, default: Date.now }
}, { timestamps: true });

articleSchema.index({ slug: 1 },        { unique: true });
articleSchema.index({ category: 1 });
articleSchema.index({ views: -1 });
articleSchema.index({ published_at: -1 });

// ── Exports ───────────────────────────────────────────────────
export const Complaint        = mongoose.model('Complaint',        complaintSchema);
export const User             = mongoose.model('User',             userSchema);
export const Entity           = mongoose.model('Entity',           entitySchema);
export const FraudPattern     = mongoose.model('FraudPattern',     fraudPatternSchema);
export const ScamAlert        = mongoose.model('ScamAlert',        scamAlertSchema);
export const KnowledgeArticle = mongoose.model('KnowledgeArticle', articleSchema);
