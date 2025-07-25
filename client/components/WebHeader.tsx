import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

export function WebHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Handle keyboard navigation for dropdown
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="backdrop-blur-md border-b sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-black border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center group"
            aria-label="ApprenticeApex Home"
          >
            <span className="text-2xl font-bold text-white transform group-hover:scale-105 transition-all duration-200">
              <span className="bg-gradient-to-r from-cyan-300 via-orange-400 to-pink-500 bg-clip-text text-transparent">Apprentice</span>
              <span className="bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">Apex</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-8"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-200 hover:scale-105 px-3 py-2 rounded-xl focus-indicator ${
                isActive("/") ? "bg-pink-500 text-white" : "text-white hover:bg-white/10"
              }`}
              aria-current={isActive("/") ? "page" : undefined}
              aria-label="Home page"
            >
              Home
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
                className="flex items-center text-sm font-medium text-white transition-all duration-200 hover:scale-105 px-3 py-2 rounded-xl hover:bg-white/10 focus-indicator"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="Student menu"
                id="student-menu-button"
              >
                For Students
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-xl shadow-2xl py-2 backdrop-blur-sm"
                  role="menu"
                  aria-labelledby="student-menu-button"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsDropdownOpen(false);
                    }
                  }}
                >
                  <Link
                    to="/student/signup"
                    className="block px-4 py-3 text-sm text-white hover:bg-pink-500 hover:text-white transition-all duration-200 mx-2 rounded-lg focus-indicator"
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                    aria-label="Sign up as a student"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/student/signin"
                    className="block px-4 py-3 text-sm text-white hover:bg-pink-500 hover:text-white transition-all duration-200 mx-2 rounded-lg focus-indicator"
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                    aria-label="Sign in as a student"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/for-employers"
              className={`text-sm font-medium transition-all duration-200 hover:scale-105 px-3 py-2 rounded-xl ${
                isActive("/for-employers") ? "bg-cyan-500 text-white" : "text-white hover:bg-white/10"
              }`}
            >
              For Employers
            </Link>

            <Link
              to="/about"
              className={`text-sm font-medium transition-all duration-200 hover:scale-105 px-3 py-2 rounded-xl ${
                isActive("/about") ? "bg-purple-500 text-white" : "text-white hover:bg-white/10"
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`text-sm font-medium transition-all duration-200 hover:scale-105 px-3 py-2 rounded-xl ${
                isActive("/contact") ? "bg-green-500 text-white" : "text-white hover:bg-white/10"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/student/signin"
              className="text-sm font-medium text-white transition-all duration-200 hover:scale-105 px-3 py-2 rounded-xl hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              to="/student/signup"
              className="text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 bg-pink-500 hover:bg-pink-600 shadow-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:bg-white/10"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm border-t border-white/10 rounded-b-xl mx-4">
            <div className="space-y-2">
              <Link
                to="/"
                className="block px-3 py-3 text-base font-medium text-white rounded-xl transition-all duration-200 hover:bg-pink-500 mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/student/signup"
                className="block px-3 py-3 text-base font-medium text-white rounded-xl transition-all duration-200 hover:bg-pink-500 mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Student Sign Up
              </Link>
              <Link
                to="/student/signin"
                className="block px-3 py-3 text-base font-medium text-white rounded-xl transition-all duration-200 hover:bg-pink-500 mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Student Sign In
              </Link>
              <Link
                to="/for-employers"
                className="block px-3 py-3 text-base font-medium text-white rounded-xl transition-all duration-200 hover:bg-cyan-500 mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Employers
              </Link>
              <Link
                to="/about"
                className="block px-3 py-3 text-base font-medium text-white rounded-xl transition-all duration-200 hover:bg-purple-500 mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-3 text-base font-medium text-white rounded-xl transition-all duration-200 hover:bg-green-500 mx-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 mx-2">
              <Link
                to="/student/signup"
                className="block w-full bg-pink-500 hover:bg-pink-600 text-white px-4 py-3 rounded-xl text-center font-bold transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
