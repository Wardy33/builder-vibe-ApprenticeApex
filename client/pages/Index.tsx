import { Link } from "react-router-dom";
import {
  Smartphone,
  Building2,
  Zap,
  Users,
  Video,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import { WebLayout } from "../components/WebLayout";
import { SEOHead, seoConfigs } from "../components/SEOHead";
import LiveChat from "../components/LiveChat";

export default function Index() {
  return (
    <WebLayout>
      <SEOHead {...seoConfigs.home} />
      <div className="container mx-auto px-4 py-12 lg:py-16">
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
          <div className="group">
            <div className="bg-gradient-to-br from-orange to-orange/80 rounded-3xl p-8 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <Smartphone className="h-8 w-8 text-white mr-3" />
                <h2 className="text-2xl font-bold text-white">Student App</h2>
              </div>
              <p className="text-white/90 mb-6">
                Swipe through apprenticeship opportunities, create AI-powered
                CVs, and connect with companies
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
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
              <div className="flex gap-3">
                <Link
                  to="/student/signup"
                  className="flex-1 bg-white text-orange font-semibold py-3 px-4 rounded-lg text-center hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to="/student/signin"
                  className="flex-1 border-2 border-white text-white font-semibold py-3 px-4 rounded-lg text-center hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

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

        {/* Debug Link for Development */}
        <div className="text-center mb-16">
          <Link
            to="/debug"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            🔧 View System Status & Debug Info
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

        {/* Statistics Section */}
        <div className="py-16 bg-gray-900/50 rounded-2xl mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-8 text-orange">Our Platform Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                <div className="text-gray-400 text-sm">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">2,500+</div>
                <div className="text-gray-400 text-sm">Partner Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">85%</div>
                <div className="text-gray-400 text-sm">Match Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">24hrs</div>
                <div className="text-gray-400 text-sm">Average Response Time</div>
              </div>
            </div>
          </div>
        </div>



        {/* Call to Action */}
        <div className="bg-gradient-to-r from-orange to-orange/80 rounded-2xl p-8 md:p-12 text-center mt-16">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Apprenticeship Journey?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect apprenticeship match.
            Get started today and take the first step towards your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/student/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up as Student
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/for-employers"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Post Opportunities
            </Link>
          </div>
        </div>
      </div>
      <LiveChat />
    </WebLayout>
  );
}
