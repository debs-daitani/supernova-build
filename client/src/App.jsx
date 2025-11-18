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

// Phase 2F - Chatbot Builder
import ChatbotDashboard from './pages/tools/ChatbotDashboard';
import ChatbotBuilder from './pages/tools/ChatbotBuilder';
import ChatbotSettings from './pages/tools/ChatbotSettings';
import ChatbotAnalytics from './pages/tools/ChatbotAnalytics';

// Phase 2F Addendum - Social Media Automation
import SocialAutomation from './pages/tools/SocialAutomation';

// Phase 2G - Website Builder
import WebsitesDashboard from './pages/tools/WebsitesDashboard';
import WebsiteBuilder from './pages/tools/WebsiteBuilder';
import WebsiteSettings from './pages/tools/WebsiteSettings';

// Phase 2H - CRM + Accounting + Financial Tools
import CRMDashboard from './pages/tools/CRMDashboard';
import Contacts from './pages/tools/Contacts';
import ContactDetail from './pages/tools/ContactDetail';
import Pipeline from './pages/tools/Pipeline';
import Tasks from './pages/tools/Tasks';
import AccountingDashboard from './pages/tools/AccountingDashboard';
import Invoices from './pages/tools/Invoices';
import CreateInvoice from './pages/tools/CreateInvoice';
import Expenses from './pages/tools/Expenses';
import Reports from './pages/tools/Reports';
import Calculators from './pages/tools/Calculators';

// Phase 2I - E-Commerce Shop
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopProducts from './pages/shop/ShopProducts';

// Phase 2P - Task & Project Management
import TasksDashboard from './pages/tasks/TasksDashboard';
import Projects from './pages/tasks/Projects';
import Habits from './pages/tasks/Habits';
import Goals from './pages/tasks/Goals';

// Phase 2E - Content Creation Suite
import ContentDashboard from './pages/content/ContentDashboard';

// Phase 2M - Video Tools Suite
import VideoDashboard from './pages/video/VideoDashboard';
import ScriptGenerator from './pages/video/ScriptGenerator';
import VideoLibrary from './pages/video/VideoLibrary';

// Phase 2N - AI Content Generator
import ContentAIDashboard from './pages/content-ai/ContentAIDashboard';
import BlogGenerator from './pages/content-ai/BlogGenerator';
import QuickGenerator from './pages/content-ai/QuickGenerator';
import ContentRepurpose from './pages/content-ai/ContentRepurpose';
import WritingAssistant from './pages/content-ai/WritingAssistant';

// Phase 2AS - Messaging Platform
import MessagingDashboard from './pages/messaging/MessagingDashboard';

// Phase 2J - Events Platform
import EventsDashboard from './pages/events/EventsDashboard';
import EventCalendar from './pages/events/EventCalendar';

// Phase 2O - Legal Templates + Launch Toolkit
import LegalDashboard from './pages/legal/LegalDashboard';
import LegalGenerator from './pages/legal/LegalGenerator';
import LaunchDashboard from './pages/launch/LaunchDashboard';
import CreateLaunch from './pages/launch/CreateLaunch';
import LaunchChecklist from './pages/launch/LaunchChecklist';

// Phase 2AC - Image Editor
import ImageProjects from './pages/image-editor/ImageProjects';

// Phase 2AE - Video Editor
import VideoProjects from './pages/video-editor/VideoProjects';

// Phase 2AF - PDF Editor
import PDFDashboard from './pages/pdf-editor/PDFDashboard';

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

        {/* Phase 2F - Chatbot Builder */}
        <Route path="/tools/chatbot-dashboard" element={<ChatbotDashboard />} />
        <Route path="/tools/chatbot-builder/:id" element={<ChatbotBuilder />} />
        <Route path="/tools/chatbot-settings/:id" element={<ChatbotSettings />} />
        <Route path="/tools/chatbot-analytics/:id" element={<ChatbotAnalytics />} />

        {/* Phase 2F Addendum - Social Media Automation */}
        <Route path="/tools/social-automation" element={<SocialAutomation />} />

        {/* Phase 2G - Website Builder */}
        <Route path="/tools/websites" element={<WebsitesDashboard />} />
        <Route path="/tools/websites/:websiteId/builder" element={<WebsiteBuilder />} />
        <Route path="/tools/websites/:websiteId/settings" element={<WebsiteSettings />} />

        {/* Phase 2H - CRM + Accounting + Financial Tools */}
        <Route path="/tools/crm" element={<CRMDashboard />} />
        <Route path="/tools/crm/contacts" element={<Contacts />} />
        <Route path="/tools/crm/contacts/:id" element={<ContactDetail />} />
        <Route path="/tools/crm/pipeline" element={<Pipeline />} />
        <Route path="/tools/crm/tasks" element={<Tasks />} />
        <Route path="/tools/accounting" element={<AccountingDashboard />} />
        <Route path="/tools/accounting/invoices" element={<Invoices />} />
        <Route path="/tools/accounting/invoices/new" element={<CreateInvoice />} />
        <Route path="/tools/accounting/invoices/:id" element={<CreateInvoice />} />
        <Route path="/tools/accounting/expenses" element={<Expenses />} />
        <Route path="/tools/accounting/reports" element={<Reports />} />
        <Route path="/tools/accounting/calculators" element={<Calculators />} />

        {/* Phase 2I - E-Commerce Shop */}
        <Route path="/shop" element={<ShopDashboard />} />
        <Route path="/shop/products" element={<ShopProducts />} />

        {/* Phase 2P - Task & Project Management */}
        <Route path="/tasks" element={<TasksDashboard />} />
        <Route path="/tasks/inbox" element={<TasksDashboard />} />
        <Route path="/tasks/today" element={<TasksDashboard />} />
        <Route path="/tasks/projects" element={<Projects />} />
        <Route path="/tasks/projects/:projectId" element={<Projects />} />
        <Route path="/tasks/habits" element={<Habits />} />
        <Route path="/tasks/goals" element={<Goals />} />

        {/* Phase 2E - Content Creation Suite */}
        <Route path="/content-creation" element={<ContentDashboard />} />

        {/* Phase 2M - Video Tools Suite */}
        <Route path="/video" element={<VideoDashboard />} />
        <Route path="/video/script-generator" element={<ScriptGenerator />} />
        <Route path="/video/library" element={<VideoLibrary />} />

        {/* Phase 2N - AI Content Generator */}
        <Route path="/content-ai" element={<ContentAIDashboard />} />
        <Route path="/content-ai/blog" element={<BlogGenerator />} />
        <Route path="/content-ai/:type" element={<QuickGenerator />} />
        <Route path="/content-ai/repurpose" element={<ContentRepurpose />} />
        <Route path="/content-ai/assistant" element={<WritingAssistant />} />

        {/* Phase 2AS - Messaging Platform */}
        <Route path="/messaging" element={<MessagingDashboard />} />

        {/* Phase 2J - Events Platform */}
        <Route path="/events" element={<EventsDashboard />} />
        <Route path="/events/calendar" element={<EventCalendar />} />

        {/* Phase 2O - Legal Templates + Launch Toolkit */}
        <Route path="/legal" element={<LegalDashboard />} />
        <Route path="/legal/generate/:type" element={<LegalGenerator />} />
        <Route path="/launch" element={<LaunchDashboard />} />
        <Route path="/launch/create" element={<CreateLaunch />} />
        <Route path="/launch/:id" element={<LaunchChecklist />} />

        {/* Phase 2AC - Image Editor */}
        <Route path="/image-editor" element={<ImageProjects />} />

        {/* Phase 2AE - Video Editor */}
        <Route path="/video-editor" element={<VideoProjects />} />

        {/* Phase 2AF - PDF Editor */}
        <Route path="/pdf-editor" element={<PDFDashboard />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
