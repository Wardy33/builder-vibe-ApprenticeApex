import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

export function WebHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="backdrop-blur-sm border-b sticky top-0 z-50" style={{backgroundColor: '#020202', borderBottomColor: '#020202'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">
              <span style={{color: '#da6927'}}>Apprentice</span>Apex
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/") ? "" : "text-white"
              }`}
              style={{
                color: isActive("/") ? '#da6927' : '#ffffff'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#da6927'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive("/") ? '#da6927' : '#ffffff'}
            >
              Home
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-sm font-medium text-white transition-colors"
                style={{color: '#ffffff'}}
                onMouseEnter={(e) => e.currentTarget.style.color = '#da6927'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                For Students
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <Link
                    to="/student/signup"
                    className="block px-4 py-2 text-sm transition-colors"
                    style={{color: '#020202'}}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#da6927'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#020202'}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/student/signin"
                    className="block px-4 py-2 text-sm transition-colors"
                    style={{color: '#020202'}}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#da6927'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#020202'}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Sign In
                  </Link>

                </div>
              )}
            </div>

            <Link
              to="/for-employers"
              className="text-sm font-medium transition-colors"
              style={{
                color: isActive("/for-employers") ? '#da6927' : '#ffffff'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#da6927'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive("/for-employers") ? '#da6927' : '#ffffff'}
            >
              For Employers
            </Link>
            
            <Link
              to="/about"
              className="text-sm font-medium transition-colors"
              style={{
                color: isActive("/about") ? '#da6927' : '#ffffff'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#da6927'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive("/about") ? '#da6927' : '#ffffff'}
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-sm font-medium transition-colors"
              style={{
                color: isActive("/contact") ? '#da6927' : '#ffffff'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#da6927'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive("/contact") ? '#da6927' : '#ffffff'}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/student/signin"
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/student/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-orange-500 hover:bg-gray-100 transition-colors"
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/student/signup"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Student Sign Up
              </Link>
              <Link
                to="/student/signin"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Student Sign In
              </Link>
              <Link
                to="/for-employers"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Employers
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <Link
                to="/student/signup"
                className="block w-full bg-orange hover:bg-orange/90 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
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
