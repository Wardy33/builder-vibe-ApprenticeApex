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
      className={`swipe-card w-full max-w-sm mx-auto h-[500px] cursor-grab ${isDragging ? "cursor-grabbing dragging" : ""}`}
      style={{
        transform: `translateX(${dragDistance}px) rotate(${dragDistance * 0.1}deg)`,
        ...style,
      }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div className="relative h-full">
        <img
          src={apprenticeship.image}
          alt={apprenticeship.jobTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-overlay" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {/* Header with company logo and duration */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg">
                <Building2 className="h-6 w-6 text-gray-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-white leading-tight">
                  {apprenticeship.jobTitle}
                </h3>
                <p className="text-orange font-medium text-sm">
                  {apprenticeship.company}
                </p>
              </div>
            </div>
            <span className="bg-orange px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0">
              {apprenticeship.duration}
            </span>
          </div>

          {/* Location, Distance and Industry */}
          <div className="space-y-2 mb-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-gray-300" />
                <span className="text-gray-300">{apprenticeship.location}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-3 w-3 mr-1 text-gray-300" />
                <span className="text-gray-300">{apprenticeship.industry}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Navigation className="h-3 w-3 mr-1 text-orange" />
                <span className="text-orange font-medium">
                  {apprenticeship.distance} from home
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTransportRoutes(apprenticeship);
                }}
                className="flex items-center bg-gradient-to-r from-gray-600/60 via-gray-700/60 to-gray-800/60 hover:from-gray-500/80 hover:via-gray-600/80 hover:to-gray-700/80 px-2 py-1 rounded-lg text-xs transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 shadow-lg"
              >
                <RouteIcon className="h-3 w-3 mr-1" />
                Routes
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-200 mb-3 line-clamp-2 leading-relaxed">
            {apprenticeship.description}
          </p>

          {/* Requirements Preview */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {apprenticeship.requirements.slice(0, 2).map((req, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-gray-600/60 via-gray-700/70 to-gray-800/60 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm border border-white/20 shadow-sm"
                >
                  {req}
                </span>
              ))}
              {apprenticeship.requirements.length > 2 && (
                <span className="bg-gray-700/80 text-white px-2 py-1 rounded text-xs">
                  +{apprenticeship.requirements.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Salary */}
          <div className="text-base font-semibold text-orange">
            {apprenticeship.salary}
          </div>
        </div>

        {/* Swipe indicators */}
        {dragDistance > 50 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-white px-6 py-3 rounded-full font-bold text-xl animate-pulse shadow-2xl border-2 border-white/30">
              INTERESTED
            </div>
          </div>
        )}
        {dragDistance < -50 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-6 py-3 rounded-full font-bold text-xl animate-pulse shadow-2xl border-2 border-white/30">
              PASS
            </div>
          </div>
        )}

        {/* Transport Routes Modal */}
        {showTransportModal && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-20">
            <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/40 to-purple-900/50 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm border border-purple-400/30 shadow-2xl shadow-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
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
                      <p className="font-medium text-white">Bus Route</p>
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
                      <p className="font-medium text-white">Train Route</p>
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
                    <Car className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium text-white">Driving</p>
                      <p className="text-sm text-gray-300">
                        12 min • Parking £8/day
                      </p>
                    </div>
                  </div>
                  <button className="text-orange-600 text-sm font-medium hover:underline">
                    View
                  </button>
                </div>

                {/* Walking */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-500/20 via-gray-600/20 to-gray-700/20 rounded-lg border border-gray-400/30 backdrop-blur-sm">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-300 mr-3" />
                    <div>
                      <p className="font-medium text-white">Walking</p>
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
                  className="flex-1 bg-gray-700/40 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600/40 transition-colors backdrop-blur-sm border border-white/20"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Open external maps app
                    const mapsUrl = `https://maps.google.com/maps/dir/Your+Home/${encodeURIComponent(apprenticeship.location)}`;
                    window.open(mapsUrl, "_blank");
                  }}
                  className="flex-1 bg-orange text-white py-2 px-4 rounded-lg font-medium hover:bg-orange/90 transition-colors"
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
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, Sarah!
        </h1>
        <p className="text-gray-300">
          Here's your apprenticeship journey overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 text-center shadow-lg shadow-purple-500/10">
          <h3 className="text-2xl font-bold text-orange">
            {applications.length}
          </h3>
          <p className="text-sm text-gray-300">Active Applications</p>
        </div>
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 text-center shadow-lg shadow-purple-500/10">
          <h3 className="text-2xl font-bold text-orange">
            {interviews.length}
          </h3>
          <p className="text-sm text-gray-300">Upcoming Interviews</p>
        </div>
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 text-center shadow-lg shadow-purple-500/10">
          <h3 className="text-2xl font-bold text-orange">{profileScore}%</h3>
          <p className="text-sm text-gray-300">Profile Score</p>
        </div>
      </div>

      {/* Current Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Current Applications
          </h2>
          <Link
            to="/student/applications"
            className="text-orange text-sm hover:underline"
          >
            View All
          </Link>
        </div>

        {mockApplications.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-6 text-center shadow-lg shadow-purple-500/10">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Start swiping to apply for apprenticeships!
            </p>
            <Link
              to="/student/jobs"
              className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 shadow-xl border border-white/20"
            >
              Find Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mockApplications.map((application) => (
              <div
                key={application.id}
                className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-pink-400/30 hover:scale-102 transition-all duration-300 hover:border-purple-300/40 group cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={application.image}
                    alt={application.company}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {application.jobTitle}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {application.company}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Applied {application.appliedDate}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(application.status)}`}
                    >
                      {getStatusText(application.status)}
                    </span>
                    <div className="text-orange text-sm font-medium">
                      {application.matchScore}% match
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Interviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Upcoming Interviews
          </h2>
          <Link
            to="/student/interviews"
            className="text-orange text-sm hover:underline"
          >
            View All
          </Link>
        </div>

        {mockInterviews.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-6 text-center shadow-lg shadow-purple-500/10">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">
              No Interviews Scheduled
            </h3>
            <p className="text-gray-300 text-sm">
              Your interview invitations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-pink-400/30 hover:scale-102 transition-all duration-300 hover:border-purple-300/40 group cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={interview.image}
                    alt={interview.company}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {interview.jobTitle}
                    </h3>
                    <p className="text-gray-300 text-sm">{interview.company}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center text-gray-300 text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {interview.date} at {interview.time}
                      </div>
                      <div className="flex items-center text-gray-300 text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        {interview.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        interview.status === "confirmed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {interview.status === "confirmed" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {interview.status === "confirmed"
                        ? "Confirmed"
                        : "Pending"}
                    </span>
                    <button className="bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500 hover:from-green-500 hover:via-cyan-600 hover:to-blue-600 text-white px-3 py-1 rounded text-xs transition-all duration-300 hover:scale-105 shadow-lg border border-white/20">
                      Join Call
                    </button>
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
          <h3 className="text-2xl font-bold text-white mb-4">
            No more opportunities!
          </h3>
          <p className="text-gray-400 mb-6">
            Check back later for new apprenticeships
          </p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-xl border border-white/20"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with search and filters */}
      <div className="p-4 border-b border-white/20 bg-gray-800/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search apprenticeships..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/40 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange backdrop-blur-sm transition-all duration-200"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-800/40 border border-white/20 rounded-lg text-white hover:bg-gray-700/40 backdrop-blur-sm transition-all duration-200"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
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
                transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * 10}px)`,
                opacity: 1 - (index + 1) * 0.2,
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

      {/* Action buttons */}
      <div className="flex justify-center items-center gap-8 p-6">
        <button
          onClick={() => handleButtonSwipe("left")}
          className="w-16 h-16 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl hover:from-red-600 hover:via-pink-600 hover:to-red-700 transition-all duration-300 hover:scale-110 border-2 border-white/20"
        >
          <X className="h-8 w-8 text-white drop-shadow-lg" />
        </button>

        <button
          onClick={() => handleButtonSwipe("right")}
          className="w-16 h-16 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl hover:from-green-500 hover:via-emerald-600 hover:to-green-700 transition-all duration-300 hover:scale-110 border-2 border-white/20"
        >
          <Heart className="h-8 w-8 text-white drop-shadow-lg" />
        </button>
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
        <h2 className="text-2xl font-bold text-white mb-2">Your Matches</h2>
        <p className="text-gray-300">
          Companies that are interested in your profile
        </p>
      </div>

      {mockMatches.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No matches yet
          </h3>
          <p className="text-gray-300 mb-6">
            Keep swiping to find your perfect apprenticeship!
          </p>
          <Link
            to="/student/jobs"
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-xl border border-white/20"
          >
            Start Swiping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockMatches.map((match) => (
            <div
              key={match.id}
              className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 flex items-center space-x-4 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-pink-400/30 hover:scale-102 transition-all duration-300 hover:border-purple-300/40 group cursor-pointer"
            >
              <img
                src={match.image}
                alt={match.jobTitle}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold">
                  {match.jobTitle}
                </h3>
                <p className="text-gray-300">{match.company}</p>
                <p className="text-sm text-gray-500">{match.matchDate}</p>
              </div>
              <div className="flex flex-col gap-2">
                {match.status === "new" && (
                  <span className="bg-orange text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
                <button
                  onClick={() =>
                    navigate(`/student/apprenticeship-info/${match.id}`)
                  }
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 shadow-lg border border-white/20"
                >
                  <Info className="h-4 w-4" />
                  Info
                </button>
                <button
                  onClick={() => navigate(`/student/chat/${match.id}`)}
                  className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1 shadow-lg border border-white/20"
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
        <h2 className="text-2xl font-bold text-white mb-2">Messages</h2>
        <p className="text-gray-300">Chat with companies</p>
      </div>

      {mockConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No messages yet
          </h3>
          <p className="text-gray-300 mb-6">
            Start matching with companies to begin conversations!
          </p>
          <Link
            to="/student/jobs"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-xl border border-white/20"
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
              className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 backdrop-blur-sm border border-purple-400/20 hover:from-purple-700/40 hover:via-pink-600/30 hover:to-purple-800/50 rounded-lg p-4 flex items-center space-x-4 cursor-pointer transition-all duration-300 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-pink-400/30 hover:scale-102 hover:border-purple-300/40 group"
            >
              <img
                src={conversation.avatar}
                alt={conversation.company}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold truncate">
                    {conversation.company}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conversation.time}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${conversation.unread ? "text-white" : "text-gray-300"}`}
                >
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unread && (
                <div className="w-3 h-3 bg-orange rounded-full flex-shrink-0" />
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
    applicationDeadline: "15th July 2024",
    companyImage:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
    companyLogo:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
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

      <div className="p-4 space-y-6">
        {/* Company Header */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
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
              <p className="text-orange font-semibold text-lg mb-2">
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
            <div className="text-2xl font-bold text-orange">
              {apprenticeshipInfo.salary}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/student/chat/${id}`)}
                className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-xl border border-white/20"
              >
                <MessageCircle className="h-4 w-4" />
                Message Company
              </button>
            </div>
          </div>
        </div>

        {/* Company Image */}
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm overflow-hidden shadow-lg shadow-purple-500/10">
          <img
            src={apprenticeshipInfo.companyImage}
            alt="Company office"
            className="w-full h-48 object-cover"
          />
        </div>

        {/* Description */}
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10">
          <h3 className="text-lg font-semibold text-white mb-3">
            About this role
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {apprenticeshipInfo.description}
          </p>
        </div>

        {/* Requirements */}
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10">
          <h3 className="text-lg font-semibold text-white mb-3">
            Requirements
          </h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.requirements.map((req, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Responsibilities */}
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10">
          <h3 className="text-lg font-semibold text-white mb-3">
            Your responsibilities
          </h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.responsibilities.map((resp, index) => (
              <li key={index} className="flex items-start">
                <Briefcase className="h-5 w-5 text-orange mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10">
          <h3 className="text-lg font-semibold text-white mb-3">
            Benefits & Perks
          </h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Details */}
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10">
          <h3 className="text-lg font-semibold text-white mb-3">
            Key Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-300">Start Date</p>
                <p className="font-medium text-white">
                  {apprenticeshipInfo.startDate}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-300">Application Deadline</p>
                <p className="font-medium text-white">
                  {apprenticeshipInfo.applicationDeadline}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-300">Industry</p>
                <p className="font-medium text-white">
                  {apprenticeshipInfo.industry}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-300">Duration</p>
                <p className="font-medium text-white">
                  {apprenticeshipInfo.duration}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to apply?
            </h3>
            <p className="text-gray-300 mb-4">
              Join {apprenticeshipInfo.company} and start your career journey!
            </p>
            <button className="w-full bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 hover:from-green-500 hover:via-emerald-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl border border-white/20">
              Apply Now
            </button>
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-sm">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800/40 backdrop-blur-sm/10 rounded-full text-white mr-2 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <img
            src={chatInfo.companyLogo}
            alt={chatInfo.company}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <h1 className="font-semibold text-white">{chatInfo.company}</h1>
            <p className="text-sm text-gray-300">{chatInfo.jobTitle}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-800/40 backdrop-blur-sm/10 rounded-full text-white transition-all duration-200 hover:scale-105">
          <Video className="h-6 w-6" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.isOwn ? "bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white" : "bg-gradient-to-br from-gray-700/40 via-gray-800/40 to-gray-900/40 text-white border border-white/10 backdrop-blur-sm"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${msg.isOwn ? "text-orange-100" : "text-gray-500"}`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {/* Waiting for response indicator */}
        {!canSendMessage() && (
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-orange-500/20 border border-yellow-400/30 rounded-lg px-4 py-2 flex items-center space-x-2 backdrop-blur-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-yellow-300">
                Waiting for {chatInfo.company} to respond...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/20 bg-gray-800/40 backdrop-blur-sm">
        {!canSendMessage() && (
          <div className="mb-3 text-center">
            <p className="text-sm text-gray-300">
              Please wait for {chatInfo.company} to respond before sending
              another message
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && canSendMessage() && handleSendMessage()
            }
            placeholder={
              canSendMessage()
                ? "Type a message..."
                : "Waiting for company response..."
            }
            disabled={!canSendMessage()}
            className="flex-1 px-4 py-2 bg-gray-800/40 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange disabled:bg-gray-900/40 disabled:text-gray-500 disabled:cursor-not-allowed backdrop-blur-sm transition-all duration-200"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !canSendMessage()}
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-white p-2 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/20"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>

        {!canSendMessage() && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            You sent: "{getLastStudentMessage()?.content}"
          </div>
        )}
      </div>
    </div>
  );
}

function ProfilePage() {
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
          <button className="absolute bottom-0 right-0 bg-orange p-2 rounded-full text-white">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {mockProfile.firstName} {mockProfile.lastName}
        </h2>
        <p className="text-gray-400">{mockProfile.location}</p>
      </div>

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 text-center shadow-lg shadow-purple-500/10">
            <h3 className="text-2xl font-bold text-orange">12</h3>
            <p className="text-sm text-purple-200">Applications</p>
          </div>
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 text-center shadow-lg shadow-purple-500/10">
            <h3 className="text-2xl font-bold text-orange">5</h3>
            <p className="text-sm text-cyan-200">Matches</p>
          </div>
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 text-center shadow-lg shadow-purple-500/10">
            <h3 className="text-2xl font-bold text-orange">92%</h3>
            <p className="text-sm text-cyan-200">Profile Score</p>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-4">
          {/* Bio */}
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">About</h3>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-300 text-sm">{mockProfile.bio}</p>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Contact</h3>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm">
                <Mail className="h-4 w-4 mr-2 text-cyan-400" />
                {mockProfile.email}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Phone className="h-4 w-4 mr-2 text-cyan-400" />
                {mockProfile.phone}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin className="h-4 w-4 mr-2 text-cyan-400" />
                {mockProfile.location}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Skills</h3>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {mockProfile.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 rounded-lg backdrop-blur-sm p-4 shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Availability</h3>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
              Available from {mockProfile.availableFrom}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-gray-700">
          <button className="w-full bg-gradient-to-br from-purple-800/30 via-pink-700/20 to-purple-900/40 border border-purple-400/20 hover:from-purple-700/40 hover:via-pink-600/30 hover:to-purple-800/50 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-all duration-200 backdrop-blur-sm hover:scale-102 shadow-lg shadow-purple-500/10 hover:shadow-pink-400/30">
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header - Gen-Z styling */}
      <header className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gradient-to-r hover:from-orange-400/20 hover:to-pink-500/20 rounded-full text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-transparent hover:border-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">
          <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Apprentice</span><span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Apex</span>
        </h1>
        <button className="p-2 hover:bg-gradient-to-r hover:from-cyan-400/20 hover:to-blue-500/20 rounded-full text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-transparent hover:border-white/20">
          <Settings className="h-6 w-6" />
        </button>
      </header>

      {/* Content - Gen-Z background */}
      <main className="flex-1 pb-20 bg-gradient-to-br from-gray-900/50 to-black/50 text-white backdrop-blur-sm">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-black via-gray-900 to-black border-t border-white/20 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/student/home"
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              isActive("/student/home")
                ? "text-white bg-gradient-to-r from-orange-400 to-pink-500 scale-105"
                : "text-gray-300 hover:text-orange-400 hover:scale-105"
            }`}
          >
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/student/jobs"
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              isActive("/student/jobs")
                ? "text-white bg-gradient-to-r from-cyan-400 to-blue-500 scale-105"
                : "text-gray-300 hover:text-cyan-400 hover:scale-105"
            }`}
          >
            <Briefcase className="h-6 w-6 mb-1" />
            <span className="text-xs">Jobs</span>
          </Link>
          <Link
            to="/student/matches"
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              isActive("/student/matches")
                ? "text-white bg-gradient-to-r from-pink-500 to-red-500 scale-105"
                : "text-gray-300 hover:text-pink-400 hover:scale-105"
            }`}
          >
            <Heart className="h-6 w-6 mb-1" />
            <span className="text-xs">Matches</span>
          </Link>
          <Link
            to="/student/messages"
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              isActive("/student/messages")
                ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 scale-105"
                : "text-gray-300 hover:text-purple-400 hover:scale-105"
            }`}
          >
            <MessageCircle className="h-6 w-6 mb-1" />
            <span className="text-xs">Messages</span>
          </Link>
          <Link
            to="/student/profile"
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              isActive("/student/profile")
                ? "text-white bg-gradient-to-r from-green-400 to-cyan-400 scale-105"
                : "text-gray-300 hover:text-green-400 hover:scale-105"
            }`}
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
      <LiveChat />
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
              <Route path="/" element={<HomePage />} />
            </Routes>
          </StudentAppLayout>
        }
      />
    </Routes>
  );
}
