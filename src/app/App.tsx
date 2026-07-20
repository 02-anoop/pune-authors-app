import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { lazy, Suspense, useState, useEffect } from "react";
import { BlockedScreen } from "./components/BlockedScreen";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { useLocation } from "react-router";

// Lazy-loaded Pages
const LandingPage = lazy(() => import("./components/LandingPage").then(module => ({ default: module.LandingPage })));
const AuthorLandingPage = lazy(() => import("./components/AuthorLandingPage").then(module => ({ default: module.AuthorLandingPage })));
const CataloguePage = lazy(() => import("./components/CataloguePage").then(module => ({ default: module.CataloguePage })));
const CheckoutPage = lazy(() => import("./components/CheckoutPage").then(module => ({ default: module.CheckoutPage })));
const BulkCheckoutPage = lazy(() => import("./components/BulkCheckoutPage").then(module => ({ default: module.BulkCheckoutPage })));
const AuthorRegistrationPage = lazy(() => import("./components/AuthorRegistrationPage").then(module => ({ default: module.AuthorRegistrationPage })));
const AuthorOnboardingWizard = lazy(() => import("./components/AuthorOnboardingWizard").then(module => ({ default: module.AuthorOnboardingWizard })));
const AuthorDashboardPage = lazy(() => import("./components/AuthorDashboardPage").then(module => ({ default: module.AuthorDashboardPage })));
const OperationsDashboardPage = lazy(() => import("./components/OperationsDashboardPage").then(module => ({ default: module.OperationsDashboardPage })));
const GoaCafePage = lazy(() => import("./components/GoaCafePage").then(module => ({ default: module.GoaCafePage })));
const AboutPage = lazy(() => import("./components/AboutPage").then(module => ({ default: module.AboutPage })));
const ServicesPage = lazy(() => import("./components/ServicesPage").then(module => ({ default: module.ServicesPage })));
const AuthPage = lazy(() => import("./components/AuthPage").then(module => ({ default: module.AuthPage })));
const CustomerProfilePage = lazy(() => import("./components/CustomerProfilePage").then(module => ({ default: module.CustomerProfilePage })));
const EventsPage = lazy(() => import("./components/EventsPage").then(module => ({ default: module.EventsPage })));
const EventCataloguePage = lazy(() => import("./components/EventCataloguePage").then(module => ({ default: module.EventCataloguePage })));
const EventLogPage = lazy(() => import("./components/EventLogPage").then(module => ({ default: module.EventLogPage })));
const ContactPage = lazy(() => import("./components/ContactPage").then(module => ({ default: module.ContactPage })));
const BookDetailPage = lazy(() => import("./components/BookDetailPage").then(module => ({ default: module.BookDetailPage })));
const FlybrariesPage = lazy(() => import("./components/FlybrariesPage").then(module => ({ default: module.FlybrariesPage })));
const OrganizeEventPage = lazy(() => import("./components/OrganizeEventPage").then(module => ({ default: module.OrganizeEventPage })));
const OrganizerLandingPage = lazy(() => import("./components/OrganizerLandingPage").then(module => ({ default: module.OrganizerLandingPage })));
const BrowseAuthorsPage = lazy(() => import("./components/BrowseAuthorsPage").then(module => ({ default: module.BrowseAuthorsPage })));
const AuthorPublicProfilePage = lazy(() => import("./components/AuthorPublicProfilePage").then(module => ({ default: module.AuthorPublicProfilePage })));

{/* MARKER-MAKE-KIT-INVOKED */}

// A simple loading spinner to show during chunk fetching
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#666' }}>
    Loading page...
  </div>
);

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/operations');

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)" }}>
      {!isDashboard && <NavBar />}
      <div style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/authors" element={<AuthorLandingPage />} />
            <Route path="/authors/organize-event" element={<OrganizeEventPage />} />
            <Route path="/organizers" element={<OrganizerLandingPage />} />
            <Route path="/organizers/organize-event" element={<OrganizeEventPage />} />
            <Route path="/invite-authors" element={<BrowseAuthorsPage />} />
            <Route path="/invite-authors/:id" element={<AuthorPublicProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/bulk-checkout" element={<BulkCheckoutPage />} />
            <Route path="/register" element={<AuthorOnboardingWizard />} />
            <Route path="/login" element={<AuthPage type="login" />} />
            <Route path="/signup" element={<AuthPage type="signup" />} />
            <Route path="/dashboard/*" element={<AuthorDashboardPage />} />
            <Route path="/operations/*" element={<OperationsDashboardPage />} />
            <Route path="/profile" element={<CustomerProfilePage />} />
            <Route path="/book-cafe" element={<GoaCafePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/flybraries" element={<FlybrariesPage />} />
            <Route path="/events/:eventId/catalogue" element={<EventCataloguePage />} />
            <Route path="/gallery" element={<EventLogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
          </Routes>
        </Suspense>
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default function App() {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const handleBlock = () => setIsBlocked(true);
    window.addEventListener('rate-limit-exceeded', handleBlock);
    return () => window.removeEventListener('rate-limit-exceeded', handleBlock);
  }, []);

  if (isBlocked) {
    return <BlockedScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
