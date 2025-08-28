import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Heart, X, MapPin, Building2, Clock, User, MessageCircle, Video, ArrowLeft, Settings, Briefcase, 
  Star, Calendar, Edit, Camera, Home, FileText, CheckCircle, Navigation, Bus, Train, Car, 
  Route as RouteIcon, Info, Lock, Mail
} from "lucide-react";
import LiveChat from "../components/LiveChat";

// Types
interface Apprenticeship {
  id: string;
  jobTitle: string;
  company: string;
  industry: string;
  location: string;
  distance: string;
  duration: string;
  description: string;
  requirements: string[];
  salary: string;
  image: string;
}

// Constants
const cardClass = "bg-white rounded-xl p-5 border border-gray-200 shadow-sm";
const inputClass = "w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const buttonPrimary = "bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300";

// Helper functions
const isApplicationClosed = (closingDate: string) => {
  const today = new Date();
  const deadline = new Date(closingDate);
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return deadline < today;
};

const getStatusText = (status: string) => {
  const statusMap = {
    applied: "Applied", viewed: "Viewed", shortlisted: "Shortlisted",
    interview_scheduled: "Interview", rejected: "Rejected", accepted: "Accepted"
  };
  return statusMap[status] || status;
};

// Mock data
const mockApprenticeship: Apprenticeship[] = [
  {
    id: "1", jobTitle: "Software Developer", company: "TechCorp Ltd", industry: "Technology", 
    location: "London, UK", distance: "1.4 miles", duration: "3 years",
    description: "Join our dynamic team and learn cutting-edge web development technologies.",
    requirements: ["Basic coding knowledge", "Problem-solving skills", "Passion for technology"],
    salary: "£18,000 - £25,000", 
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=600&fit=crop",
  },
  {
    id: "2", jobTitle: "Digital Marketing Assistant", company: "Creative Agency", industry: "Marketing", 
    location: "Manchester, UK", distance: "1.1 miles", duration: "2 years",
    description: "Learn the fundamentals of digital marketing including SEO, social media, and content creation.",
    requirements: ["Creative mindset", "Social media savvy", "Communication skills"],
    salary: "£16,000 - £22,000", 
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
  },
];

const mockApplications = [
  {
    id: "1", jobTitle: "Software Developer", company: "TechCorp Ltd", status: "applied", 
    appliedDate: "2 days ago", matchScore: 92, closingDate: "2024-02-15",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=60&h=60&fit=crop",
  },
  {
    id: "2", jobTitle: "Digital Marketing Assistant", company: "Creative Agency", status: "viewed", 
    appliedDate: "1 week ago", matchScore: 88, closingDate: "2024-02-28",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=60&h=60&fit=crop",
  },
];

// SwipeCard Component
function SwipeCard({ apprenticeship, onSwipe, style }: {
  apprenticeship: Apprenticeship;
  onSwipe: (direction: "left" | "right") => void;
  style?: React.CSSProperties;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragDistance(e.clientX - (rect.left + rect.width / 2));
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragDistance) > 100) {
      onSwipe(dragDistance > 0 ? "right" : "left");
    }
    setDragDistance(0);
  };

  return (
    <div
      ref={cardRef}
      className={`w-full max-w-sm mx-auto h-[520px] cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
      style={{ transform: `translateX(${dragDistance}px) rotate(${dragDistance * 0.05}deg)`, ...style }}
      onMouseDown={() => setIsDragging(true)}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="relative h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="relative h-64 overflow-hidden">
          <img src={apprenticeship.image} alt={apprenticeship.jobTitle} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 right-4">
            <span className="bg-white/95 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              {apprenticeship.duration}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900">{apprenticeship.jobTitle}</h3>
                <p className="text-gray-600 font-medium text-sm">{apprenticeship.company}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{apprenticeship.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>{apprenticeship.industry}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Navigation className="h-4 w-4 mr-1 text-blue-600" />
                <span className="font-medium">{apprenticeship.distance} away</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowTransportModal(true); }}
                className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                <RouteIcon className="h-3 w-3 mr-1" />
                Routes
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-700 line-clamp-3">{apprenticeship.description}</p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Key Requirements</p>
            <div className="flex flex-wrap gap-2">
              {apprenticeship.requirements.slice(0, 3).map((req, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                  {req}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <p className="text-lg font-bold text-gray-900">{apprenticeship.salary}</p>
            <p className="text-xs text-gray-500">per year</p>
          </div>
        </div>

        {dragDistance > 50 && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm animate-pulse">
              ❤️ LIKE
            </div>
          </div>
        )}
        {dragDistance < -50 && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm animate-pulse">
              ✕ PASS
            </div>
          </div>
        )}

        {showTransportModal && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-20">
            <div className="bg-gradient-to-r from-pink-500 to-red-500 backdrop-blur-xl rounded-2xl p-8 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black">Transport Routes</h3>
                <button onClick={() => setShowTransportModal(false)} className="text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Bus, label: "Bus Route", time: "25 min", cost: "£2.50" },
                  { icon: Train, label: "Train Route", time: "18 min", cost: "£4.20" },
                  { icon: Car, label: "Driving", time: "12 min", cost: "£8/day" },
                  { icon: User, label: "Walking", time: "28 min", cost: "Free" }
                ].map((route, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/20 rounded-lg border border-white/30">
                    <div className="flex items-center">
                      <route.icon className="h-5 w-5 text-black mr-3" />
                      <div>
                        <p className="font-medium text-black">{route.label}</p>
                        <p className="text-sm text-gray-800">{route.time} • {route.cost}</p>
                      </div>
                    </div>
                    <button className="text-black text-sm font-medium hover:underline">View</button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowTransportModal(false)} className="flex-1 bg-gray-700/40 text-black py-2 px-4 rounded-lg">
                  Close
                </button>
                <button onClick={() => window.open(`https://maps.google.com/maps/dir/Your+Home/${encodeURIComponent(apprenticeship.location)}`, "_blank")} className="flex-1 bg-orange text-black py-2 px-4 rounded-lg">
                  Open Maps
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// HomePage Component
function HomePage() {
  const [applications] = useState(mockApplications);
  const [profileScore] = useState(92);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Good morning, Sarah!</h1>
            <p className="text-gray-600 text-sm">Ready to explore new opportunities?</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Strength</h3>
              <p className="text-gray-600 text-sm">Complete your profile to get better matches</p>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-300" stroke="currentColor" strokeWidth="3" fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-500" stroke="currentColor" strokeWidth="3" strokeDasharray={`${profileScore}, 100`} fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{profileScore}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FileText, value: applications.length, label: "Applications" },
            { icon: Calendar, value: "2", label: "Interviews" },
            { icon: Heart, value: "5", label: "Matches" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
          <Link to="/student/applications" className="text-blue-600 text-sm font-medium">View All</Link>
        </div>

        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start space-x-3">
                <img src={app.image} alt={app.company} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{app.jobTitle}</h3>
                      <p className="text-gray-600 text-sm">{app.company}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {getStatusText(app.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>Applied {app.appliedDate}</span>
                    <span className="font-medium text-green-600">{app.matchScore}% match</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// JobsPage Component
function JobsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [apprenticeships] = useState(mockApprenticeship);

  const handleSwipe = async (direction: "left" | "right") => {
    const current = apprenticeships[currentIndex];
    console.log(`Swiped ${direction} on ${current?.jobTitle}`);
    setCurrentIndex(currentIndex < apprenticeships.length - 1 ? currentIndex + 1 : 0);
  };

  const current = apprenticeships[currentIndex];

  if (!current) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-black mb-4">No more opportunities!</h3>
          <p className="text-gray-400 mb-6">Check back later for new apprenticeships</p>
          <button onClick={() => setCurrentIndex(0)} className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-black px-6 py-3 rounded-full font-medium">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Discover Jobs</h1>
        <p className="text-gray-600 text-sm">Find your perfect apprenticeship match</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <SwipeCard
          key={current.id}
          apprenticeship={current}
          onSwipe={handleSwipe}
          style={{ zIndex: 10 }}
        />
      </div>

      <div className="bg-white px-6 py-4 border-t border-gray-200">
        <div className="flex justify-center items-center gap-6 max-w-xs mx-auto">
          <button
            onClick={() => handleSwipe("left")}
            className="w-14 h-14 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <X className="h-6 w-6 text-red-500" />
          </button>
          <button
            onClick={() => handleSwipe("right")}
            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all"
          >
            <Heart className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple pages for remaining functionality
function MatchesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-6 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Matches</h2>
        <p className="text-gray-600">Companies that are interested in your profile</p>
      </div>
      <div className="px-6 py-4">
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
          <p className="text-gray-600 text-sm mb-6">Keep swiping to find your perfect apprenticeship!</p>
          <Link to="/student/jobs" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium">
            Start Swiping
          </Link>
        </div>
      </div>
    </div>
  );
}

function MessagesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-6 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
        <p className="text-gray-600">Chat with companies</p>
      </div>
      <div className="px-6 py-4">
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-600 text-sm mb-6">Start matching with companies to begin conversations!</p>
          <Link to="/student/jobs" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium">
            Find Matches
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const [profile] = useState({
    firstName: "Sarah", lastName: "Johnson", location: "London, UK",
    bio: "Passionate about technology and eager to start my career in software development.",
    skills: ["JavaScript", "React", "Problem Solving", "Communication"], 
    availableFrom: "September 2024",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b890?w=150&h=150&fit=crop",
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-6 py-8">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <img src={profile.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg" />
            <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.firstName} {profile.lastName}</h2>
          <p className="text-gray-600 flex items-center justify-center">
            <MapPin className="h-4 w-4 mr-1" />
            {profile.location}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: FileText, value: "12", label: "Applications" },
            { icon: Heart, value: "5", label: "Matches" },
            { icon: User, value: "92%", label: "Profile Score" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {[
          { title: "About", content: profile.bio },
          { title: "Skills", content: profile.skills.join(", ") },
          { title: "Availability", content: `Available from ${profile.availableFrom}` }
        ].map((section, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 font-semibold">{section.title}</h3>
              <Edit className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{section.content}</p>
          </div>
        ))}

        <div className="pt-4">
          <button
            onClick={() => navigate('/student/account-settings')}
            className="w-full bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-gray-900 flex items-center justify-between hover:shadow-md transition-all"
          >
            <span className="font-medium">Account Settings</span>
            <Settings className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountSettingsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-6 py-6 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl mr-3">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className={cardClass}>
          <p className="text-gray-900">Account settings will be available soon.</p>
        </div>
      </div>
    </div>
  );
}

// Layout Component
function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {!isActive("/student/home") && !isActive("/student/") && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">ApprenticeApex</h1>
            <button onClick={() => navigate('/student/account-settings')} className="p-2 hover:bg-gray-100 rounded-xl">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {[
            { path: "/student/home", icon: Home, label: "Home" },
            { path: "/student/jobs", icon: Briefcase, label: "Jobs" },
            { path: "/student/matches", icon: Heart, label: "Matches" },
            { path: "/student/messages", icon: MessageCircle, label: "Messages" },
            {
