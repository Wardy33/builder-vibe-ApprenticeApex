import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import SubscriptionManager from "../components/SubscriptionManager";
import SubscriptionPrompt from "../components/SubscriptionPrompt";
import { useSubscriptionLimits } from "../hooks/useSubscriptionLimits";
import LiveChat from "../components/LiveChat";
import {
  ArrowLeft,
  Home,
  Building2,
  Users,
  BarChart3,
  Plus,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Video,
  Settings,
  Bell,
  X,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Save,
  CreditCard,
} from "lucide-react";

interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  applicationDate: string;
  status: "pending" | "reviewed" | "interview" | "rejected" | "accepted";
  score: number;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  skills?: string[];
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applications: number;
  status: "active" | "paused" | "closed";
}

interface Interview {
  id: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  type: "video" | "phone" | "in-person";
  status: "scheduled" | "completed" | "cancelled";
  duration: string;
}

interface Notification {
  id: string;
  type: "application" | "interview" | "message" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockApplications: Application[] = [
  {
    id: "1",
    candidateName: "Sarah Johnson",
    jobTitle: "Software Developer",
    applicationDate: "2024-01-15",
    status: "pending",
    score: 92,
    email: "sarah.johnson@email.com",
    phone: "+44 7123 456789",
    location: "London, UK",
    experience: "2 years",
    skills: ["React", "TypeScript", "Node.js", "Python"],
  },
  {
    id: "2",
    candidateName: "Mike Chen",
    jobTitle: "Digital Marketing Assistant",
    applicationDate: "2024-01-14",
    status: "interview",
    score: 88,
    email: "mike.chen@email.com",
    phone: "+44 7234 567890",
    location: "Manchester, UK",
    experience: "1 year",
    skills: ["SEO", "Social Media", "Analytics", "Content Creation"],
  },
  {
    id: "3",
    candidateName: "Emma Davis",
    jobTitle: "Electrical Engineer",
    applicationDate: "2024-01-13",
    status: "reviewed",
    score: 95,
    email: "emma.davis@email.com",
    phone: "+44 7345 678901",
    location: "Birmingham, UK",
    experience: "3 years",
    skills: ["Circuit Design", "CAD", "Project Management", "Testing"],
  },
  {
    id: "4",
    candidateName: "James Wilson",
    jobTitle: "Data Analyst",
    applicationDate: "2024-01-12",
    status: "accepted",
    score: 89,
    email: "james.wilson@email.com",
    phone: "+44 7456 789012",
    location: "Edinburgh, UK",
    experience: "2 years",
    skills: ["Python", "SQL", "Tableau", "Statistics"],
  },
  {
    id: "5",
    candidateName: "Lisa Smith",
    jobTitle: "Graphic Designer",
    applicationDate: "2024-01-11",
    status: "rejected",
    score: 76,
    email: "lisa.smith@email.com",
    phone: "+44 7567 890123",
    location: "Bristol, UK",
    experience: "1 year",
    skills: ["Photoshop", "Illustrator", "InDesign", "Figma"],
  },
];

const mockJobListings: JobListing[] = [
  {
    id: "1",
    title: "Software Developer Apprentice",
    company: "TechCorp Ltd",
    location: "London, UK",
    type: "full-time",
    salary: "£18,000 - £22,000",
    description:
      "Join our development team as an apprentice software developer. You'll work on real projects while studying for your qualification.",
    requirements: [
      "A-Levels or equivalent",
      "Interest in programming",
      "Problem-solving skills",
      "Team player",
    ],
    postedDate: "2024-01-10",
    applications: 24,
    status: "active",
  },
  {
    id: "2",
    title: "Digital Marketing Apprentice",
    company: "MarketingPlus",
    location: "Manchester, UK",
    type: "full-time",
    salary: "£16,000 - £20,000",
    description:
      "Learn digital marketing while working with our experienced team on client campaigns.",
    requirements: [
      "GCSEs including English and Maths",
      "Social media savvy",
      "Creative thinking",
      "Communication skills",
    ],
    postedDate: "2024-01-08",
    applications: 18,
    status: "active",
  },
  {
    id: "3",
    title: "Electrical Engineering Apprentice",
    company: "PowerSystems UK",
    location: "Birmingham, UK",
    type: "full-time",
    salary: "£20,000 - £24,000",
    description:
      "Hands-on electrical engineering apprenticeship with opportunities to work on major infrastructure projects.",
    requirements: [
      "A-Levels in Maths/Science",
      "Interest in engineering",
      "Attention to detail",
      "Safety-conscious",
    ],
    postedDate: "2024-01-05",
    applications: 31,
    status: "paused",
  },
];

const mockInterviews: Interview[] = [
  {
    id: "1",
    candidateName: "Sarah Johnson",
    jobTitle: "Software Developer",
    date: "2024-01-20",
    time: "14:00",
    type: "video",
    status: "scheduled",
    duration: "45 minutes",
  },
  {
    id: "2",
    candidateName: "Mike Chen",
    jobTitle: "Digital Marketing Assistant",
    date: "2024-01-22",
    time: "10:30",
    type: "video",
    status: "scheduled",
    duration: "30 minutes",
  },
  {
    id: "3",
    candidateName: "Emma Davis",
    jobTitle: "Electrical Engineer",
    date: "2024-01-18",
    time: "15:30",
    type: "in-person",
    status: "completed",
    duration: "60 minutes",
  },
];

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "application",
    title: "New Application",
    message: "Sarah Johnson applied for Software Developer position",
    timestamp: "2024-01-15T10:30:00Z",
    read: false,
  },
  {
    id: "2",
    type: "interview",
    title: "Interview Reminder",
    message: "Video interview with Mike Chen in 1 hour",
    timestamp: "2024-01-15T13:00:00Z",
    read: false,
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "Emma Davis sent you a message",
    timestamp: "2024-01-15T09:15:00Z",
    read: true,
  },
];

function Dashboard() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs sm:text-sm">
                Active Listings
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white">12</p>
            </div>
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-orange" />
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-orange text-xs sm:text-sm">+2 this week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-white">247</p>
            </div>
            <Users className="h-8 w-8 text-orange" />
          </div>
          <div className="mt-4">
            <span className="text-orange text-sm">+18 this week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Interviews Scheduled</p>
              <p className="text-3xl font-bold text-white">8</p>
            </div>
            <Video className="h-8 w-8 text-orange" />
          </div>
          <div className="mt-4">
            <span className="text-orange text-sm">3 today</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Match Rate</p>
              <p className="text-3xl font-bold text-white">78%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange" />
          </div>
          <div className="mt-4">
            <span className="text-orange text-sm">+5% this month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Applications Chart */}
        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
            Applications This Month
          </h3>
          <div className="h-48 sm:h-64 flex items-end justify-between space-x-1 sm:space-x-2">
            {[65, 85, 72, 90, 78, 95, 88].map((height, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-orange rounded-t w-full"
                  style={{ height: `${height}%` }}
                />
                <span className="text-gray-300 text-xs mt-2">
                  Week {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
          <h3 className="text-xl font-bold text-white mb-4">
            Applications by Industry
          </h3>
          <div className="space-y-4">
            {[
              { name: "Technology", percentage: 45, count: 111 },
              { name: "Engineering", percentage: 25, count: 62 },
              { name: "Marketing", percentage: 20, count: 49 },
              { name: "Healthcare", percentage: 10, count: 25 },
            ].map((industry) => (
              <div key={industry.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">{industry.name}</span>
                  <span className="text-orange font-semibold">
                    {industry.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange h-2 rounded-full"
                    style={{ width: `${industry.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Recent Applications
          </h3>
          <Link
            to="/company/applications"
            className="text-orange hover:text-orange/80 text-sm sm:text-base"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {mockApplications.slice(0, 3).map((application) => (
            <div
              key={application.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div>
                <h4 className="font-semibold text-white">
                  {application.candidateName}
                </h4>
                <p className="text-gray-300 text-sm">{application.jobTitle}</p>
                <p className="text-gray-500 text-xs">
                  {application.applicationDate}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-orange font-bold">
                    {application.score}%
                  </div>
                  <div className="text-gray-300 text-xs">Match</div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    application.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : application.status === "interview"
                        ? "bg-blue-100 text-blue-700"
                        : application.status === "reviewed"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {application.status}
                </div>
                <button className="text-orange hover:text-orange/80">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanyPortalLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header - Match student app black header */}
      <header className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 bg-black relative">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-800 rounded-full text-white touch-manipulation"
            title="Home"
          >
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white">
            <span className="text-orange">ApprenticeApex</span>
            <span className="hidden sm:inline"> Portal</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-800 rounded-full relative text-white touch-manipulation"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-800 rounded-full text-white touch-manipulation"
          >
            <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-full right-4 mt-2 w-80 bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm shadow-lg z-50">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-orange hover:text-orange/80"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-3 sm:p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer touch-manipulation ${
                      !notification.read ? "bg-orange/5" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 p-1 rounded-full ${
                          notification.type === "application"
                            ? "bg-blue-100"
                            : notification.type === "interview"
                              ? "bg-green-100"
                              : notification.type === "message"
                                ? "bg-purple-100"
                                : "bg-gray-100"
                        }`}
                      >
                        {notification.type === "application" && (
                          <Users className="h-4 w-4 text-blue-600" />
                        )}
                        {notification.type === "interview" && (
                          <Video className="h-4 w-4 text-green-600" />
                        )}
                        {notification.type === "message" && (
                          <MessageCircle className="h-4 w-4 text-purple-600" />
                        )}
                        {notification.type === "system" && (
                          <Bell className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-300">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-orange rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute top-full right-4 mt-2 w-64 bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm shadow-lg z-50">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="font-semibold text-white">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2">
              <Link
                to="/company/settings/profile"
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                onClick={() => setShowSettings(false)}
              >
                Profile Settings
              </Link>
              <Link
                to="/company/settings/company"
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                onClick={() => setShowSettings(false)}
              >
                Company Information
              </Link>
              <Link
                to="/company/settings/notifications"
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                onClick={() => setShowSettings(false)}
              >
                Notification Preferences
              </Link>
              <Link
                to="/company/settings/billing"
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                onClick={() => setShowSettings(false)}
              >
                Account & Billing
              </Link>
              <hr className="my-2" />
              <Link
                to="/company/settings/help"
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                onClick={() => setShowSettings(false)}
              >
                Help & Support
              </Link>
              <button
                onClick={() => {
                  setShowSettings(false);
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar - Light theme like student app */}
        <aside
          className={`${
            showMobileSidebar ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static w-64 border-r border-white/20 min-h-[calc(100vh-73px)] bg-gray-50 z-50 transition-transform duration-300 ease-in-out`}
        >
          <nav className="p-4 space-y-2">
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-between items-center mb-4">
              <span className="font-semibold text-white">Menu</span>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 hover:bg-gray-200 rounded-lg touch-manipulation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Link
              to="/company"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location.pathname === "/company" ||
                location.pathname === "/company/"
                  ? "bg-orange/10 text-orange"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/company/listings"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location.pathname === "/company/listings"
                  ? "bg-orange/10 text-orange"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span>Job Listings</span>
            </Link>
            <Link
              to="/company/applications"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location.pathname === "/company/applications"
                  ? "bg-orange/10 text-orange"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Applications</span>
            </Link>
            <Link
              to="/company/interviews"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location.pathname === "/company/interviews"
                  ? "bg-orange/10 text-orange"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Video className="h-5 w-5" />
              <span>Interviews</span>
            </Link>
            <Link
              to="/company/subscription"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location.pathname === "/company/subscription"
                  ? "bg-orange/10 text-orange"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Subscription</span>
            </Link>
            <Link
              to="/company/messages"
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                location.pathname === "/company/messages"
                  ? "bg-orange/10 text-orange"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content - White background */}
        <main className="flex-1 bg-transparent text-white lg:ml-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="fixed bottom-4 left-4 lg:hidden bg-orange text-white p-3 rounded-full shadow-lg z-30 touch-manipulation"
          >
            <Building2 className="h-6 w-6" />
          </button>

          {children}
        </main>
      </div>
      <LiveChat />
    </div>
  );
}

function JobListingsPage() {
  const [listings, setListings] = useState<JobListing[]>(mockJobListings);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const subscriptionLimits = useSubscriptionLimits();

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleStatus = (id: string) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              status: listing.status === "active" ? "paused" : "active",
            }
          : listing,
      ),
    );
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
  };

  const handleCreateListing = async () => {
    if (!subscriptionLimits.hasSubscription) {
      setShowSubscriptionPrompt(true);
      return;
    }

    if (subscriptionLimits.isTrialExpired) {
      setShowSubscriptionPrompt(true);
      return;
    }

    const limitCheck = await subscriptionLimits.checkLimit('create_job_posting');
    if (!limitCheck.allowed) {
      alert(limitCheck.reason);
      return;
    }

    setIsCreating(true);
  };

  const handleStartTrial = async () => {
    const result = await subscriptionLimits.startTrial();
    if (result.success) {
      setShowSubscriptionPrompt(false);
      subscriptionLimits.refresh();
    } else {
      alert(result.error || 'Failed to start trial');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Job Listings</h2>
        <button
          onClick={handleCreateListing}
          disabled={subscriptionLimits.loading}
          className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          <span>Create Listing</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search job listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent w-full"
          />
        </div>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5 text-gray-300" />
        </button>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {listing.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      listing.status === "active"
                        ? "bg-green-100 text-green-700"
                        : listing.status === "paused"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{listing.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{listing.applications} applications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(listing.postedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{listing.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-orange">
                    {listing.salary}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStatus(listing.id)}
                      className={`px-3 py-2 rounded text-sm font-medium touch-manipulation ${
                        listing.status === "active"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {listing.status === "active" ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => setEditingId(listing.id)}
                      className="p-3 text-gray-300 hover:text-orange touch-manipulation"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="p-3 text-gray-300 hover:text-red-600 touch-manipulation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Creation Modal */}
      {isCreating && (
        <JobCreationModal
          onClose={() => setIsCreating(false)}
          onSave={(newListing) => {
            setListings(prev => [{ ...newListing, id: Date.now().toString() }, ...prev]);
            setIsCreating(false);
          }}
        />
      )}

      {/* Subscription Prompt Modal */}
      {showSubscriptionPrompt && (
        <SubscriptionPrompt
          type={!subscriptionLimits.hasSubscription ? 'trial_needed' : 'trial_expired'}
          showModal={true}
          onStartTrial={handleStartTrial}
          onUpgrade={() => window.location.href = '/for-employers'}
          onClose={() => setShowSubscriptionPrompt(false)}
        />
      )}
    </div>
  );
}

function ApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || application.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateApplicationStatus = (
    id: string,
    newStatus: Application["status"],
  ) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Applications</h2>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="interview">Interview</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent w-full"
        />
      </div>

      <div className="grid gap-4">
        {filteredApplications.map((application) => (
          <div
            key={application.id}
            className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {application.candidateName}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      application.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : application.status === "interview"
                          ? "bg-blue-100 text-blue-700"
                          : application.status === "reviewed"
                            ? "bg-purple-100 text-purple-700"
                            : application.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{application.jobTitle}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{application.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{application.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{application.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(
                        application.applicationDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-orange font-bold text-lg">
                      {application.score}%
                    </div>
                    <div className="text-gray-300 text-xs">Match Score</div>
                  </div>
                  <div>
                    <div className="text-gray-700 text-sm font-medium">
                      Skills:
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {application.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => setSelectedApplication(application)}
                  className="text-orange hover:text-orange/80 p-2"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <select
                  value={application.status}
                  onChange={(e) =>
                    updateApplicationStatus(
                      application.id,
                      e.target.value as Application["status"],
                    )
                  }
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="interview">Interview</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {selectedApplication.candidateName} -{" "}
                {selectedApplication.jobTitle}
              </h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-300" />
                      <span>{selectedApplication.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-300" />
                      <span>{selectedApplication.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-300" />
                      <span>{selectedApplication.location}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Application Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      Applied:{" "}
                      {new Date(
                        selectedApplication.applicationDate,
                      ).toLocaleDateString()}
                    </div>
                    <div>Experience: {selectedApplication.experience}</div>
                    <div className="flex items-center space-x-2">
                      <span>Match Score:</span>
                      <span className="font-bold text-orange">
                        {selectedApplication.score}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-orange/10 text-orange px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/20">
                <button
                  onClick={() => {
                    updateApplicationStatus(selectedApplication.id, "rejected");
                    setSelectedApplication(null);
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    updateApplicationStatus(
                      selectedApplication.id,
                      "interview",
                    );
                    setSelectedApplication(null);
                  }}
                  className="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90"
                >
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || interview.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateInterviewStatus = (
    id: string,
    newStatus: Interview["status"],
  ) => {
    setInterviews((prev) =>
      prev.map((interview) =>
        interview.id === id ? { ...interview, status: newStatus } : interview,
      ),
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Interviews</h2>
        <button className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Schedule Interview</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredInterviews.map((interview) => (
          <div
            key={interview.id}
            className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {interview.candidateName}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      interview.status === "scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : interview.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {interview.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{interview.jobTitle}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(interview.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{interview.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span>{interview.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{interview.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <select
                  value={interview.status}
                  onChange={(e) =>
                    updateInterviewStatus(
                      interview.id,
                      e.target.value as Interview["status"],
                    )
                  }
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange focus:border-transparent"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="text-orange hover:text-orange/80 p-2">
                  <Video className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesPage() {
  const [conversations] = useState([
    {
      id: "1",
      candidateName: "Sarah Johnson",
      lastMessage:
        "Thank you for considering my application. I'm very excited about this opportunity.",
      timestamp: "2024-01-15T14:30:00Z",
      unread: true,
      jobTitle: "Software Developer",
    },
    {
      id: "2",
      candidateName: "Mike Chen",
      lastMessage:
        "I'm available for the interview on Tuesday at 2 PM. Looking forward to speaking with you.",
      timestamp: "2024-01-15T11:20:00Z",
      unread: false,
      jobTitle: "Digital Marketing Assistant",
    },
    {
      id: "3",
      candidateName: "Emma Davis",
      lastMessage:
        "Could we reschedule the interview? I have a conflict with the current time.",
      timestamp: "2024-01-14T16:45:00Z",
      unread: true,
      jobTitle: "Electrical Engineer",
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Messages</h2>

      <div className="grid gap-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow ${
              conversation.unread ? "border-l-4 border-l-orange" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {conversation.candidateName}
                  </h3>
                  {conversation.unread && (
                    <span className="w-2 h-2 bg-orange rounded-full"></span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  {conversation.jobTitle}
                </p>
                <p className="text-gray-700">{conversation.lastMessage}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {new Date(conversation.timestamp).toLocaleString()}
                </p>
              </div>
              <MessageCircle className="h-6 w-6 text-orange" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Subscription Page Component
function SubscriptionPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Subscription & Billing
        </h1>
        <p className="text-gray-300">
          Manage your subscription plan, view billing history, and track usage
        </p>
      </div>
      <SubscriptionManager />
    </div>
  );
}

// Profile Settings Page
function ProfileSettingsPage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // TODO: Load actual profile data from API
    setProfile({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com',
      phone: '+44 7123 456789',
      jobTitle: 'HR Manager',
      department: 'Human Resources'
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        {success && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Profile updated successfully</span>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({...profile, firstName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({...profile, lastName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={profile.jobTitle}
              onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile({...profile, department: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange/90 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Company Information Page
function CompanyInformationPage() {
  const [company, setCompany] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    address: '',
    city: '',
    postcode: '',
    country: '',
    logo: null as File | null
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // TODO: Load actual company data from API
    setCompany({
      name: 'TechCorp Ltd',
      description: 'Leading technology training provider specializing in apprenticeships',
      website: 'https://techcorp.co.uk',
      industry: 'Technology',
      size: '50-100',
      address: '123 Business Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom',
      logo: null
    });
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompany({...company, logo: file});
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Upload logo if a new one was selected
      if (company.logo) {
        const formData = new FormData();
        formData.append('logo', company.logo);

        const logoResponse = await fetch('/api/upload/company-logo', {
          method: 'POST',
          body: formData,
        });

        if (logoResponse.ok) {
          const logoData = await logoResponse.json();
          console.log('Logo uploaded:', logoData.logo.url);
        }
      }

      // TODO: Save company information to API
      const companyData = {
        name: company.name,
        description: company.description,
        website: company.website,
        industry: company.industry,
        size: company.size,
        address: company.address,
        city: company.city,
        postcode: company.postcode,
        country: company.country
      };

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to save company information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Company Information</h2>
        {success && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Company information updated successfully</span>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Company Details</h3>

        {/* Logo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Building2 className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer inline-block"
              >
                Upload Logo
              </label>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => setCompany({...company, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={company.description}
              onChange={(e) => setCompany({...company, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={company.website}
              onChange={(e) => setCompany({...company, website: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <select
              value={company.industry}
              onChange={(e) => setCompany({...company, industry: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            >
              <option value="">Select Industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Construction">Construction</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Size
            </label>
            <select
              value={company.size}
              onChange={(e) => setCompany({...company, size: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            >
              <option value="">Select Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-100">51-100 employees</option>
              <option value="101-500">101-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={company.address}
              onChange={(e) => setCompany({...company, address: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={company.city}
              onChange={(e) => setCompany({...company, city: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postcode
            </label>
            <input
              type="text"
              value={company.postcode}
              onChange={(e) => setCompany({...company, postcode: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={company.country}
              onChange={(e) => setCompany({...company, country: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
            >
              <option value="">Select Country</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Ireland">Ireland</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange/90 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification Preferences Page
function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      newApplications: true,
      interviewReminders: true,
      messageReceived: true,
      subscriptionUpdates: false,
      marketingEmails: false
    },
    pushNotifications: {
      newApplications: true,
      interviewReminders: true,
      messageReceived: false,
      systemUpdates: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEmailChange = (key: string, value: boolean) => {
    setPreferences({
      ...preferences,
      emailNotifications: {
        ...preferences.emailNotifications,
        [key]: value
      }
    });
  };

  const handlePushChange = (key: string, value: boolean) => {
    setPreferences({
      ...preferences,
      pushNotifications: {
        ...preferences.pushNotifications,
        [key]: value
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
        {success && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Preferences updated successfully</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Notifications</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(preferences.emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">
                    {key === 'newApplications' ? 'New Applications' :
                     key === 'interviewReminders' ? 'Interview Reminders' :
                     key === 'messageReceived' ? 'Message Received' :
                     key === 'subscriptionUpdates' ? 'Subscription Updates' :
                     'Marketing Emails'}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {key === 'newApplications' ? 'Get notified when candidates apply to your jobs' :
                     key === 'interviewReminders' ? 'Reminders about upcoming interviews' :
                     key === 'messageReceived' ? 'When candidates send you messages' :
                     key === 'subscriptionUpdates' ? 'Billing and subscription notifications' :
                     'Product updates and promotional content'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={(e) => handleEmailChange(key, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Push Notifications</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(preferences.pushNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">
                    {key === 'newApplications' ? 'New Applications' :
                     key === 'interviewReminders' ? 'Interview Reminders' :
                     key === 'messageReceived' ? 'Message Received' :
                     'System Updates'}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {key === 'newApplications' ? 'Browser notifications for new applications' :
                     key === 'interviewReminders' ? 'Browser reminders for interviews' :
                     key === 'messageReceived' ? 'Instant notifications for new messages' :
                     'Important system notifications'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={(e) => handlePushChange(key, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange/90 flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );
}

// Job Creation Modal Component
function JobCreationModal({ onClose, onSave }: { onClose: () => void; onSave: (listing: Omit<JobListing, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    company: 'TechCorp Ltd', // This would come from company profile
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract',
    salary: '',
    description: '',
    requirements: [''],
    postedDate: new Date().toISOString().split('T')[0],
    applications: 0,
    status: 'active' as 'active' | 'paused' | 'closed'
  });
  const [loading, setLoading] = useState(false);

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData({ ...formData, requirements: newRequirements });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.salary || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Submit to API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');
      onSave({
        ...formData,
        requirements: filteredRequirements
      });
    } catch (error) {
      console.error('Error creating job listing:', error);
      alert('Failed to create job listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Create New Job Listing</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Software Developer Apprentice"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., London, UK"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range *
              </label>
              <input
                type="text"
                required
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g., £18,000 - £22,000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what the apprentice will learn..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <div className="space-y-3">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="text-orange hover:text-orange/80 flex items-center space-x-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Requirement</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Job Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Account & Billing Settings Page
function AccountBillingPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Account & Billing</h2>
      <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
        <p className="text-gray-300 mb-4">
          Manage your subscription, billing information, and payment methods.
        </p>
        <Link
          to="/company/subscription"
          className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 inline-flex items-center space-x-2"
        >
          <CreditCard className="h-4 w-4" />
          <span>Go to Subscription & Billing</span>
        </Link>
      </div>
    </div>
  );
}

// Help & Support Page
function HelpSupportPage() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Submit to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setMessage('');
      setCategory('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting support request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Help & Support</h2>

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Support request submitted successfully. We'll get back to you within 24 hours.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Help */}
        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Help</h3>
          <div className="space-y-4">
            <div className="border border-white/20 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Getting Started</h4>
              <p className="text-sm text-gray-300 mb-2">Learn how to post your first job and manage applications.</p>
              <a href="#" className="text-orange hover:text-orange/80 text-sm">View Guide →</a>
            </div>
            <div className="border border-white/20 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Billing & Subscriptions</h4>
              <p className="text-sm text-gray-300 mb-2">Understand our pricing and manage your subscription.</p>
              <a href="#" className="text-orange hover:text-orange/80 text-sm">View Guide →</a>
            </div>
            <div className="border border-white/20 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Managing Candidates</h4>
              <p className="text-sm text-gray-300 mb-2">Best practices for reviewing and interviewing candidates.</p>
              <a href="#" className="text-orange hover:text-orange/80 text-sm">View Guide →</a>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-black/40 border border-white/20 rounded-lg backdrop-blur-sm p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Contact Support</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              >
                <option value="">Select a category</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="account">Account Management</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Describe your issue or question..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange text-white py-2 rounded-lg hover:bg-orange/90 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Support Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompanyPortal() {
  return (
    <CompanyPortalLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/listings" element={<JobListingsPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/settings/profile" element={<ProfileSettingsPage />} />
        <Route path="/settings/company" element={<CompanyInformationPage />} />
        <Route path="/settings/notifications" element={<NotificationPreferencesPage />} />
        <Route path="/settings/billing" element={<AccountBillingPage />} />
        <Route path="/settings/help" element={<HelpSupportPage />} />
      </Routes>
    </CompanyPortalLayout>
  );
}
