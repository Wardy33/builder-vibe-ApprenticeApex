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
            <h1 className="text-lg font-semibold text-gray-900">
              {location.pathname.includes('/jobs') ? 'Find Jobs' :
               location.pathname.includes('/matches') ? 'Your Matches' :
               location.pathname.includes('/messages') ? 'Messages' :
               location.pathname.includes('/profile') ? 'Profile' : 'ApprenticeApex'}
            </h1>
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
            { path: "/student/profile", icon: User, label: "Profile" }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                isActive(item.path) || (item.path === "/student/home" && isActive("/student/"))
                  ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive(item.path) || (item.path === "/student/home" && isActive("/student/"))
                  ? "bg-blue-100" : ""
              }`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <LiveChat />
    </div>
  );
}

// Edit Pages with common structure
const EditPage = ({ title, children, onSave, loading = false, success = false }: {
  title: string;
  children: React.ReactNode;
  import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Heart, X, MapPin, Building2, Clock, Filter, User, MessageCircle, Video, ArrowLeft, Settings, Briefcase, Search, Star, Calendar,
  Phone, Mail, Edit, Camera, Home, FileText, CheckCircle, AlertCircle, Navigation, Bus, Train, Car, Route as RouteIcon, Info, Lock,
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

const getStatusColor = (status: string) => ({
  applied: "bg-blue-500", viewed: "bg-yellow-500", shortlisted: "bg-green-500",
  interview_scheduled: "bg-purple-500", rejected: "bg-red-500", accepted: "bg-emerald-500"
}[status] || "bg-gray-500");

const getStatusText = (status: string) => ({
  applied: "Applied", viewed: "Viewed", shortlisted: "Shortlisted",
  interview_scheduled: "Interview", rejected: "Rejected", accepted: "Accepted"
}[status] || status);

// Mock data
const mockApprenticeship: Apprenticeship[] = [
  {
    id: "1", jobTitle: "Software Developer", company: "TechCorp Ltd", industry: "Technology", location: "London, UK", distance: "1.4 miles", duration: "3 years",
    description: "Join our dynamic team and learn cutting-edge web development technologies. You'll work on real projects from day one.",
    requirements: ["Basic coding knowledge", "Problem-solving skills", "Passion for technology"],
    salary: "£18,000 - £25,000", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=600&fit=crop",
  },
  {
    id: "2", jobTitle: "Digital Marketing Assistant", company: "Creative Agency", industry: "Marketing", location: "Manchester, UK", distance: "1.1 miles", duration: "2 years",
    description: "Learn the fundamentals of digital marketing including SEO, social media, and content creation.",
    requirements: ["Creative mindset", "Social media savvy", "Communication skills"],
    salary: "£16,000 - £22,000", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
  },
];

const mockApplications = [
  {
    id: "1", jobTitle: "Software Developer", company: "TechCorp Ltd", status: "applied", appliedDate: "2 days ago", matchScore: 92, closingDate: "2024-02-15",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=60&h=60&fit=crop",
  },
  {
    id: "2", jobTitle: "Digital Marketing Assistant", company: "Creative Agency", status: "viewed", appliedDate: "1 week ago", matchScore: 88, closingDate: "2024-02-28",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=60&h=60&fit=crop",
  },
];

const mockInterviews = [
  {
    id: "1", jobTitle: "Software Developer", company: "TechCorp Ltd", date: "Tomorrow", time: "2:00 PM", type: "Video Interview", status: "confirmed",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=60&h=60&fit=crop",
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
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-6 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Matches</h2>
        <p className="text-gray-600">Companies that are interested in your profile</p>
      </div>

      <div className="px-6 py-4">
        {mockMatches.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {mockMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start space-x-4">
                  <img src={match.image} alt={match.jobTitle} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">{match.jobTitle}</h3>
                        <p className="text-gray-600 text-sm">{match.company}</p>
                      </div>
                      {match.status === "new" && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">New</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Matched {match.matchDate}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/student/apprenticeship-info/${match.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Info className="h-3 w-3" />
                        Details
                      </button>
                      <button
                        onClick={() => navigate(`/student/chat/${match.id}`)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        Message
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

function MessagesPage() {
  const navigate = useNavigate();
  const mockConversations = [
    {
      id: "1", company: "TechCorp Ltd", lastMessage: "We'd love to schedule an interview!", time: "2h ago", unread: true,
      avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=50&h=50&fit=crop",
    },
    {
      id: "2", company: "Creative Agency", lastMessage: "Thanks for your interest in our apprenticeship.", time: "1d ago", unread: false,
      avatar: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=50&h=50&fit=crop",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-6 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
        <p className="text-gray-600">Chat with companies</p>
      </div>

      <div className="px-6 py-4">
        {mockConversations.length === 0 ? (
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
        ) : (
          <div className="space-y-3">
            {mockConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/student/chat/${conv.id}`)}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <img src={conv.avatar} alt={conv.company} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{conv.company}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{conv.time}</span>
                        {conv.unread && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                      </div>
                    </div>
                    <p className={`text-sm truncate ${conv.unread ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                      {conv.lastMessage}
                    </p>
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

function ApprenticeshipInfoPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const apprenticeshipInfo = {
    id, jobTitle: "Software Developer", company: "TechCorp Ltd", industry: "Technology", location: "London, UK",
    distance: "1.4 miles", duration: "3 years", salary: "£18,000 - £25,000", startDate: "September 2024",
    applicationDeadline: "2024-02-15",
    description: "Join our dynamic team and learn cutting-edge web development technologies. You'll work on real projects from day one and receive mentorship from senior developers.",
    requirements: ["Basic coding knowledge (HTML, CSS, JavaScript)", "Problem-solving skills and logical thinking", "Passion for technology and continuous learning", "Good communication and teamwork abilities", "GCSE Maths and English (Grade 4 or above)"],
    responsibilities: ["Develop and maintain web applications", "Work with senior developers on real client projects", "Participate in code reviews and team meetings", "Learn new technologies and frameworks", "Contribute to technical documentation"],
    benefits: ["Competitive salary with annual reviews", "25 days holiday plus bank holidays", "Professional development budget (£1,500/year)", "Flexible working arrangements", "Health insurance and pension scheme", "Modern office with free snacks and drinks"],
    companyImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
    companyLogo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop",
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-black via-gray-900 to-black">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800/40 rounded-full text-white transition-all">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-white">Apprenticeship Details</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6">
        <div className="bg-black border border-gray-600 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <img src={apprenticeshipInfo.companyLogo} alt={apprenticeshipInfo.company} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{apprenticeshipInfo.jobTitle}</h2>
              <p className="text-cyan-500 font-semibold text-lg mb-2">{apprenticeshipInfo.company}</p>
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
            <div className="text-2xl font-bold text-cyan-500">{apprenticeshipInfo.salary}</div>
            <button
              onClick={() => navigate(`/student/chat/${id}`)}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Message Company
            </button>
          </div>
        </div>

        <div className="bg-[#00D4FF] border rounded-xl overflow-hidden">
          <img src={apprenticeshipInfo.companyImage} alt="Company office" className="w-full h-48 object-cover" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-black mb-3">About this role</h3>
          <p className="text-black leading-relaxed">{apprenticeshipInfo.description}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-black mb-3">Requirements</h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.requirements.map((req, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-black">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-black mb-3">Your responsibilities</h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.responsibilities.map((resp, index) => (
              <li key={index} className="flex items-start">
                <Briefcase className="h-5 w-5 text-cyan-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-black">{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-black mb-3">Benefits & Perks</h3>
          <ul className="space-y-2">
            {apprenticeshipInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-black">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-black mb-3">Key Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: "Start Date", value: apprenticeshipInfo.startDate },
              { icon: Clock, label: "Application Deadline", value: new Date(apprenticeshipInfo.applicationDeadline).toLocaleDateString() },
              { icon: Building2, label: "Industry", value: apprenticeshipInfo.industry },
              { icon: User, label: "Duration", value: apprenticeshipInfo.duration }
            ].map((detail, i) => (
              <div key={i} className="flex items-center">
                <detail.icon className="h-5 w-5 text-black/50 mr-2" />
                <div>
                  <p className="text-sm text-black/70">{detail.label}</p>
                  <p className="font-medium text-black">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="text-center">
            {isApplicationClosed(apprenticeshipInfo.applicationDeadline) ? (
              <>
                <h3 className="text-lg font-semibold text-red-300 mb-2">Applications Closed</h3>
                <p className="text-red-200 mb-4">The application deadline passed on {new Date(apprenticeshipInfo.applicationDeadline).toLocaleDateString()}.</p>
                <button disabled className="w-full bg-gray-500 text-gray-300 py-4 px-6 rounded-xl font-bold cursor-not-allowed opacity-60">
                  Applications Closed
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-black mb-2">Ready to apply?</h3>
                <p className="text-black/80 mb-2">Join {apprenticeshipInfo.company} and start your career journey!</p>
                <p className="text-black/70 text-sm mb-4">Applications close on {new Date(apprenticeshipInfo.applicationDeadline).toLocaleDateString()}</p>
                <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black py-4 px-6 rounded-xl font-bold transition-all hover:scale-105">
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
      id: "1", senderId: "company", content: "Hi Sarah! Thank you for your interest in our Software Developer apprenticeship. We're impressed with your profile!",
      timestamp: "10:30 AM", isOwn: false,
    },
    {
      id: "2", senderId: "student", content: "Thank you! I'm really excited about this opportunity. I'd love to learn more about the role.",
      timestamp: "10:32 AM", isOwn: true,
    },
    {
      id: "3", senderId: "company", content: "Great! We'd like to schedule a video interview with you. Are you available this Friday at 2 PM?",
      timestamp: "10:35 AM", isOwn: false,
    },
  ]);

  const chatInfo = {
    company: "TechCorp Ltd", jobTitle: "Software Developer",
    companyLogo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=50&h=50&fit=crop",
  };

  const canSendMessage = () => {
    if (messages.length === 0) return true;
    return !messages[messages.length - 1].isOwn;
  };

  const handleSendMessage = () => {
    if (message.trim() && canSendMessage()) {
      const newMessage = {
        id: `msg_${Date.now()}`, senderId: "student", content: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isOwn: true,
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <img src={chatInfo.companyLogo} alt={chatInfo.company} className="w-8 h-8 rounded-full object-cover mr-3" />
          <div>
            <h1 className="font-semibold text-black text-sm">{chatInfo.company}</h1>
            <p className="text-xs text-gray-500">{chatInfo.jobTitle}</p>
          </div>
        </div>
        <button
          onClick={() => window.open('https://meet.google.com/new?authuser=0', '_blank')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Video className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 px-4 py-2 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-2 ${msg.isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] px-4 py-2 ${
              msg.isOwn ? "bg-blue-500 text-white rounded-l-3xl rounded-tr-3xl rounded-br-md"
                        : "bg-gray-200 text-black rounded-r-3xl rounded-tl-3xl rounded-bl-md"
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3">
        {!canSendMessage() && (
          <div className="mb-3 text-center">
            <p className="text-xs text-gray-500">Wait for {chatInfo.company} to respond before sending another message</p>
          </div>
        )}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text" value={message} onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && canSendMessage() && handleSendMessage()}
            placeholder={canSendMessage() ? "Message..." : "Waiting for response..."}
            disabled={!canSendMessage()}
            className="flex-1 bg-transparent text-black placeholder-gray-500 text-sm focus:outline-none disabled:text-gray-400"
          />
          {message.trim() && canSendMessage() && (
            <button onClick={handleSendMessage} className="text-blue-500 font-semibold text-sm ml-2 hover:text-blue-600">
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@email.com", phone: "07123 456789",
    location: "London, UK", bio: "Passionate about technology and eager to start my career in software development.",
    skills: ["JavaScript", "React", "Problem Solving", "Communication"], availableFrom: "September 2024",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b890?w=150&h=150&fit=crop",
  });

  useEffect(() => {
    const loadProfile = () => {
      const savedBio = localStorage.getItem('studentProfile_bio');
      const savedContact = localStorage.getItem('studentProfile_contact');
      const savedSkills = localStorage.getItem('studentProfile_skills');
      const savedAvailability = localStorage.getItem('studentProfile_availability');
      const savedImage = localStorage.getItem('studentProfile_image');

      setProfile(prev => ({
        ...prev,
        bio: savedBio || prev.bio,
        ...savedContact ? JSON.parse(savedContact) : {},
        skills: savedSkills ? JSON.parse(savedSkills) : prev.skills,
        availableFrom: savedAvailability || prev.availableFrom,
        profileImage: savedImage || prev.profileImage,
      }));
    };
    loadProfile();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white px-6 py-8">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <img src={profile.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg" />
            <button
              onClick={() => navigate('/student/change-picture')}
              className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg"
            >
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
            { icon: FileText, color: "blue", value: "12", label: "Applications" },
            { icon: Heart, color: "green", value: "5", label: "Matches" },
            { icon: User, color: "purple", value: "92%", label: "Profile Score" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className={`w-8 h-8 bg-${stat.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-4">
        {[
          { title: "About", content: profile.bio, route: "/student/edit-about", icon: Edit },
          { title: "Contact", content: `${profile.email} • ${profile.phone} • ${profile.location}`, route: "/student/edit-contact", icon: Edit },
          { title: "Skills", content: profile.skills.map(skill => skill).join(", "), route: "/student/edit-skills", icon: Edit },
          { title: "Availability", content: `Available from ${profile.availableFrom}`, route: "/student/edit-availability", icon: Edit }
        ].map((section, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 font-semibold">{section.title}</h3>
              <button
                onClick={() => navigate(section.route)}
                className="text-gray-500 hover:text-gray-700 transition-all hover:scale-110"
              >
                <section.icon className="h-4 w-4" />
              </button>
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
                  { icon: Bus, label: "Bus Route", time: "25 min", cost: "£2.50", color: "blue" },
                  { icon: Train, label: "Train Route", time: "18 min", cost: "£4.20", color: "green" },
                  { icon: Car, label: "Driving", time: "12 min", cost: "£8/day", color: "orange" },
                  { icon: User, label: "Walking", time: "28 min", cost: "Free", color: "gray" }
                ].map((route, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 bg-${route.color}-500/20 rounded-lg border border-${route.color}-400/30`}>
                    <div className="flex items-center">
                      <route.icon className={`h-5 w-5 text-${route.color}-600 mr-3`} />
                      <div>
                        <p className="font-medium text-black">{route.label}</p>
                        <p className="text-sm text-gray-300">{route.time} • {route.cost}</p>
                      </div>
                    </div>
                    <button className={`text-${route.color}-600 text-sm font-medium hover:underline`}>View</button>
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

// Main Pages
function HomePage() {
  const [applications, setApplications] = useState(mockApplications);
  const [interviews, setInterviews] = useState(mockInterviews);
  const [profileScore] = useState(92);
  const [loading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const appsResponse = await fetch('/api/applications/my-applications');
        if (appsResponse.ok) {
          const data = await appsResponse.json();
          setApplications(data.applications || mockApplications);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

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
            { icon: FileText, color: "green", value: applications.length, label: "Applications" },
            { icon: Calendar, color: "blue", value: interviews.length, label: "Interviews" },
            { icon: Heart, color: "purple", value: "5", label: "Matches" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className={`w-8 h-8 bg-${stat.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
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

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 text-sm mb-6">Start exploring opportunities</p>
            <Link to="/student/jobs" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium">
              Explore Jobs
            </Link>
          </div>
        ) : (
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'viewed' ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'shortlisted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
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
        )}
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Interviews</h2>
          <Link to="/student/interviews" className="text-blue-600 text-sm font-medium">View All</Link>
        </div>

        {interviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interviews Scheduled</h3>
            <p className="text-gray-600 text-sm">Your interview invitations will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div key={interview.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start space-x-3">
                  <img src={interview.image} alt={interview.company} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{interview.jobTitle}</h3>
                        <p className="text-gray-600 text-sm">{interview.company}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interview.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
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
                      <button
                        onClick={() => window.open('https://meet.google.com/new?authuser=0', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                      >
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/apprenticeships/discover');
        if (response.ok) {
          const data = await response.json();
          if (data.apprenticeships?.length > 0) {
            const transformed = data.apprenticeships.map((app: any, index: number) => ({
              id: app._id || `api_${index}`,
              jobTitle: app.jobTitle,
              company: app.companyName || app.company,
              industry: app.industry,
              location: app.location?.city || app.location,
              distance: `${(Math.random() * 5 + 0.5).toFixed(1)} miles`,
              duration: app.duration || "3 years",
              description: app.description,
              requirements: app.requirements || [],
              salary: app.salary || "£18,000 - £25,000",
              image: app.image || `https://images.unsplash.com/photo-148631233821${index % 10}9-ce68d2c6f44d?w=400&h=600&fit=crop`,
            }));
            setApprenticeships(transformed);
          }
        }
      } catch (error) {
        console.error('API error, using mock data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSwipe = async (direction: "left" | "right") => {
    const current = apprenticeships[currentIndex];
    console.log(`Swiped ${direction} on ${current?.jobTitle}`);

    try {
      await fetch(`/api/apprenticeships/${current.id}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, studentLocation: { lat: 51.5074, lng: -0.1278 } })
      });
    } catch (error) {
      console.error('Swipe error:', error);
    }

    setCurrentIndex(currentIndex < apprenticeships.length - 1 ? currentIndex + 1 : 0);
  };

  const current = apprenticeships[currentIndex];

  if (!current) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-black mb-4">No more opportunities!</h3>
          <p className="text-gray-400 mb-6">Check back later for new apprenticeships</p>
          <button onClick={() => setCurrentIndex(0)} className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 text-black px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-xl">
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
        {apprenticeships.slice(currentIndex + 1, currentIndex + 3).map((app, index) => (
          <SwipeCard
            key={app.id}
            apprenticeship={app}
            onSwipe={() => {}}
            style={{
              position: "absolute",
              zIndex: -(index + 1),
              transform: `scale(${1 - (index + 1) * 0.03}) translateY(${(index + 1) * 8}px)`,
              opacity: 1 - (index + 1) * 0.15,
            }}
          />
        ))}

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
            className="w-14 h-14 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:border-red-300 hover:bg-red-50 transition-all duration-200 hover:scale-105"
          >
            <X className="h-6 w-6 text-red-500" />
          </button>
          <button
            onClick={() => handleSwipe("right")}
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
      id: "1", jobTitle: "Software Developer", company: "TechCorp Ltd", matchDate: "2 days ago", status: "new",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop",
    },
    {
      id: "2", jobTitle: "Digital Marketing Assistant", company: "Creative Agency", matchDate: "1 week ago", status: "viewed",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop",
    },
  ];

  return (
