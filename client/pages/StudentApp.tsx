import { useState, useRef, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
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
} from "lucide-react";

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
    distance: "2.3 km",
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
    distance: "1.8 km",
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
    distance: "3.1 km",
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
  const cardRef = useRef<HTMLDivElement>(null);

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
      className={`swipe-card w-full max-w-sm mx-auto h-[600px] cursor-grab ${isDragging ? "cursor-grabbing dragging" : ""}`}
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
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold">{apprenticeship.jobTitle}</h3>
            <span className="bg-orange px-3 py-1 rounded-full text-sm font-medium">
              {apprenticeship.duration}
            </span>
          </div>

          <div className="flex items-center mb-2">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="text-lg">{apprenticeship.company}</span>
          </div>

          <div className="flex items-center mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>
              {apprenticeship.location} • {apprenticeship.distance}
            </span>
          </div>

          <div className="flex items-center mb-4">
            <Briefcase className="h-4 w-4 mr-2" />
            <span>{apprenticeship.industry}</span>
          </div>

          <p className="text-sm text-gray-200 mb-4 line-clamp-3">
            {apprenticeship.description}
          </p>

          <div className="text-lg font-semibold text-orange">
            {apprenticeship.salary}
          </div>
        </div>

        {/* Swipe indicators */}
        {dragDistance > 50 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl">
              INTERESTED
            </div>
          </div>
        )}
        {dragDistance < -50 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl">
              PASS
            </div>
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

  const handleSwipe = (direction: "left" | "right") => {
    console.log(
      `Swiped ${direction} on ${apprenticeships[currentIndex]?.jobTitle}`,
    );

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
            className="bg-orange text-white px-6 py-3 rounded-full font-medium"
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
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search apprenticeships..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700"
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
          className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        >
          <X className="h-8 w-8 text-white" />
        </button>

        <button
          onClick={() => handleButtonSwipe("right")}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
        >
          <Heart className="h-8 w-8 text-white" />
        </button>
      </div>
    </div>
  );
}

function MatchesPage() {
  const mockMatches = [
    {
      id: "1",
      jobTitle: "Software Developer",
      company: "TechCorp Ltd",
      matchDate: "2 days ago",
      status: "new",
      image:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop",
    },
    {
      id: "2",
      jobTitle: "Digital Marketing Assistant",
      company: "Creative Agency",
      matchDate: "1 week ago",
      status: "viewed",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop",
    },
  ];

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Matches</h2>
        <p className="text-gray-400">
          Companies that are interested in your profile
        </p>
      </div>

      {mockMatches.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No matches yet
          </h3>
          <p className="text-gray-400 mb-6">
            Keep swiping to find your perfect apprenticeship!
          </p>
          <Link
            to="/student/main"
            className="bg-orange text-white px-6 py-3 rounded-lg font-medium"
          >
            Start Swiping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockMatches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
            >
              <img
                src={match.image}
                alt={match.jobTitle}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold">{match.jobTitle}</h3>
                <p className="text-gray-400">{match.company}</p>
                <p className="text-sm text-gray-500">{match.matchDate}</p>
              </div>
              <div className="flex flex-col gap-2">
                {match.status === "new" && (
                  <span className="bg-orange text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
                <button className="bg-orange text-white px-4 py-2 rounded-lg text-sm">
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
        <p className="text-gray-400">Chat with companies</p>
      </div>

      {mockConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No messages yet
          </h3>
          <p className="text-gray-400 mb-6">
            Start matching with companies to begin conversations!
          </p>
          <Link
            to="/student/main"
            className="bg-orange text-white px-6 py-3 rounded-lg font-medium"
          >
            Find Matches
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center space-x-4 cursor-pointer transition-colors"
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
                  className={`text-sm truncate ${conversation.unread ? "text-white" : "text-gray-400"}`}
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
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold text-orange">12</h3>
            <p className="text-sm text-gray-400">Applications</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold text-orange">5</h3>
            <p className="text-sm text-gray-400">Matches</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold text-orange">92%</h3>
            <p className="text-sm text-gray-400">Profile Score</p>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-4">
          {/* Bio */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">About</h3>
              <button className="text-orange">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-300 text-sm">{mockProfile.bio}</p>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Contact</h3>
              <button className="text-orange">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300 text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                {mockProfile.email}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                {mockProfile.phone}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                {mockProfile.location}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Skills</h3>
              <button className="text-orange">
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
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Availability</h3>
              <button className="text-orange">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              Available from {mockProfile.availableFrom}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-gray-700">
          <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors">
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">
          <span className="text-orange">Apprentice</span>Apex
        </h1>
        <button className="p-2 hover:bg-gray-800 rounded-full">
          <Settings className="h-6 w-6" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/student/main"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              isActive("/student/main")
                ? "text-orange bg-orange/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Briefcase className="h-6 w-6 mb-1" />
            <span className="text-xs">Jobs</span>
          </Link>
          <Link
            to="/student/matches"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              isActive("/student/matches")
                ? "text-orange bg-orange/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Heart className="h-6 w-6 mb-1" />
            <span className="text-xs">Matches</span>
          </Link>
          <Link
            to="/student/messages"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              isActive("/student/messages")
                ? "text-orange bg-orange/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <MessageCircle className="h-6 w-6 mb-1" />
            <span className="text-xs">Messages</span>
          </Link>
          <Link
            to="/student/profile"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              isActive("/student/profile")
                ? "text-orange bg-orange/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function StudentApp() {
  return (
    <StudentAppLayout>
      <Routes>
        <Route path="/main" element={<JobsPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<JobsPage />} />
      </Routes>
    </StudentAppLayout>
  );
}
