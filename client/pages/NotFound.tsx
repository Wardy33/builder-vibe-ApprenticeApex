import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { WebLayout } from "../components/WebLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <WebLayout>
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent">404</h1>
          <p className="text-xl text-gray-300 mb-6">Oops! Page not found</p>
          <a href="/" className="px-6 py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-500 hover:to-red-600 transition-all duration-200 hover:scale-105 shadow-xl border border-white/20">
            Return to Home
          </a>
        </div>
      </div>
    </WebLayout>
  );
};

export default NotFound;
