import { Link } from "react-router-dom";
import { Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function WebFooter() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <span className="text-2xl font-bold text-white">
                <span className="text-orange">Apprentice</span>Apex
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting students with apprenticeship opportunities through AI-powered matching. 
              Building the future workforce, one apprentice at a time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Students */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">For Students</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/student/signup" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/student/signin" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Sign In
                </Link>
              </li>
              <li>

              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/student-resources" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/company" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Company Portal
                </Link>
              </li>
              <li>
                <Link to="/post-apprenticeship" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Post Opportunities
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/employer-resources" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Resources
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Contact & Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-400 hover:text-orange transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-800 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-orange" />
              <div>
                <p className="text-white text-sm font-medium">Email</p>
                <p className="text-gray-400 text-sm">hello@apprenticeapex.co.uk</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-orange" />
              <div>
                <p className="text-white text-sm font-medium">Address</p>
                <p className="text-gray-400 text-sm">London, United Kingdom</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 ApprenticeApex. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/accessibility" className="text-gray-400 hover:text-orange transition-colors text-sm">
                Accessibility
              </Link>
              <Link to="/data-protection" className="text-gray-400 hover:text-orange transition-colors text-sm">
                Data Protection
              </Link>
              <Link to="/acceptable-use" className="text-gray-400 hover:text-orange transition-colors text-sm">
                Acceptable Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
