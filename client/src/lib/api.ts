import axios from 'axios';
import {
  ComplaintPayload,
  ClassifyResponse,
  StatusUpdatePayload,
  Complaint,
  DashboardData,
  AnalyticsData,
  HeatmapPoint,
  ScamAlert,
  AlertPayload,
  Article,
  ArticlePayload,
  ArticleQueryParams,
  ChatMessage,
  AdminLoginResponse
} from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE });

// Add JWT token to admin or user requests automatically
api.interceptors.request.use(config => {
  const adminToken = localStorage.getItem('cybershield_admin_token');
  const userToken = localStorage.getItem('cybershield_user_token');
  
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

export const classifyComplaint = (data: ComplaintPayload) =>
  api.post<ClassifyResponse>('/api/complaints/classify', data);

export const getCaseStatus = (ref_no: string) =>
  api.get<Complaint>(`/api/complaints/${ref_no}`);

export const updateCaseStatus = (data: StatusUpdatePayload) =>
  api.post<Complaint>('/api/complaints/update', data);

export const getDashboard = () =>
  api.get<DashboardData>('/api/admin/dashboard');

export const getAnalytics = () =>
  api.get<AnalyticsData>('/api/analytics');

export const getHeatmapData = () =>
  api.get<HeatmapPoint[]>('/api/heatmap');

export const getActiveAlerts = () =>
  api.get<ScamAlert[]>('/api/alerts/active');

export const getAllAlerts = () =>
  api.get<ScamAlert[]>('/api/alerts');

export const createAlert = (data: AlertPayload) =>
  api.post<ScamAlert>('/api/alerts', data);

export const toggleAlert = (id: string) =>
  api.patch<ScamAlert>(`/api/alerts/${id}/toggle`);

export const getArticles = (params?: ArticleQueryParams) =>
  api.get<{ articles: Article[], total: number }>('/api/articles', { params });

export const getArticle = (slug: string) =>
  api.get<Article>(`/api/articles/${slug}`);

export const createArticle = (data: ArticlePayload) =>
  api.post<Article>('/api/articles', data);

export const generateArticle = (topic: string) =>
  api.post<{ content: string; imageUrl?: string }>('/api/articles/generate', { topic });

export const uploadArticleImage = (imageOrBase64: string) =>
  api.post<{ imageUrl: string }>('/api/articles/upload-image', { image: imageOrBase64 });

export const deleteArticle = (id: string) =>
  api.delete<{ message: string }>(`/api/articles/${id}`);

export const updateArticle = (id: string, data: ArticlePayload) =>
  api.put<Article>(`/api/articles/${id}`, data);

export const chatWithBot = (data: {
  message: string;
  history?: Array<{ role: string; content: string }>;
}) => api.post<{ reply: string }>('/api/chat', data);

export const checkAdminSetup = () => 
  api.get<{ setupRequired: boolean }>('/api/admin/setup-check');

export const setupAdminRequest = (data: { email: string; badgeId: string }) => 
  api.post<{ success: boolean; message: string }>('/api/admin/setup/request', data);

export const setupAdminVerify = (data: { email: string; badgeId: string; otp_code: string }) => 
  api.post<{ success: boolean; message: string }>('/api/admin/setup/verify', data);

export const adminLoginRequest = (data: { email: string; badgeId: string }) =>
  api.post<{ success: boolean; message: string }>('/api/admin/login/request', data);

export const adminLoginVerify = (data: { email: string; badgeId: string; otp_code: string }) =>
  api.post<AdminLoginResponse>('/api/admin/login/verify', data);

export const userLogin = (data: any) =>
  api.post('/api/auth/login', data);

export const userRegister = (data: any) =>
  api.post('/api/auth/register', data);

export const getComplaints = (params: any) =>
  api.get('/api/complaints/all', { params });

export const forgotPassword = (data: { email: string }) =>
  api.post('/api/auth/forgot-password', data);

export const resetPassword = (data: { email: string, otp_code: string, newPassword: string }) =>
  api.post('/api/auth/reset-password', data);

export const getUserProfile = () =>
  api.get('/api/auth/me');

export const updateUserProfile = (data: { name?: string; phone?: string; language_pref?: string }) =>
  api.post('/api/auth/update-profile', data);

export const getGlobalNews = () =>
  api.get<any[]>('/api/news/global');

export const getMyCases = () =>
  api.get<Complaint[]>('/api/complaints/user/my-cases');

export const getMyArticles = () =>
  api.get<Article[]>('/api/articles/mine');
