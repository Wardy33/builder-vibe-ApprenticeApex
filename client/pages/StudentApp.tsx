import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
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

function SwipeInterface() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [apprenticeships, setApprenticeships] = useState(mockApprenticeship);

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

function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

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
          <span className="text-orange">Apprentice</span>Match
        </h1>
        <button className="p-2 hover:bg-gray-800 rounded-full">
          <Settings className="h-6 w-6" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Bottom Navigation */}
      <nav className="flex justify-around items-center p-4 border-t border-gray-800">
        <Link to="/student" className="flex flex-col items-center p-2">
          <Heart className="h-6 w-6 mb-1 text-orange" />
          <span className="text-xs text-orange">Discover</span>
        </Link>
        <Link to="/student/matches" className="flex flex-col items-center p-2">
          <User className="h-6 w-6 mb-1 text-gray-400" />
          <span className="text-xs text-gray-400">Matches</span>
        </Link>
        <Link to="/student/messages" className="flex flex-col items-center p-2">
          <MessageCircle className="h-6 w-6 mb-1 text-gray-400" />
          <span className="text-xs text-gray-400">Messages</span>
        </Link>
        <Link to="/student/profile" className="flex flex-col items-center p-2">
          <User className="h-6 w-6 mb-1 text-gray-400" />
          <span className="text-xs text-gray-400">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-140px)]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange mb-4">{title}</h2>
        <p className="text-gray-400">This feature is coming soon!</p>
      </div>
    </div>
  );
}

export default function StudentApp() {
  return (
    <StudentAppLayout>
      <Routes>
        <Route path="/" element={<SwipeInterface />} />
        <Route
          path="/matches"
          element={<PlaceholderPage title="Your Matches" />}
        />
        <Route
          path="/messages"
          element={<PlaceholderPage title="Messages" />}
        />
        <Route
          path="/profile"
          element={<PlaceholderPage title="Your Profile" />}
        />
      </Routes>
    </StudentAppLayout>
  );
}
