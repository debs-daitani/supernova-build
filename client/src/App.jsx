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

// Phase 2AG - Document Editor
import DocumentsDashboard from './pages/docs/DocumentsDashboard';

// Phase 2AH - Spreadsheet Editor
import SpreadsheetsDashboard from './pages/sheets/SpreadsheetsDashboard';

// Phase 2AI - Presentation Editor
import PresentationsDashboard from './pages/presentations/PresentationsDashboard';

// Phase 2AJ - Forms Builder
import FormsDashboard from './pages/forms/FormsDashboard';

// Phase 2AK - Cloud Storage
import MyDrive from './pages/storage/MyDrive';

// Phase 2AL - Social Media Platform
import Feed from './pages/social/Feed';

// Phase 2AM - Video Platform
import VideoHome from './pages/videos/VideoHome';
import Shorts from './pages/videos/Shorts';
import Watch from './pages/videos/Watch';

// Phase 2AN - Microblogging Platform
import Timeline from './pages/micro/Timeline';
import MicroProfile from './pages/micro/Profile';
import Explore from './pages/micro/Explore';

// Phase 2AT - Demo Video & Screen Recording
import VideoGallery from './pages/demos/VideoGallery';
import VideoPlayer from './pages/demos/VideoPlayer';
import ScreenRecorder from './pages/tools/ScreenRecorder';
import MyRecordings from './pages/tools/MyRecordings';
import DemoVideosAdmin from './pages/admin/DemoVideos';

// Phase 2AU - Launch Assets & Comparisons
import ComparisonChart from './pages/compare/ComparisonChart';
import ROICalculator from './pages/compare/ROICalculator';
import ComparisonsAdmin from './pages/admin/Comparisons';

// Phase 2AV - Testimonial Collection System
import SubmitTestimonial from './pages/testimonials/Submit';
import TestimonialWall from './pages/testimonials/Wall';
import TestimonialsAdmin from './pages/admin/TestimonialsAdmin';

// Phase 2AW - Referral Program
import ReferralDashboard from './pages/referral/Dashboard';
import HowItWorks from './pages/referral/HowItWorks';
import Leaderboard from './pages/referral/Leaderboard';
import Rewards from './pages/referral/Rewards';
import ReferralAnalytics from './pages/admin/ReferralAnalytics';

// Phase 2AX - Onboarding Flow
import Tutorials from './pages/onboarding/Tutorials';

// Phase 2AZ - Email Automation Sequences
import EmailSequences from './components/admin/EmailSequences';
import EmailSequenceEditor from './components/admin/EmailSequenceEditor';

// Phase 2BA - Landing Page System
import LandingPagesDashboard from './pages/landingPages/Dashboard';
import LandingPageTemplates from './pages/landingPages/Templates';
import LandingPageBuilder from './pages/landingPages/Builder';
import LandingPageAnalytics from './pages/landingPages/Analytics';

// Phase 2BB - Signup Flow Builder
import SignupFlowsDashboard from './pages/signupFlows/Dashboard';
import SignupFlowBuilder from './pages/signupFlows/Builder';

// Phase 2BC - Checkout Pages
import CheckoutDashboard from './pages/checkout/Dashboard';
import CheckoutBuilder from './pages/checkout/Builder';
import Coupons from './pages/checkout/Coupons';
import Orders from './pages/checkout/Orders';

// Phase 2BD - Thank You Pages
import ThankYouPagesDashboard from './pages/thankYouPages/Dashboard';
import ThankYouPageBuilder from './pages/thankYouPages/Builder';

// Phase 2BF - Signup Flow
import SignupFlow from './pages/signup/SignupFlow';
import SignupSuccess from './pages/signup/SignupSuccess';
import VerifyEmail from './pages/signup/VerifyEmail';

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
        isAuthenticated ? <Navigate to="/dashboard" /> : <SignupFlow />
      } />

      {/* Phase 2BF - Signup Flow (Public) */}
      <Route path="/signup/success" element={<SignupSuccess />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

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

        {/* Phase 2AG - Document Editor */}
        <Route path="/docs" element={<DocumentsDashboard />} />

        {/* Phase 2AH - Spreadsheet Editor */}
        <Route path="/sheets" element={<SpreadsheetsDashboard />} />

        {/* Phase 2AI - Presentation Editor */}
        <Route path="/presentations" element={<PresentationsDashboard />} />

        {/* Phase 2AJ - Forms Builder */}
        <Route path="/forms" element={<FormsDashboard />} />

        {/* Phase 2AK - Cloud Storage */}
        <Route path="/storage" element={<MyDrive />} />

        {/* Phase 2AL - Social Media Platform */}
        <Route path="/social" element={<Feed />} />

        {/* Phase 2AM - Video Platform */}
        <Route path="/videos" element={<VideoHome />} />
        <Route path="/videos/shorts" element={<Shorts />} />
        <Route path="/videos/watch/:id" element={<Watch />} />

        {/* Phase 2AN - Microblogging Platform */}
        <Route path="/micro" element={<Timeline />} />
        <Route path="/micro/profile/:userId" element={<MicroProfile />} />
        <Route path="/micro/explore" element={<Explore />} />

        {/* Phase 2AT - Demo Video & Screen Recording */}
        <Route path="/tools/screen-recorder" element={<ScreenRecorder />} />
        <Route path="/tools/screen-recorder/recordings" element={<MyRecordings />} />
        <Route path="/testimonials/submit" element={<SubmitTestimonial />} />

        {/* Admin - Demo Videos */}
        <Route path="/admin/demo-videos" element={<DemoVideosAdmin />} />
        <Route path="/admin/testimonials" element={<TestimonialsAdmin />} />

        {/* Admin - Comparisons */}
        <Route path="/admin/comparisons" element={<ComparisonsAdmin />} />

        {/* Phase 2AW - Referral Program */}
        <Route path="/referrals" element={<ReferralDashboard />} />
        <Route path="/referrals/rewards" element={<Rewards />} />

        {/* Admin - Referrals */}
        <Route path="/admin/referrals" element={<ReferralAnalytics />} />

        {/* Phase 2AZ - Email Automation Sequences */}
        <Route path="/admin/email-sequences" element={<EmailSequences />} />
        <Route path="/admin/email-sequences/:id" element={<EmailSequenceEditor />} />

        {/* Phase 2BA - Landing Page System */}
        <Route path="/landing-pages" element={<LandingPagesDashboard />} />
        <Route path="/landing-pages/templates" element={<LandingPageTemplates />} />
        <Route path="/landing-pages/:id/builder" element={<LandingPageBuilder />} />
        <Route path="/landing-pages/:id/analytics" element={<LandingPageAnalytics />} />

        {/* Phase 2BB - Signup Flow Builder */}
        <Route path="/signup-flows" element={<SignupFlowsDashboard />} />
        <Route path="/signup-flows/:id/builder" element={<SignupFlowBuilder />} />

        {/* Phase 2BC - Checkout Pages */}
        <Route path="/checkout" element={<CheckoutDashboard />} />
        <Route path="/checkout/:id/builder" element={<CheckoutBuilder />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/orders" element={<Orders />} />

        {/* Phase 2BD - Thank You Pages */}
        <Route path="/thank-you-pages" element={<ThankYouPagesDashboard />} />
        <Route path="/thank-you-pages/:id/builder" element={<ThankYouPageBuilder />} />

        {/* Phase 2AX - Onboarding Flow */}
        <Route path="/tutorials" element={<Tutorials />} />
      </Route>

      {/* Public Demo Video Routes (Outside protected routes) */}
      <Route path="/demos" element={<VideoGallery />} />
      <Route path="/demos/watch/:id" element={<VideoPlayer />} />

      {/* Public Comparison Routes (Outside protected routes) */}
      <Route path="/compare" element={<ComparisonChart />} />
      <Route path="/compare/calculator" element={<ROICalculator />} />

      {/* Public Testimonial Routes (Outside protected routes) */}
      <Route path="/testimonials/wall" element={<TestimonialWall />} />

      {/* Public Referral Routes (Outside protected routes) */}
      <Route path="/referrals/how-it-works" element={<HowItWorks />} />
      <Route path="/referrals/leaderboard" element={<Leaderboard />} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
