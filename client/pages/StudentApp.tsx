import { useState, useRef, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  Heart,
  X,
  MapPin,
  Building2,
  Clock,
  Filter,
  User,
  MessageCircle,
  Video,
  ArrowLeft,
  Settings,
  Briefcase,
  Search,
  Star,
  Calendar,
  Phone,
  Mail,
  Edit,
  Camera,
  Home,
  FileText,
  CheckCircle,
  AlertCircle,
  Navigation,
  Bus,
  Train,
  Car,
  Route as RouteIcon,
  Info,
} from "lucide-react";
import LiveChat from "../components/LiveChat";

// Helper function to check if application deadline has passed
const isApplicationClosed = (closingDate: string) => {
  const today = new Date();
  const deadline = new Date(closingDate);
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return deadline < today;
};

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

const mockApprenticeship: Apprenticeship[] = [
  {
    id: "1",
    jobTitle: "Software Developer",
    company: "TechCorp Ltd",
    industry: "Technology",
    location: "London, UK",
    distance: "1.4 miles",
    duration: "3 years",
    description:
      "Join our dynamic team and learn cutting-edge web development technologies. You'll work on real projects from day one.",
    requirements: [
      "Basic coding knowledge",
      "Problem-solving skills",
      "Passion for technology",
    ],
    salary: "£18,000 - £25,000",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=600&fit=crop",
  },
  {
    id: "2",
    jobTitle: "Digital Marketing Assistant",
    company: "Creative Agency",
    industry: "Marketing",
    location: "Manchester, UK",
    distance: "1.1 miles",
    duration: "2 years",
    description:
      "Learn the fundamentals of digital marketing including SEO, social media, and content creation.",
    requirements: [
      "Creative mindset",
      "Social media savvy",
      "Communication skills",
    ],
    salary: "£16,000 - £22,000",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
  },
  {
    id: "3",
    jobTitle: "Electrical Engineer",
    company: "PowerTech Solutions",
    industry: "Engineering",
    location: "Birmingham, UK",
    distance: "1.9 miles",
    duration: "4 years",
    description:
      "Hands-on experience in electrical systems design and installation. Work with experienced engineers.",
    requirements: ["Math skills", "Attention to detail", "Safety-conscious"],
    salary: "£20,000 - £28,000",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=600&fit=crop",
  },
];

function SwipeCard({
  apprenticeship,
  onSwipe,
  style,
}: {
  apprenticeship: Apprenticeship;
  onSwipe: (direction: "left" | "right") => void;
  style?: React.CSSProperties;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTransportRoutes = (apprenticeship: Apprenticeship) => {
    setShowTransportModal(true);
  };

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragDistance) > 100) {
      onSwipe(dragDistance > 0 ? "right" : "left");
    }
    setDragDistance(0);
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const distance = e.clientX - (rect.left + rect.width / 2);
      setDragDistance(distance);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`swipe-card w-full max-w-sm mx-auto h-[520px] cursor-grab ${isDragging ? "cursor-grabbing dragging" : ""}`}
      style={{
        transform: `translateX(${dragDistance}px) rotate(${dragDistance * 0.05}deg)`,
        ...style,
      }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="relative h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Image Section */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={apprenticeship.image}
            alt={apprenticeship.jobTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Duration Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-white/95 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              {apprenticeship.duration}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {apprenticeship.jobTitle}
                </h3>
                <p className="text-gray-600 font-medium text-sm">
                  {apprenticeship.company}
                </p>
              </div>
            </div>
          </div>

          {/* Location and Info */}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleTransportRoutes(apprenticeship);
                }}
                className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                <RouteIcon className="h-3 w-3 mr-1" />
                Routes
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {apprenticeship.description}
          </p>

          {/* Requirements Preview */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Key Requirements</p>
            <div className="flex flex-wrap gap-2">
              {apprenticeship.requirements.slice(0, 3).map((req, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium"
                >
                  {req}
                </span>
              ))}
              {apprenticeship.requirements.length > 3 && (
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-xs">
                  +{apprenticeship.requirements.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Salary */}
          <div className="border-t border-gray-200 pt-3">
            <p className="text-lg font-bold text-gray-900">
              {apprenticeship.salary}
            </p>
            <p className="text-xs text-gray-500">per year</p>
          </div>
        </div>

        {/* Swipe indicators */}
        {dragDistance > 50 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-black px-6 py-3 rounded-full font-bold text-xl animate-pulse shadow-2xl border-2 border-white/30">
              INTERESTED
            </div>
          </div>
        )}
        {dragDistance < -50 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-black px-6 py-3 rounded-full font-bold text-xl animate-pulse shadow-2xl border-2 border-white/30">
              PASS
            </div>
          </div>
        )}

        {/* Transport Routes Modal */}
        {showTransportModal && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-20">
            <div className="bg-gradient-to-r from-pink-500 to-red-500 backdrop-blur-xl rounded-2xl p-8 w-full max-w-sm border border-pink-300 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black">
                  Transport Routes
                </h3>
                <button
                  onClick={() => setShowTransportModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-300 mb-4">
                  Routes from your home to{" "}
                  <strong>{apprenticeship.company}</strong>
                </div>

                {/* Bus Route */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-blue-700/20 rounded-lg border border-blue-400/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <Bus className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-black">Bus Route</p>
                      <p className="text-sm text-gray-300">25 min • £2.50</p>
                    </div>
                  </div>
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    View
                  </button>
                </div>

                {/* Train Route */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-500/20 via-green-600/20 to-green-700/20 rounded-lg border border-green-400/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <Train className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-black">Train Route</p>
                      <p className="text-sm text-gray-300">18 min • £4.20</p>
                    </div>
                  </div>
                  <button className="text-green-600 text-sm font-medium hover:underline">
                    View
                  </button>
                </div>

                {/* Car Route */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-orange-500/20 via-orange-600/20 to-orange-700/20 rounded-lg border border-orange-400/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-cyan-500-600 mr-3" />
                    <div>
                      <p className="font-medium text-black">Driving</p>
                      <p className="text-sm text-gray-300">
                        12 min • Parking £8/day
                      </p>
                    </div>
                  </div>
                  <button className="text-cyan-500-600 text-sm font-medium hover:underline">
                    View
                  </button>
                </div>

                {/* Walking */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-500/20 via-gray-600/20 to-gray-700/20 rounded-lg border border-gray-400/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-300 mr-3" />
                    <div>
                      <p className="font-medium text-black">Walking</p>
                      <p className="text-sm text-gray-300">28 min • Free</p>
                    </div>
                  </div>
                  <button className="text-gray-300 text-sm font-medium hover:underline">
                    View
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowTransportModal(false)}
                  className="flex-1 bg-gray-700/40 text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-600/40 transition-colors backdrop-blur-sm border border-white/20"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Open external maps app
                    const mapsUrl = `https://maps.google.com/maps/dir/Your+Home/${encodeURIComponent(apprenticeship.location)}`;
                    window.open(mapsUrl, "_blank");
                  }}
                  className="flex-1 bg-orange text-black py-2 px-4 rounded-lg font-medium hover:bg-orange/90 transition-colors"
                >
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

function HomePage() {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [profileScore, setProfileScore] = useState(92);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load applications
        const appsResponse = await fetch('/api/applications/my-applications');
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData.applications || []);
        }

        // Load profile status
        const profileResponse = await fetch('/api/matching/profile-status');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfileScore(profileData.profileScore || 92);
        }

        // Mock interviews for now - TODO: Implement real interview API
        setInterviews(mockInterviews);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to mock data
        setApplications(mockApplications);
        setInterviews(mockInterviews);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const mockApplications = [
    {
      id: "1",
      jobTitle: "Software Developer",
      company: "TechCorp Ltd",
      status: "applied",
      appliedDate: "2 days ago",
      matchScore: 92,
      closingDate: "2024-02-15",
      image:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=60&h=60&fit=crop",
    },
    {
      id: "2",
      jobTitle: "Digital Marketing Assistant",
      company: "Creative Agency",
      status: "viewed",
      appliedDate: "1 week ago",
      matchScore: 88,
      closingDate: "2024-02-28",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=60&h=60&fit=crop",
    },
    {
      id: "3",
      jobTitle: "Electrical Engineer",
      company: "PowerTech Solutions",
      status: "shortlisted",
      appliedDate: "3 days ago",
      matchScore: 95,
      closingDate: "2024-02-10",
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=60&h=60&fit=crop",
    },
  ];

  const mockInterviews = [
    {
      id: "1",
      jobTitle: "Software Developer",
      company: "TechCorp Ltd",
      date: "Tomorrow",
      time: "2:00 PM",
      type: "Video Interview",
      status: "confirmed",
      image:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=60&h=60&fit=crop",
    },
    {
      id: "2",
      jobTitle: "Digital Marketing Assistant",
      company: "Creative Agency",
      date: "Friday",
      time: "10:00 AM",
      type: "In-person Interview",
      status: "pending",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=60&h=60&fit=crop",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-500";
      case "viewed":
        return "bg-yellow-500";
      case "shortlisted":
        return "bg-green-500";
      case "interview_scheduled":
        return "bg-purple-500";
      case "rejected":
        return "bg-red-500";
      case "accepted":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "viewed":
        return "Viewed";
      case "shortlisted":
        return "Shortlisted";
      case "interview_scheduled":
        return "Interview";
      case "rejected":
        return "Rejected";
      case "accepted":
        return "Accepted";
      default:
        return status;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Modern Header Section */}
      <div className="bg-white px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Good morning, Sarah! 👋
            </h1>
            <p className="text-gray-600 text-sm">Ready to explore new opportunities?</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Progress Ring */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Strength</h3>
              <p className="text-gray-600 text-sm">Complete your profile to get better matches</p>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-300"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${profileScore}, 100`}
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">{profileScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-xs text-gray-600">Applications</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
              <p className="text-xs text-gray-600">Interviews</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-xs text-gray-600">Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Applications Section */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
          <Link
            to="/student/applications"
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            View All
          </Link>
        </div>

        {mockApplications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 text-sm mb-6">
              Start exploring opportunities to find your dream apprenticeship
            </p>
            <Link
              to="/student/jobs"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Explore Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mockApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-200"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={application.image}
                    alt={application.company}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {application.jobTitle}
                        </h3>
                        <p className="text-gray-600 text-sm">{application.company}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          application.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                          application.status === 'viewed' ? 'bg-yellow-100 text-yellow-700' :
                          application.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>Applied {application.appliedDate}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          <span className="font-medium text-green-600">{application.matchScore}% match</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Interviews Section */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Interviews</h2>
          <Link
            to="/student/interviews"
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            View All
          </Link>
        </div>

        {mockInterviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interviews Scheduled</h3>
            <p className="text-gray-600 text-sm">
              Your interview invitations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-200"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={interview.image}
                    alt={interview.company}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {interview.jobTitle}
                        </h3>
                        <p className="text-gray-600 text-sm">{interview.company}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interview.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {interview.status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {interview.date} at {interview.time}
                        </div>
                        <div className="flex items-center">
                          <Video className="h-3 w-3 mr-1" />
                          {interview.type}
                        </div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        Join Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [apprenticeships, setApprenticeships] = useState(mockApprenticeship);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load apprenticeships from API
  useEffect(() => {
    const loadApprenticeships = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/apprenticeships/discover');
        if (response.ok) {
          const data = await response.json();
          if (data.apprenticeships && data.apprenticeships.length > 0) {
            // Transform API data to match our interface
            const transformedData = data.apprenticeships.map((app: any, index: number) => ({
              id: app._id || `api_${index}`,
              jobTitle: app.jobTitle,
              company: app.companyName || app.company,
              industry: app.industry,
              location: app.location?.city || app.location,
              distance: `${(Math.random() * 5 + 0.5).toFixed(1)} miles`, // TODO: Calculate real distance
              duration: app.duration || "3 years",
              description: app.description,
              requirements: app.requirements || [],
              salary: app.salary || "£18,000 - £25,000",
              image: app.image || `https://images.unsplash.com/photo-148631233821${index % 10}9-ce68d2c6f44d?w=400&h=600&fit=crop`,
            }));
            setApprenticeships(transformedData);
          }
        }
      } catch (error) {
        console.error('Failed to load apprenticeships from API, using mock data:', error);
        // Keep using mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    loadApprenticeships();
  }, []);

  const handleSwipe = async (direction: "left" | "right") => {
    const currentApprenticeship = apprenticeships[currentIndex];
    console.log(
      `Swiped ${direction} on ${currentApprenticeship?.jobTitle}`,
    );

    // Send swipe to API
    try {
      await fetch(`/api/apprenticeships/${currentApprenticeship.id}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction,
          studentLocation: { lat: 51.5074, lng: -0.1278 } // TODO: Get real location
        })
      });
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }

    if (currentIndex < apprenticeships.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reset or load more
      setCurrentIndex(0);
    }
  };

  const handleButtonSwipe = (direction: "left" | "right") => {
    handleSwipe(direction);
  };

  const currentApprenticeship = apprenticeships[currentIndex];

  if (!currentApprenticeship) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-black mb-4">
            No more opportunities!
          </h3>
          <p className="text-gray-400 mb-6">
            Check back later for new apprenticeships
          </p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-black px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-xl border border-white/20"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Discover Jobs</h1>
        <p className="text-gray-600 text-sm">Swipe right to like, left to pass</p>
      </div>

      {/* Stack of cards */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Background cards */}
        {apprenticeships
          .slice(currentIndex + 1, currentIndex + 3)
          .map((apprenticeship, index) => (
            <SwipeCard
              key={apprenticeship.id}
              apprenticeship={apprenticeship}
              onSwipe={() => {}}
              style={{
                position: "absolute",
                zIndex: -(index + 1),
                transform: `scale(${1 - (index + 1) * 0.03}) translateY(${(index + 1) * 8}px)`,
                opacity: 1 - (index + 1) * 0.15,
              }}
            />
          ))}

        {/* Current card */}
        <SwipeCard
          key={currentApprenticeship.id}
          apprenticeship={currentApprenticeship}
          onSwipe={handleSwipe}
          style={{ zIndex: 10 }}
        />
      </div>

      {/* Modern Action buttons */}
      <div className="bg-white px-6 py-4 border-t border-gray-200">
        <div className="flex justify-center items-center gap-6 max-w-xs mx-auto">
          <button
            onClick={() => handleButtonSwipe("left")}
            className="w-14 h-14 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:border-red-300 hover:bg-red-50 transition-all duration-200 hover:scale-105"
          >
            <X className="h-6 w-6 text-red-500" />
          </button>

          <button
            onClick={() => handleButtonSwipe("right")}
            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
          >
            <Heart className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchesPage() {
  const navigate = useNavigate();

  const mockMatches = [
    {
      id: "1",
      jobTitle: "Software Developer",
      company: "TechCorp Ltd",
      matchDate: "2 days ago",
      status: "new",
      image:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop",
      industry: "Technology",
      location: "London, UK",
      distance: "1.4 miles",
      duration: "3 years",
      description:
        "Join our dynamic team and learn cutting-edge web development technologies. You'll work on real projects from day one.",
      requirements: [
        "Basic coding knowledge",
        "Problem-solving skills",
        "Passion for technology",
      ],
      salary: "£18,000 - £25,000",
    },
    {
      id: "2",
      jobTitle: "Digital Marketing Assistant",
      company: "Creative Agency",
      matchDate: "1 week ago",
      status: "viewed",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop",
      industry: "Marketing",
      location: "Manchester, UK",
      distance: "1.1 miles",
      duration: "2 years",
      description:
        "Learn the fundamentals of digital marketing including SEO, social media, and content creation.",
      requirements: [
        "Creative mindset",
        "Social media savvy",
        "Communication skills",
      ],
      salary: "£16,000 - £22,000",
    },
  ];

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Your Matches</h2>
        <p className="text-gray-300">
          Companies that are interested in your profile
        </p>
      </div>

      {mockMatches.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-black mb-2">
            No matches yet
          </h3>
          <p className="text-gray-300 mb-6">
            Keep swiping to find your perfect apprenticeship!
          </p>
          <Link
            to="/student/jobs"
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Start Swiping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockMatches.map((match) => (
            <div
              key={match.id}
              className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 flex items-center space-x-4 shadow-xl hover:shadow-[#00D4FF]/50 hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <img
                src={match.image}
                alt={match.jobTitle}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-black font-bold ">
                  {match.jobTitle}
                </h3>
                <p className="text-black/90 font-semibold">{match.company}</p>
                <p className="text-sm text-black/80 font-medium">{match.matchDate}</p>
              </div>
              <div className="flex flex-col gap-2">
                {match.status === "new" && (
                  <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full font-bold">
                    New
                  </span>
                )}
                <button
                  onClick={() =>
                    navigate(`/student/apprenticeship-info/${match.id}`)
                  }
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 shadow-lg"
                >
                  <Info className="h-4 w-4" />
                  Info
                </button>
                <button
                  onClick={() => navigate(`/student/chat/${match.id}`)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesPage() {
  const navigate = useNavigate();

  const mockConversations = [
    {
      id: "1",
      company: "TechCorp Ltd",
      lastMessage: "We'd love to schedule an interview!",
      time: "2h ago",
      unread: true,
      avatar:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=50&h=50&fit=crop",
    },
    {
      id: "2",
      company: "Creative Agency",
      lastMessage: "Thanks for your interest in our apprenticeship.",
      time: "1d ago",
      unread: false,
      avatar:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=50&h=50&fit=crop",
    },
  ];

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Messages</h2>
        <p className="text-gray-300">Chat with companies</p>
      </div>

      {mockConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-black mb-2">
            No messages yet
          </h3>
          <p className="text-gray-300 mb-6">
            Start matching with companies to begin conversations!
          </p>
          <Link
            to="/student/jobs"
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Find Matches
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => navigate(`/student/chat/${conversation.id}`)}
              className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 flex items-center space-x-4 cursor-pointer shadow-xl hover:shadow-[#00D4FF]/50 hover:scale-105 transition-all duration-300 group"
            >
              <img
                src={conversation.avatar}
                alt={conversation.company}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-black font-bold truncate ">
                    {conversation.company}
                  </h3>
                  <span className="text-xs text-black/80 font-medium">
                    {conversation.time}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${conversation.unread ? "text-black font-semibold" : "text-black/90 font-medium"}`}
                >
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unread && (
                <div className="w-3 h-3 bg-yellow-400 rounded-full flex-shrink-0 shadow-lg" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApprenticeshipInfoPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - in real app, this would be fetched based on ID
  const apprenticeshipInfo = {
    id: id,
    jobTitle: "Software Developer",
    company: "TechCorp Ltd",
    industry: "Technology",
    location: "London, UK",
    distance: "1.4 miles",
    duration: "3 years",
    description:
      "Join our dynamic team and learn cutting-edge web development technologies. You'll work on real projects from day one and receive mentorship from senior developers.",
    requirements: [
      "Basic coding knowledge (HTML, CSS, JavaScript)",
      "Problem-solving skills and logical thinking",
      "Passion for technology and continuous learning",
      "Good communication and teamwork abilities",
      "GCSE Maths and English (Grade 4 or above)",
    ],
    responsibilities: [
      "Develop and maintain web applications",
      "Work with senior developers on real client projects",
      "Participate in code reviews and team meetings",
      "Learn new technologies and frameworks",
      "Contribute to technical documentation",
    ],
    benefits: [
      "Competitive salary with annual reviews",
      "25 days holiday plus bank holidays",
      "Professional development budget (£1,500/year)",
      "Flexible working arrangements",
      "Health insurance and pension scheme",
      "Modern office with free snacks and drinks",
    ],
    salary: "£18,000 - £25,000",
    startDate: "September 2024",
    applicationDeadline: "2024-02-15",
    companyImage:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
    companyLogo:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-800/40 backdrop-blur-sm/10 rounded-full text-white transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-white">
          Apprenticeship Details
        </h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6 bg-white">
        {/* Company Header */}
        <div className="bg-black border border-gray-600 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start space-x-4">
            <img
              src={apprenticeshipInfo.companyLogo}
              alt={apprenticeshipInfo.company}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {apprenticeshipInfo.jobTitle}
              </h2>
              <p className="text-cyan-500 font-semibold text-lg mb-2">
                {apprenticeshipInfo.company}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {apprenticeshipInfo.location}
                </div>
                <div className="flex items-center">
                  <Navigation className="h-4 w-4 mr-1" />
                  {apprenticeshipInfo.distance}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {apprenticeshipInfo.duration}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-cyan-500">
              {apprenticeshipInfo.salary}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/student/chat/${id}`)}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-xl"
              >
                <MessageCircle className="h-4 w-4" />
                Message Company
              </button>
            </div>
          </div>
        </div>

        {/* Company Image */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl overflow-hidden shadow-xl">
          <img
            src={apprenticeshipInfo.companyImage}
            alt="Company office"
            className="w-full h-48 object-cover"
          />
        </div>

        {/* Description */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-3">
            About this role
          </h3>
          <p className="text-black leading-relaxed">
            {apprenticeshipInfo.description}
          </p>
        </div>

        {/* Requirements */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-3">
            Requirements
          </h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.requirements.map((req, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-black">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Responsibilities */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-3">
            Your responsibilities
          </h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.responsibilities.map((resp, index) => (
              <li key={index} className="flex items-start">
                <Briefcase className="h-5 w-5 text-cyan-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-black">{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-3">
            Benefits & Perks
          </h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-black">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Details */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-3">
            Key Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-black/50 mr-2" />
              <div>
                <p className="text-sm text-black/70">Start Date</p>
                <p className="font-medium text-black">
                  {apprenticeshipInfo.startDate}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-black/50 mr-2" />
              <div>
                <p className="text-sm text-black/70">Application Deadline</p>
                <p className={`font-medium ${isApplicationClosed(apprenticeshipInfo.applicationDeadline)
                  ? 'text-red-400 font-bold'
                  : 'text-black'}`}>
                  {new Date(apprenticeshipInfo.applicationDeadline).toLocaleDateString()}
                  {isApplicationClosed(apprenticeshipInfo.applicationDeadline) && (
                    <span className="text-red-400 text-sm ml-2">(CLOSED)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-black/50 mr-2" />
              <div>
                <p className="text-sm text-black/70">Industry</p>
                <p className="font-medium text-black">
                  {apprenticeshipInfo.industry}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-black/50 mr-2" />
              <div>
                <p className="text-sm text-black/70">Duration</p>
                <p className="font-medium text-black">
                  {apprenticeshipInfo.duration}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-8 shadow-xl">
          <div className="text-center">
            {isApplicationClosed(apprenticeshipInfo.applicationDeadline) ? (
              <>
                <h3 className="text-lg font-semibold text-red-300 mb-2">
                  Applications Closed
                </h3>
                <p className="text-red-200 mb-4">
                  The application deadline for this position has passed on {new Date(apprenticeshipInfo.applicationDeadline).toLocaleDateString()}.
                </p>
                <button
                  disabled
                  className="w-full bg-gray-500 text-gray-300 py-4 px-6 rounded-xl font-bold cursor-not-allowed shadow-xl opacity-60"
                >
                  Applications Closed
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Ready to apply?
                </h3>
                <p className="text-black/80 mb-2">
                  Join {apprenticeshipInfo.company} and start your career journey!
                </p>
                <p className="text-black/70 text-sm mb-4">
                  Applications close on {new Date(apprenticeshipInfo.applicationDeadline).toLocaleDateString()}
                </p>
                <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black py-4 px-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl">
                  Apply Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      senderId: "company",
      content:
        "Hi Sarah! Thank you for your interest in our Software Developer apprenticeship. We're impressed with your profile!",
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: "2",
      senderId: "student",
      content:
        "Thank you! I'm really excited about this opportunity. I'd love to learn more about the role.",
      timestamp: "10:32 AM",
      isOwn: true,
    },
    {
      id: "3",
      senderId: "company",
      content:
        "Great! We'd like to schedule a video interview with you. Are you available this Friday at 2 PM?",
      timestamp: "10:35 AM",
      isOwn: false,
    },
  ]);

  // Mock chat data
  const chatInfo = {
    company: "TechCorp Ltd",
    jobTitle: "Software Developer",
    companyLogo:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=50&h=50&fit=crop",
  };

  // Check if student can send message (last message must be from company)
  const canSendMessage = () => {
    if (messages.length === 0) return true;
    const lastMessage = messages[messages.length - 1];
    return !lastMessage.isOwn; // Can send if last message is not from student
  };

  const getLastStudentMessage = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].isOwn) {
        return messages[i];
      }
    }
    return null;
  };

  const handleSendMessage = () => {
    if (message.trim() && canSendMessage()) {
      const newMessage = {
        id: `msg_${Date.now()}`,
        senderId: "student",
        content: message.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // In real app, send message via API
      console.log("Sending message:", newMessage.content);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Instagram Style */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-black mr-2 transition-all duration-200"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <img
            src={chatInfo.companyLogo}
            alt={chatInfo.company}
            className="w-8 h-8 rounded-full object-cover mr-3"
          />
          <div>
            <h1 className="font-semibold text-black text-sm">{chatInfo.company}</h1>
            <p className="text-xs text-gray-500">{chatInfo.jobTitle}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full text-black transition-all duration-200">
          <Video className="h-5 w-5" />
        </button>
      </header>

      {/* Messages - Instagram Style */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-2 ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 ${
                msg.isOwn
                  ? "bg-blue-500 text-white rounded-l-3xl rounded-tr-3xl rounded-br-md"
                  : "bg-gray-200 text-black rounded-r-3xl rounded-tl-3xl rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator - Instagram Style */}
        {!canSendMessage() && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-200 rounded-r-3xl rounded-tl-3xl rounded-bl-md px-4 py-2 flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input - Instagram Style */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        {!canSendMessage() && (
          <div className="mb-3 text-center">
            <p className="text-xs text-gray-500">
              Wait for {chatInfo.company} to respond before sending another message
            </p>
          </div>
        )}

        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && canSendMessage() && handleSendMessage()
            }
            placeholder={
              canSendMessage()
                ? "Message..."
                : "Waiting for response..."
            }
            disabled={!canSendMessage()}
            className="flex-1 bg-transparent text-black placeholder-gray-500 text-sm focus:outline-none disabled:text-gray-400"
          />
          {message.trim() && canSendMessage() && (
            <button
              onClick={handleSendMessage}
              className="text-blue-500 font-semibold text-sm ml-2 hover:text-blue-600 transition-colors"
            >
              Send
            </button>
          )}
        </div>

        {!canSendMessage() && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            You: "{getLastStudentMessage()?.content}"
          </div>
        )}
      </div>
    </div>
  );
}

function ProfilePage() {
  const navigate = useNavigate();

  const mockProfile = {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "07123 456789",
    location: "London, UK",
    bio: "Passionate about technology and eager to start my career in software development.",
    skills: ["JavaScript", "React", "Problem Solving", "Communication"],
    availableFrom: "September 2024",
    profileImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b890?w=150&h=150&fit=crop",
  };

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <img
            src={mockProfile.profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mx-auto"
          />
          <button
            onClick={() => navigate('/student/change-picture')}
            className="absolute bottom-0 right-0 bg-orange p-2 rounded-full text-black hover:bg-orange/90 transition-all duration-200"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-black mb-1">
          {mockProfile.firstName} {mockProfile.lastName}
        </h2>
        <p className="text-gray-400">{mockProfile.location}</p>
      </div>

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 text-center shadow-xl hover:shadow-[#00D4FF]/50 transition-all duration-300 hover:scale-105">
            <h3 className="text-2xl font-bold text-black ">12</h3>
            <p className="text-sm text-black font-bold tracking-wide ">Applications</p>
          </div>
          <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 text-center shadow-xl hover:shadow-[#00D4FF]/50 transition-all duration-300 hover:scale-105">
            <h3 className="text-2xl font-bold text-black ">5</h3>
            <p className="text-sm text-black font-bold tracking-wide ">Matches</p>
          </div>
          <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 text-center shadow-xl hover:shadow-[#00D4FF]/50 transition-all duration-300 hover:scale-105">
            <h3 className="text-2xl font-bold text-black ">92%</h3>
            <p className="text-sm text-black font-bold tracking-wide ">Profile Score</p>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-4">
          {/* Bio */}
          <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-black font-semibold ">About</h3>
              <button
                onClick={() => navigate('/student/edit-about')}
                className="text-black/80 hover:text-black transition-all duration-200 hover:scale-110"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-black/80 text-sm">{mockProfile.bio}</p>
          </div>

          {/* Contact Info */}
          <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-black font-semibold ">Contact</h3>
              <button
                onClick={() => navigate('/student/edit-contact')}
                className="text-black/80 hover:text-black transition-all duration-200 hover:scale-110"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-black/80 text-sm">
                <Mail className="h-5 w-5 mr-3 text-black/80" />
                {mockProfile.email}
              </div>
              <div className="flex items-center text-black/80 text-sm">
                <Phone className="h-5 w-5 mr-3 text-black/80" />
                {mockProfile.phone}
              </div>
              <div className="flex items-center text-black/80 text-sm">
                <MapPin className="h-5 w-5 mr-3 text-black/80" />
                {mockProfile.location}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-black font-semibold ">Skills</h3>
              <button
                onClick={() => navigate('/student/edit-skills')}
                className="text-black/80 hover:text-black transition-all duration-200 hover:scale-110"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {mockProfile.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-white/20 text-black px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-black font-semibold ">Availability</h3>
              <button
                onClick={() => navigate('/student/edit-availability')}
                className="text-black/80 hover:text-black transition-all duration-200 hover:scale-110"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center text-black/80 text-sm">
              <Calendar className="h-5 w-5 mr-3 text-black/80" />
              Available from {mockProfile.availableFrom}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={() => {
              try {
                navigate('/student/account-settings');
              } catch (error) {
                console.error('Navigation error to account-settings:', error);
              }
            }}
            className="w-full bg-[#00D4FF] border border-[#00D4FF]/30 text-black py-4 px-6 rounded-xl flex items-center justify-between shadow-xl hover:shadow-[#00D4FF]/50 hover:scale-105 transition-all duration-300"
          >
            <span>Account Settings</span>
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean modern header - only show on non-home pages */}
      {!isActive("/student/home") && !isActive("/student/") && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {location.pathname.includes('/jobs') ? 'Find Jobs' :
               location.pathname.includes('/matches') ? 'Your Matches' :
               location.pathname.includes('/messages') ? 'Messages' :
               location.pathname.includes('/profile') ? 'Profile' :
               'ApprenticeApex'}
            </h1>
            <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link
            to="/student/home"
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
              isActive("/student/home") || isActive("/student/")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className={`p-1 rounded-lg ${
              isActive("/student/home") || isActive("/student/")
                ? "bg-blue-100"
                : ""
            }`}>
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>
          <Link
            to="/student/jobs"
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
              isActive("/student/jobs")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className={`p-1 rounded-lg ${
              isActive("/student/jobs")
                ? "bg-blue-100"
                : ""
            }`}>
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium mt-1">Jobs</span>
          </Link>
          <Link
            to="/student/matches"
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
              isActive("/student/matches")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className={`p-1 rounded-lg ${
              isActive("/student/matches")
                ? "bg-blue-100"
                : ""
            }`}>
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium mt-1">Matches</span>
          </Link>
          <Link
            to="/student/messages"
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
              isActive("/student/messages")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className={`p-1 rounded-lg ${
              isActive("/student/messages")
                ? "bg-blue-100"
                : ""
            }`}>
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium mt-1">Messages</span>
          </Link>
          <Link
            to="/student/profile"
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
              isActive("/student/profile")
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className={`p-1 rounded-lg ${
              isActive("/student/profile")
                ? "bg-blue-100"
                : ""
            }`}>
              <User className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium mt-1">Profile</span>
          </Link>
        </div>
      </nav>
      <LiveChat />
    </div>
  );
}

function EditAboutPage() {
  const navigate = useNavigate();
  const [bio, setBio] = useState("Passionate about technology and eager to start my career in software development.");

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving bio:', bio);
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Edit About</h1>
      </div>

      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-black mb-4">About Me</h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell employers about yourself..."
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        />
        <p className="text-sm text-black/60 mt-2">{bio.length}/500 characters</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function EditContactPage() {
  const navigate = useNavigate();
  const [contact, setContact] = useState({
    email: "sarah.johnson@email.com",
    phone: "07123 456789",
    location: "London, UK"
  });

  const handleSave = () => {
    console.log('Saving contact info:', contact);
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Edit Contact</h1>
      </div>

      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-black mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact({...contact, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Phone</label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact({...contact, phone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Location</label>
            <input
              type="text"
              value={contact.location}
              onChange={(e) => setContact({...contact, location: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function EditSkillsPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState(["JavaScript", "React", "Problem Solving", "Communication"]);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSave = () => {
    console.log('Saving skills:', skills);
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Edit Skills</h1>
      </div>

      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-black mb-4">Your Skills</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <span
              key={skill}
              className="bg-white/20 text-black px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="hover:bg-red-500/20 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Add a new skill..."
            className="flex-1 p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={addSkill}
            className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-semibold transition-all duration-300"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function EditAvailabilityPage() {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState("September 2024");

  const handleSave = () => {
    console.log('Saving availability:', availability);
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Edit Availability</h1>
      </div>

      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-black mb-4">When are you available to start?</h3>
        <input
          type="text"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          placeholder="e.g., September 2024"
          className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ChangePicturePage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log('Saving new profile picture');
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Change Picture</h1>
      </div>

      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-black mb-4">Profile Picture</h3>

        <div className="text-center">
          <div className="relative inline-block mb-4">
            <img
              src={selectedImage || "https://images.unsplash.com/photo-1494790108755-2616b612b890?w=150&h=150&fit=crop"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mx-auto"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="bg-orange hover:bg-orange/90 text-black px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 inline-block"
          >
            Choose New Picture
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function EditProfileInfoPage() {
  const navigate = useNavigate();
  const [profileInfo, setProfileInfo] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    dateOfBirth: "1995-05-15",
    gender: "Female"
  });

  const handleSave = () => {
    console.log('Saving profile info:', profileInfo);
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Edit Profile Information</h1>
      </div>

      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-black mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">First Name</label>
            <input
              type="text"
              value={profileInfo.firstName}
              onChange={(e) => setProfileInfo({...profileInfo, firstName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Last Name</label>
            <input
              type="text"
              value={profileInfo.lastName}
              onChange={(e) => setProfileInfo({...profileInfo, lastName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Date of Birth</label>
            <input
              type="date"
              value={profileInfo.dateOfBirth}
              onChange={(e) => setProfileInfo({...profileInfo, dateOfBirth: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Gender</label>
            <select
              value={profileInfo.gender}
              onChange={(e) => setProfileInfo({...profileInfo, gender: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function EditSkillsPreferencesPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    industries: ["Technology", "Marketing"],
    jobTypes: ["Apprenticeship", "Graduate Role"],
    workLocations: ["On-site", "Hybrid"],
    salaryRange: { min: 18000, max: 30000 }
  });

  const handleSave = () => {
    console.log('Saving skills and preferences:', preferences);
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Skills & Preferences</h1>
      </div>

      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-black mb-4">Job Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Preferred Industries</label>
            <div className="flex flex-wrap gap-2">
              {["Technology", "Marketing", "Finance", "Healthcare", "Education"].map((industry) => (
                <button
                  key={industry}
                  onClick={() => {
                    const newIndustries = preferences.industries.includes(industry)
                      ? preferences.industries.filter(i => i !== industry)
                      : [...preferences.industries, industry];
                    setPreferences({...preferences, industries: newIndustries});
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                    preferences.industries.includes(industry)
                      ? 'bg-cyan-500 text-black'
                      : 'bg-white/20 text-black hover:bg-white/30'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Salary Range (£)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={preferences.salaryRange.min}
                onChange={(e) => setPreferences({
                  ...preferences,
                  salaryRange: {...preferences.salaryRange, min: parseInt(e.target.value)}
                })}
                className="flex-1 p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Min"
              />
              <span className="text-black">to</span>
              <input
                type="number"
                value={preferences.salaryRange.max}
                onChange={(e) => setPreferences({
                  ...preferences,
                  salaryRange: {...preferences.salaryRange, max: parseInt(e.target.value)}
                })}
                className="flex-1 p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleSave = () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords don't match!");
      return;
    }
    console.log('Changing password');
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Change Password</h1>
      </div>

      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-black mb-4">Password Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

// Create placeholder pages for the remaining settings
function PrivacySettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-black mr-3">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Privacy Settings</h1>
      </div>
      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <p className="text-black">Privacy settings configuration will be available soon.</p>
      </div>
    </div>
  );
}

function TwoFactorAuthPage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-black mr-3">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Two-Factor Authentication</h1>
      </div>
      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <p className="text-black">Two-factor authentication setup will be available soon.</p>
      </div>
    </div>
  );
}

function NotificationSettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-black mr-3">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Notification Settings</h1>
      </div>
      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <p className="text-black">Notification preferences will be available soon.</p>
      </div>
    </div>
  );
}

function EmailPreferencesPage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-black mr-3">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Email Preferences</h1>
      </div>
      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <p className="text-black">Email preferences configuration will be available soon.</p>
      </div>
    </div>
  );
}

function LanguageRegionPage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-black mr-3">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Language & Region</h1>
      </div>
      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <p className="text-black">Language and region settings will be available soon.</p>
      </div>
    </div>
  );
}

function DataStoragePage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-black mr-3">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Data & Storage</h1>
      </div>
      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <p className="text-black">Data and storage management will be available soon.</p>
      </div>
    </div>
  );
}

function DownloadDataPage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-black mr-3">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Download My Data</h1>
      </div>
      <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
        <p className="text-black">Data download functionality will be available soon.</p>
      </div>
    </div>
  );
}

function DeleteAccountPage() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-black mr-3">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Delete Account</h1>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <p className="text-red-600 mb-4">Account deletion is permanent and cannot be undone.</p>
        <button className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300">
          Permanently Delete Account
        </button>
      </div>
    </div>
  );
}

function AccountSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-black mr-3 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-black">Account Settings</h1>
      </div>

      {/* Settings Options */}
      <div className="space-y-4">
        {/* Profile Settings */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-4">Profile Settings</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/edit-profile-info')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Edit Profile Information</span>
              <Edit className="h-5 w-5 text-black" />
            </button>
            <button
              onClick={() => navigate('/student/change-picture')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Change Profile Picture</span>
              <Camera className="h-5 w-5 text-black" />
            </button>
            <button
              onClick={() => navigate('/student/edit-skills-preferences')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Update Skills & Preferences</span>
              <User className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-4">Privacy & Security</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/change-password')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Change Password</span>
              <Settings className="h-5 w-5 text-black" />
            </button>
            <button
              onClick={() => navigate('/student/privacy-settings')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Privacy Settings</span>
              <Settings className="h-5 w-5 text-black" />
            </button>
            <button
              onClick={() => navigate('/student/two-factor-auth')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Two-Factor Authentication</span>
              <Settings className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-4">Notifications</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/notification-settings')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Push Notifications</span>
              <Settings className="h-5 w-5 text-black" />
            </button>
            <button
              onClick={() => navigate('/student/email-preferences')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Email Preferences</span>
              <Mail className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-4">App Settings</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/language-region')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Language & Region</span>
              <Settings className="h-5 w-5 text-black" />
            </button>
            <button
              onClick={() => navigate('/student/data-storage')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Data & Storage</span>
              <Settings className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-[#00D4FF] border border-[#00D4FF]/30 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-black mb-4">Account</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/download-data')}
              className="w-full text-left p-3 hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-black">Download My Data</span>
              <Settings className="h-5 w-5 text-black" />
            </button>
            <button
              onClick={() => {
                if(confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  navigate('/student/delete-account');
                }
              }}
              className="w-full text-left p-3 hover:bg-red-100 rounded-lg transition-all duration-200 flex items-center justify-between text-red-600"
            >
              <span>Delete Account</span>
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentApp() {
  return (
    <Routes>
      <Route
        path="/apprenticeship-info/:id"
        element={<ApprenticeshipInfoPage />}
      />
      <Route path="/chat/:id" element={<ChatPage />} />
      <Route
        path="/*"
        element={
          <StudentAppLayout>
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/account-settings" element={<AccountSettingsPage />} />
              <Route path="/edit-about" element={<EditAboutPage />} />
              <Route path="/edit-contact" element={<EditContactPage />} />
              <Route path="/edit-skills" element={<EditSkillsPage />} />
              <Route path="/edit-availability" element={<EditAvailabilityPage />} />
              <Route path="/change-picture" element={<ChangePicturePage />} />
              <Route path="/edit-profile-info" element={<EditProfileInfoPage />} />
              <Route path="/edit-skills-preferences" element={<EditSkillsPreferencesPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/privacy-settings" element={<PrivacySettingsPage />} />
              <Route path="/two-factor-auth" element={<TwoFactorAuthPage />} />
              <Route path="/notification-settings" element={<NotificationSettingsPage />} />
              <Route path="/email-preferences" element={<EmailPreferencesPage />} />
              <Route path="/language-region" element={<LanguageRegionPage />} />
              <Route path="/data-storage" element={<DataStoragePage />} />
              <Route path="/download-data" element={<DownloadDataPage />} />
              <Route path="/delete-account" element={<DeleteAccountPage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </StudentAppLayout>
        }
      />
    </Routes>
  );
}
