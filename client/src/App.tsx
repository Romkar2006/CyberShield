import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PageLoader } from './components/shared/PageLoader';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { AuthProvider } from './components/layout/AuthContext';
import { AuthRequiredModal } from './components/shared/AuthRequiredModal';
import { isUserLoggedIn } from './lib/auth';

const CitizenProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  if (!isUserLoggedIn()) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
};

// Public & Citizen Pages
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const HowItWorks = lazy(() => import('./pages/HowItWorks').then(m => ({ default: m.HowItWorks })));
const Helplines = lazy(() => import('./pages/Helplines').then(m => ({ default: m.Helplines })));
const KnowledgeHub = lazy(() => import('./pages/KnowledgeHub').then(m => ({ default: m.KnowledgeHub })));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail').then(m => ({ default: m.ArticleDetail })));
const PublicStatus = lazy(() => import('./pages/PublicStatus').then(m => ({ default: m.PublicStatus })));
const FileComplaint = lazy(() => import('./pages/FileComplaint').then(m => ({ default: m.FileComplaint })));
const FirResult = lazy(() => import('./pages/FirResult').then(m => ({ default: m.FirResult })));
const CaseTracker = lazy(() => import('./pages/CaseTracker').then(m => ({ default: m.CaseTracker })));
const MyComplaints = lazy(() => import('./pages/MyComplaints').then(m => ({ default: m.MyComplaints })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminSetup = lazy(() => import('./pages/AdminSetup').then(m => ({ default: m.AdminSetup })));
const UserDashboard = lazy(() => import('./pages/UserDashboard').then(m => ({ default: m.UserDashboard })));
const VoiceAssistant = lazy(() => import('./pages/VoiceAssistant').then(m => ({ default: m.VoiceAssistant })));

import { SocAnalytics } from './pages/SocAnalytics';


// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminCases = lazy(() => import('./pages/AdminCases').then(m => ({ default: m.AdminCases })));
const AdminCaseDetail = lazy(() => import('./pages/AdminCaseDetail').then(m => ({ default: m.AdminCaseDetail })));
// const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const CrimeHeatmap = lazy(() => import('./pages/CrimeHeatmap').then(m => ({ default: m.CrimeHeatmap })));
const FraudNetwork = lazy(() => import('./pages/FraudNetwork').then(m => ({ default: m.FraudNetwork })));
const AdminAlerts = lazy(() => import('./pages/AdminAlerts').then(m => ({ default: m.AdminAlerts })));
const AdminArticles = lazy(() => import('./pages/AdminArticles').then(m => ({ default: m.AdminArticles })));
const AdminProfile = lazy(() => import('./pages/AdminProfile').then(m => ({ default: m.AdminProfile })));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AuthRequiredModal />
            <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public and Citizen Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/setup" element={<AdminSetup />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/helplines" element={<Helplines />} />
              <Route path="/hub" element={<KnowledgeHub />} />
              <Route path="/hub/:slug" element={<ArticleDetail />} />
              <Route path="/assistant" element={<VoiceAssistant />} />
              <Route path="/status" element={<PublicStatus />} />

              
              <Route path="/complaint" element={<CitizenProtectedRoute><FileComplaint /></CitizenProtectedRoute>} />
              <Route path="/result" element={<CitizenProtectedRoute><FirResult /></CitizenProtectedRoute>} />
              <Route path="/track/:ref_no" element={<CaseTracker />} />
              <Route path="/my-complaints" element={<CitizenProtectedRoute><MyComplaints /></CitizenProtectedRoute>} />
              <Route path="/notifications" element={<CitizenProtectedRoute><Notifications /></CitizenProtectedRoute>} />
              <Route path="/profile" element={<CitizenProtectedRoute><UserProfile /></CitizenProtectedRoute>} />
              <Route path="/dashboard" element={<CitizenProtectedRoute><UserDashboard /></CitizenProtectedRoute>} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/cases" element={<AdminCases />} />
              <Route path="/admin/case/:ref" element={<AdminCaseDetail />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/analytics" element={<SocAnalytics />} />
              <Route path="/heatmap" element={<CrimeHeatmap />} />
              <Route path="/fraud-network" element={<FraudNetwork />} />
              <Route path="/admin/alerts" element={<AdminAlerts />} />
              <Route path="/admin/articles" element={<AdminArticles />} />
            </Route>
          </Routes>
        </Suspense>
        </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
