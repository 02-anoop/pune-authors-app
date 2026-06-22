import { BrowserRouter, Routes, Route } from "react-router";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { ChannelsPage } from "./components/ChannelsPage";
import { CataloguePage } from "./components/CataloguePage";
import { CheckoutPage } from "./components/CheckoutPage";
import { AuthorRegistrationPage } from "./components/AuthorRegistrationPage";
import { AuthorDashboardPage } from "./components/AuthorDashboardPage";
import { OperationsDashboardPage } from "./components/OperationsDashboardPage";
import { GoaCafePage } from "./components/GoaCafePage";
import { AboutPage } from "./components/AboutPage";
import { ServicesPage } from "./components/ServicesPage";
import { AuthPage } from "./components/AuthPage";
import { CustomerProfilePage } from "./components/CustomerProfilePage";
import { EventsPage } from "./components/EventsPage";
import { EventLogPage } from "./components/EventLogPage";
import { ContactPage } from "./components/ContactPage";
import { ScrollToTop } from "./components/ScrollToTop";

{/* MARKER-MAKE-KIT-INVOKED */}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)" }}>
        <NavBar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/register" element={<AuthorRegistrationPage />} />
            <Route path="/login" element={<AuthPage type="login" />} />
            <Route path="/signup" element={<AuthPage type="signup" />} />
            <Route path="/dashboard" element={<AuthorDashboardPage />} />
            <Route path="/operations" element={<OperationsDashboardPage />} />
            <Route path="/profile" element={<CustomerProfilePage />} />
            <Route path="/book-cafe" element={<GoaCafePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/gallery" element={<EventLogPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
