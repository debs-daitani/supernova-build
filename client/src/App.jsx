import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// Layout
import Layout from './components/shared/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Main Pages
import Dashboard from './pages/dashboard/Dashboard';
import Chat from './pages/dashboard/Chat';
import Profile from './pages/dashboard/Profile';

// Marketplace
import MarketplaceBrowse from './pages/marketplace/MarketplaceBrowse';
import ListingDetail from './pages/marketplace/ListingDetail';
import CreateListing from './pages/marketplace/CreateListing';
import SellerDashboard from './pages/marketplace/SellerDashboard';

// Community
import CommunityHome from './pages/community/CommunityHome';
import PostDetail from './pages/community/PostDetail';
import CreatePost from './pages/community/CreatePost';
import MemberDirectory from './pages/community/MemberDirectory';

// Messages
import Messages from './pages/dashboard/Messages';

// Content
import ContentLibrary from './pages/dashboard/ContentLibrary';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentUpload from './pages/admin/ContentUpload';

// Phase 2D - User Empowerment Tools
import QuizBuilder from './pages/tools/QuizBuilder';
import LinksPage from './pages/tools/LinksPage';
import ShortLinks from './pages/tools/ShortLinks';
import BrandHub from './pages/tools/BrandHub';

// Error Pages
import NotFound from './pages/errors/NotFound';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
      } />
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />
      } />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<MarketplaceBrowse />} />
        <Route path="/marketplace/:id" element={<ListingDetail />} />
        <Route path="/marketplace/create" element={<CreateListing />} />
        <Route path="/marketplace/my-listings" element={<SellerDashboard />} />

        {/* Community */}
        <Route path="/community" element={<CommunityHome />} />
        <Route path="/community/posts/:id" element={<PostDetail />} />
        <Route path="/community/create-post" element={<CreatePost />} />
        <Route path="/community/members" element={<MemberDirectory />} />

        {/* Content */}
        <Route path="/content" element={<ContentLibrary />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/content/upload" element={<ContentUpload />} />

        {/* Phase 2D - User Empowerment Tools */}
        <Route path="/tools/quiz-builder" element={<QuizBuilder />} />
        <Route path="/tools/links-page" element={<LinksPage />} />
        <Route path="/tools/short-links" element={<ShortLinks />} />
        <Route path="/tools/brand-hub" element={<BrandHub />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
