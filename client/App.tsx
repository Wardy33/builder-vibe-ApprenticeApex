import React, { StrictMode, Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./global.css";
import Index from "./pages/Index";
import { initializeServiceWorker } from "./utils/serviceWorker";
import { cleanupCorruptedLocalStorage, runLocalStorageDiagnostics } from "./lib/cleanupLocalStorage";

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
  // Initialize service worker and PWA features
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        initializeServiceWorker();
      }
    } catch (error) {
      console.warn('Service worker initialization failed:', error);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/debug"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Debug page" />}>
              <Debug />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="About page" />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Contact page" />}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="/for-employers"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Employers page" />}>
              <ForEmployers />
            </Suspense>
          }
        />
        <Route
          path="/pricing"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Pricing page" />}>
              <ForEmployers />
            </Suspense>
          }
        />
        <Route
          path="/browse-apprenticeships"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Browse apprenticeships" />}>
              <BrowseApprenticeships />
            </Suspense>
          }
        />
        <Route
          path="/student-resources"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Student resources" />}>
              <BrowseApprenticeships />
            </Suspense>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Privacy policy" />}>
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Terms of service" />}>
              <TermsOfService />
            </Suspense>
          }
        />
        <Route
          path="/cookie-policy"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Cookie policy" />}>
              <CookiePolicy />
            </Suspense>
          }
        />
        <Route
          path="/acceptable-use"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Acceptable use policy" />}>
              <AcceptableUse />
            </Suspense>
          }
        />
        <Route
          path="/student/signup"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Student signup" />}>
              <StudentAuth />
            </Suspense>
          }
        />
        <Route
          path="/student/signin"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Student signin" />}>
              <StudentAuth />
            </Suspense>
          }
        />
        <Route
          path="/student/setup-profile"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Profile setup" />}>
              <StudentProfileSetup />
            </Suspense>
          }
        />
        <Route
          path="/student/*"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Student portal" />}>
              <StudentApp />
            </Suspense>
          }
        />
        <Route
          path="/company/signup"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Company signup" />}>
              <CompanyAuth />
            </Suspense>
          }
        />
        <Route
          path="/company/signin"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Company signin" />}>
              <CompanyAuth />
            </Suspense>
          }
        />
        <Route
          path="/company/*"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Company portal" />}>
              <CompanyPortal />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingFallback ariaLabel="Page not found" />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

// Initialize React app safely
function initializeApp() {
  const container = document.getElementById("root");
  if (!container) {
    console.error('Root container not found');
    return;
  }

  try {
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
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    // Fallback: show basic error message
    container.innerHTML = '<div style="padding: 20px; color: red;">App failed to load. Please refresh the page.</div>';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export default App;
