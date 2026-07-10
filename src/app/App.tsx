import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { CataloguePage } from "./components/CataloguePage";
import { CheckoutPage } from "./components/CheckoutPage";
import { AuthorRegistrationPage } from "./components/AuthorRegistrationPage";
import { AuthorOnboardingWizard } from "./components/AuthorOnboardingWizard";
import { AuthorDashboardPage } from "./components/AuthorDashboardPage";
import { OperationsDashboardPage } from "./components/OperationsDashboardPage";
import { GoaCafePage } from "./components/GoaCafePage";
import { AboutPage } from "./components/AboutPage";
import { ServicesPage } from "./components/ServicesPage";
import { AuthPage } from "./components/AuthPage";
import { CustomerProfilePage } from "./components/CustomerProfilePage";
import { EventsPage } from "./components/EventsPage";
import { EventCataloguePage } from "./components/EventCataloguePage";
import { EventLogPage } from "./components/EventLogPage";
import { ContactPage } from "./components/ContactPage";
import { ScrollToTop } from "./components/ScrollToTop";
import { BookDetailPage } from "./components/BookDetailPage";
import { FlybrariesPage } from "./components/FlybrariesPage";

{/* MARKER-MAKE-KIT-INVOKED */}

import { useLocation } from "react-router";

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/operations');

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)" }}>
      {!isDashboard && <NavBar />}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
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
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
