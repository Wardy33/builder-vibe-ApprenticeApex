import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import SubscriptionManager from "../components/SubscriptionManager";
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Active Listings
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">12</p>
            </div>
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-orange" />
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-orange text-xs sm:text-sm">+2 this week</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">247</p>
            </div>
            <Users className="h-8 w-8 text-orange" />
          </div>
          <div className="mt-4">
            <span className="text-orange text-sm">+18 this week</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Interviews Scheduled</p>
              <p className="text-3xl font-bold text-gray-900">8</p>
            </div>
            <Video className="h-8 w-8 text-orange" />
          </div>
          <div className="mt-4">
            <span className="text-orange text-sm">3 today</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Match Rate</p>
              <p className="text-3xl font-bold text-gray-900">78%</p>
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Applications This Month
          </h3>
          <div className="h-48 sm:h-64 flex items-end justify-between space-x-1 sm:space-x-2">
            {[65, 85, 72, 90, 78, 95, 88].map((height, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-orange rounded-t w-full"
                  style={{ height: `${height}%` }}
                />
                <span className="text-gray-600 text-xs mt-2">
                  Week {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
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
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
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
                <h4 className="font-semibold text-gray-900">
                  {application.candidateName}
                </h4>
                <p className="text-gray-600 text-sm">{application.jobTitle}</p>
                <p className="text-gray-500 text-xs">
                  {application.applicationDate}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-orange font-bold">
                    {application.score}%
                  </div>
                  <div className="text-gray-600 text-xs">Match</div>
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
    <div className="min-h-screen bg-white">
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
          <div className="absolute top-full right-4 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
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
                  className="text-gray-400 hover:text-gray-600"
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
                          <Bell className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600">
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
          <div className="absolute top-full right-4 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700">
                Profile Settings
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700">
                Company Information
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700">
                Notification Preferences
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700">
                Account & Billing
              </button>
              <hr className="my-2" />
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700">
                Help & Support
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-600">
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
          } lg:translate-x-0 fixed lg:static w-64 border-r border-gray-200 min-h-[calc(100vh-73px)] bg-gray-50 z-50 transition-transform duration-300 ease-in-out`}
        >
          <nav className="p-4 space-y-2">
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-900">Menu</span>
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
        <main className="flex-1 bg-white text-gray-900 lg:ml-0">
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
    </div>
  );
}

function JobListingsPage() {
  const [listings, setListings] = useState<JobListing[]>(mockJobListings);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-orange text-white px-4 py-2 rounded-lg hover:bg-orange/90 flex items-center space-x-2"
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
          <Filter className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
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
                      className="p-3 text-gray-600 hover:text-orange touch-manipulation"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="p-3 text-gray-600 hover:text-red-600 touch-manipulation"
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
        <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
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
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
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
                <p className="text-gray-600 mb-2">{application.jobTitle}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
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
                    <div className="text-gray-600 text-xs">Match Score</div>
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedApplication.candidateName} -{" "}
                {selectedApplication.jobTitle}
              </h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span>{selectedApplication.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span>{selectedApplication.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span>{selectedApplication.location}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
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
                <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
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
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
        <h2 className="text-2xl font-bold text-gray-900">Interviews</h2>
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
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
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
                <p className="text-gray-600 mb-3">{interview.jobTitle}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
      <h2 className="text-2xl font-bold text-gray-900">Messages</h2>

      <div className="grid gap-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow ${
              conversation.unread ? "border-l-4 border-l-orange" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversation.candidateName}
                  </h3>
                  {conversation.unread && (
                    <span className="w-2 h-2 bg-orange rounded-full"></span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Subscription & Billing
        </h1>
        <p className="text-gray-600">
          Manage your subscription plan, view billing history, and track usage
        </p>
      </div>
      <SubscriptionManager />
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
      </Routes>
    </CompanyPortalLayout>
  );
}
