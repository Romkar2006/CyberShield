export type CaseStatus = 'RECEIVED' | 'ASSIGNED' | 'UNDER_INVESTIGATION' | 'RESOLVED';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type SeverityUpper = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Location {
  lat: number;
  lng: number;
}

export interface HistoryEntry {
  status: CaseStatus;
  changed_by: string;
  officer?: string;
  note: string;
  timestamp: string;
}

export interface ComplaintPayload {
  text: string;
  email: string;
  name: string;
  city: string;
  phone?: string;
  evidence_url?: string;
}

export interface Complaint {
  _id: string;
  ref_no: string;
  original_text: string;
  translated_text: string;
  detected_language: string;
  categories: string[];
  severity: Severity;
  department: string;
  bns_sections: string[];
  victim_name: string;
  victim_email?: string;
  victim_phone?: string;
  status: CaseStatus;
  assigned_officer: string;
  city: string;
  location?: Location;
  escalation_sent: boolean;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassifyResponse extends Complaint {
  confidence: string;
  victim_guidance: string[];
  email_sent: boolean;
}

export interface StatusUpdatePayload {
  ref_no: string;
  status: CaseStatus;
  assigned_officer: string;
  department?: string;
  note: string;
}

export interface FraudPattern {
  pattern_id: string;
  entity_type: string;
  entity_value: string;
  complaint_count: number;
  severity: SeverityUpper;
  status?: 'ACTIVE' | 'RESOLVED';
  complaints?: string[];
}

export interface DashboardStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
}

export interface DashboardData {
  complaints: Complaint[];
  stats: DashboardStats;
  patterns: FraudPattern[];
}

export interface AnalyticsData {
  categories: { name: string; count: number }[];
  monthly: { month: string; count: number }[];
  severity: { level: Severity; count: number }[];
  cities: { city: string; count: number }[];
  trend: number;
}

export interface HeatmapPoint {
  city: string;
  lat: number;
  lng: number;
  count: number;
}

export interface ScamAlert {
  _id: string;
  title: string;
  description: string;
  severity: Severity;
  affected_cities: string[];
  scam_type: string;
  is_active: boolean;
  created_by?: string;
  published_at?: string;
}

export interface AlertPayload {
  title: string;
  description: string;
  severity: Severity;
  affected_cities: string[];
  scam_type: string;
}

export interface Article {
  _id?: string;
  slug: string;
  title: string;
  category: string;
  content_markdown?: string;
  image_url?: string;
  tags: string[];
  published_at?: string;
  views: number;
  author_name?: string;
  author_email?: string;
}

export interface ArticlePayload {
  title: string;
  category: string;
  content_markdown: string;
  image_url?: string;
  tags: string[];
}

export interface ArticleQueryParams {
  category?: string;
  limit?: number;
  page?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdminLoginResponse {
  token: string;
  expires_in: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  rank?: string;
  badge_id?: string;
  department?: string;
  specialization?: string;
  years_of_service?: number;
  profile_image?: string;
  language_pref?: 'english' | 'hindi' | 'hinglish';
  createdAt: string;
}
