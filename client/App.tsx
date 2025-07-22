import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./global.css";
import Index from "./pages/Index";
import StudentApp from "./pages/StudentApp";
import CompanyPortal from "./pages/CompanyPortal";
import { SignUpForm, SignInForm } from "./pages/StudentAuth";
import StudentProfileSetup from "./pages/StudentProfileSetup";
import NotFound from "./pages/NotFound";
import Debug from "./pages/Debug";
import About from "./pages/About";
import Contact from "./pages/Contact";
import BrowseApprenticeships from "./pages/BrowseApprenticeships";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import AcceptableUse from "./pages/legal/AcceptableUse";
import ForEmployers from "./pages/ForEmployers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/browse-apprenticeships" element={<BrowseApprenticeships />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/acceptable-use" element={<AcceptableUse />} />
        <Route path="/student/signup" element={<SignUpForm />} />
        <Route path="/student/signin" element={<SignInForm />} />
        <Route
          path="/student/setup-profile"
          element={<StudentProfileSetup />}
        />
        <Route path="/student/*" element={<StudentApp />} />
        <Route path="/company/*" element={<CompanyPortal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (container) {
  // Store root instance globally to prevent recreation during HMR
  let root = (globalThis as any).__reactRoot;

  if (!root) {
    root = createRoot(container);
    (globalThis as any).__reactRoot = root;
  }

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

export default App;
