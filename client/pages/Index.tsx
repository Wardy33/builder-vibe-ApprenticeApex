import { Link } from "react-router-dom";
import {
  Smartphone,
  Building2,
  Zap,
  Users,
  Video,
  MessageCircle,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-orange">Apprentice</span>Apex
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            The revolutionary platform connecting students with apprenticeship
            opportunities through AI-powered matching
          </p>
        </header>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Student App Card */}
          <Link to="/student" className="group">
            <div className="bg-gradient-to-br from-orange to-orange/80 rounded-3xl p-8 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <Smartphone className="h-8 w-8 text-white mr-3" />
                <h2 className="text-2xl font-bold text-white">Student App</h2>
              </div>
              <p className="text-white/90 mb-6">
                Swipe through apprenticeship opportunities, create AI-powered
                CVs, and connect with companies
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-white/80">
                  <Zap className="h-4 w-4 mr-2" />
                  Tinder-like Swiping
                </div>
                <div className="flex items-center text-white/80">
                  <Video className="h-4 w-4 mr-2" />
                  Video Profiles
                </div>
                <div className="flex items-center text-white/80">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Real-time Chat
                </div>
                <div className="flex items-center text-white/80">
                  <Users className="h-4 w-4 mr-2" />
                  AI-Generated CVs
                </div>
              </div>
            </div>
          </Link>

          {/* Company Portal Card */}
          <Link to="/company" className="group">
            <div className="bg-gradient-to-br from-company-bg to-gray-800 border border-company-accent/30 rounded-3xl p-8 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <Building2 className="h-8 w-8 text-company-accent mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  Company Portal
                </h2>
              </div>
              <p className="text-gray-300 mb-6">
                Manage apprenticeship listings, review applications, and track
                analytics in your dashboard
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-400">
                  <Building2 className="h-4 w-4 mr-2" />
                  Listing Management
                </div>
                <div className="flex items-center text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  Candidate Review
                </div>
                <div className="flex items-center text-gray-400">
                  <Zap className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </div>
                <div className="flex items-center text-gray-400">
                  <Video className="h-4 w-4 mr-2" />
                  Video Interviews
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-8 text-orange">
            Platform Features
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                AI-Powered Matching
              </h4>
              <p className="text-gray-400">
                Smart algorithms match students with perfect apprenticeship
                opportunities
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-orange" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Video Integration</h4>
              <p className="text-gray-400">
                30-second profiles and seamless video interviews via Twilio
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-orange" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                Real-time Communication
              </h4>
              <p className="text-gray-400">
                Instant messaging powered by Sendbird for seamless connections
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
