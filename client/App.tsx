import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./global.css";
import Index from "./pages/Index";

// Lazy load components for better performance
const StudentApp = lazy(() => import("./pages/StudentApp"));
const CompanyPortal = lazy(() => import("./pages/CompanyPortal"));
const StudentAuth = lazy(() => import("./pages/StudentAuth"));
const StudentProfileSetup = lazy(() => import("./pages/StudentProfileSetup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Debug = lazy(() => import("./pages/Debug"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const BrowseApprenticeships = lazy(() => import("./pages/BrowseApprenticeships"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const AcceptableUse = lazy(() => import("./pages/legal/AcceptableUse"));
const ForEmployers = lazy(() => import("./pages/ForEmployers"));
const CompanyAuth = lazy(() => import("./pages/CompanyAuth"));

// Loading component for accessibility
function LoadingFallback({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="loading-indicator text-white">
        <div className="loading-spinner" aria-hidden="true"></div>
        <span className="sr-only">Loading {ariaLabel}...</span>
        <span aria-hidden="true" className="ml-2 text-lg font-medium">
          Loading...
        </span>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/for-employers" element={<ForEmployers />} />
        <Route path="/pricing" element={<ForEmployers />} />
        <Route path="/browse-apprenticeships" element={<BrowseApprenticeships />} />
        <Route path="/student-resources" element={<BrowseApprenticeships />} />
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
        <Route path="/company/signup" element={<CompanySignUpForm />} />
        <Route path="/company/signin" element={<CompanySignInForm />} />
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
