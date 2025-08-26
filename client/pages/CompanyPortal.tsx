import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SubscriptionManager from "../components/SubscriptionManager";
import SubscriptionPrompt from "../components/SubscriptionPrompt";
import CompanyPricing from "../components/CompanyPricing";
import { useSubscriptionLimits } from "../hooks/useSubscriptionLimits";
import LiveChat from "../components/LiveChat";
import NotificationModal from "../components/NotificationModal";
import { apiClient } from "../lib/apiUtils";
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
  Menu,
  TrendingUp,
  Target,
  Award,
  UserCheck,
  DollarSign,
  Activity,
  Star,
  FileText,
  Download,
  Filter as FilterIcon,
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
  closingDate: string;
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

// Mock applications removed - using real API data

// Mock job listings removed - using real API data

// Mock interviews removed - using real API data

// Mock notifications removed - using real API data

function Dashboard() {
  const navigate = useNavigate();
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load recent applications using correct API
        const appsResponse = await apiClient.getCompanyApplications({ limit: 3, recent: true });
        if (appsResponse.success && appsResponse.data) {
          setRecentApplications(appsResponse.data.applications || appsResponse.data || []);
        }

        // Load recent interviews using correct API
        const interviewsResponse = await apiClient.getCompanyInterviews({ limit: 3, recent: true });
        if (interviewsResponse.success && interviewsResponse.data) {
          setRecentInterviews(interviewsResponse.data.interviews || interviewsResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setRecentApplications([]);
        setRecentInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handlePostNewJob = () => {
    navigate('/company/listings?create=true');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, TechCorp Ltd! 👋
            </h1>
            <p className="text-gray-600">
              Here's your recruitment overview for today
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePostNewJob}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-lg">
              +2 this week
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
          <p className="text-gray-600 text-sm">Active Job Listings</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-lg">
              +18 this week
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">247</h3>
          <p className="text-gray-600 text-sm">Total Applications</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Video className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
              3 today
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">8</h3>
          <p className="text-gray-600 text-sm">Interviews Scheduled</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-lg">
              +5% this month
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">78%</h3>
          <p className="text-gray-600 text-sm">Match Rate</p>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Applications This Month
            </h3>
            <div className="flex items-center space-x-2">
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last year</option>
              </select>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[
              { day: "Mon", value: 65 },
              { day: "Tue", value: 85 },
              { day: "Wed", value: 72 },
              { day: "Thu", value: 90 },
              { day: "Fri", value: 78 },
              { day: "Sat", value: 45 },
              { day: "Sun", value: 55 },
            ].map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg w-full transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                  style={{ height: `${day.value}%` }}
                  title={`${day.day}: ${Math.round((day.value / 100) * 50)} applications`}
                />
                <span className="text-gray-600 text-xs mt-2 font-medium">
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Jobs */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Performing Jobs
          </h3>
          <div className="space-y-4">
            {[
              { title: "Software Developer", applications: 45, trend: "up" },
              { title: "Data Analyst", applications: 31, trend: "up" },
              { title: "Marketing Assistant", applications: 28, trend: "down" },
              { title: "Engineering Apprentice", applications: 24, trend: "up" },
            ].map((job, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                  <p className="text-gray-600 text-xs">
                    {job.applications} applications
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      job.trend === "up" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      job.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {job.trend === "up" ? "↗" : "↘"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h3>
            <Link
              to="/company/applications"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Loading applications...</p>
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No recent applications</p>
              </div>
            ) : (
              recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center space-x-4 p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {(application.candidateName || 'U').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {application.candidateName || 'Unknown Candidate'}
                    </h4>
                    <p className="text-gray-600 text-xs">{application.jobTitle || 'Position'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-semibold text-sm">
                      {application.score || 0}%
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        application.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : application.status === "interview"
                          ? "bg-blue-100 text-blue-700"
                          : application.status === "reviewed"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {application.status || 'new'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Interviews
            </h3>
            <Link
              to="/company/interviews"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Loading interviews...</p>
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No upcoming interviews</p>
              </div>
            ) : (
              recentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center space-x-4 p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {interview.candidateName || 'Unknown Candidate'}
                    </h4>
                    <p className="text-gray-600 text-xs">{interview.jobTitle || 'Position'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-medium text-sm">
                      {interview.date ? new Date(interview.date).toLocaleDateString() : 'TBD'}
                    </div>
                    <div className="text-gray-600 text-xs">{interview.time || 'TBD'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyPortalLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ApprenticeApex</h1>
                <p className="text-xs text-gray-600">Company Portal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-xl relative text-gray-700 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-700"
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
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`flex-shrink-0 p-2 rounded-xl ${
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
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">TC</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Modern Sidebar */}
        <aside
          className={`${
            showMobileSidebar ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-81px)] z-50 transition-transform duration-300 ease-in-out`}
        >
          <nav className="p-6 space-y-2">
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-between items-center mb-6">
              <span className="font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Link
              to="/company"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive("/company") || isActive("/company/")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive("/company") || isActive("/company/")
                  ? "bg-blue-200"
                  : ""
              }`}>
                <BarChart3 className="h-5 w-5" />
              </div>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/company/listings"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive("/company/listings")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive("/company/listings")
                  ? "bg-blue-200"
                  : ""
              }`}>
                <Building2 className="h-5 w-5" />
              </div>
              <span>Job Listings</span>
            </Link>

            <Link
              to="/company/applications"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive("/company/applications")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive("/company/applications")
                  ? "bg-blue-200"
                  : ""
              }`}>
                <Users className="h-5 w-5" />
              </div>
              <span>Applications</span>
            </Link>

            <Link
              to="/company/interviews"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive("/company/interviews")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive("/company/interviews")
                  ? "bg-blue-200"
                  : ""
              }`}>
                <Video className="h-5 w-5" />
              </div>
              <span>Interviews</span>
            </Link>

            <Link
              to="/company/messages"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive("/company/messages")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive("/company/messages")
                  ? "bg-blue-200"
                  : ""
              }`}>
                <MessageCircle className="h-5 w-5" />
              </div>
              <span>Messages</span>
            </Link>

            <Link
              to="/company/subscription"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive("/company/subscription")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive("/company/subscription")
                  ? "bg-blue-200"
                  : ""
              }`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <span>Subscription</span>
            </Link>

            <Link
              to="/company/pricing"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive("/company/pricing")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className={`p-1 rounded-lg ${
                isActive("/company/pricing")
                  ? "bg-blue-200"
                  : ""
              }`}>
                <DollarSign className="h-5 w-5" />
              </div>
              <span>Upgrade Plan</span>
            </Link>

            <div className="pt-4 border-t border-gray-200 mt-6">
              <Link
                to="/company/settings/profile"
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all duration-200"
              >
                <div className="p-1 rounded-lg">
                  <Settings className="h-5 w-5" />
                </div>
                <span>Settings</span>
              </Link>

              <button
              onClick={() => navigate('/')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-200"
            >
              <div className="p-1 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span>Back to Main Site</span>
            </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-0">
          {children}
        </main>
      </div>
      <LiveChat />
    </div>
  );
}

// Update remaining page components to match the modern design...
function JobListingsPage() {
  const location = useLocation();
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'payment';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  // Load job listings
  useEffect(() => {
    const loadJobListings = async () => {
      try {
        const response = await apiClient.getMyListings();
        if (response.success && response.data) {
          setListings(response.data.apprenticeships || response.data || []);
        }
      } catch (error) {
        console.error('Failed to load job listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobListings();
  }, []);

  // Check if we should open create modal from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('create') === 'true') {
      // Clear the URL parameter
      window.history.replaceState({}, '', '/company/listings');
      // Open create modal
      setIsCreating(true);
    }
  }, [location]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filterRef = useRef<HTMLDivElement>(null);
  const subscriptionLimits = useSubscriptionLimits();

  // Form state for creating/editing listings
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract',
    salary: '',
    description: '',
    requirements: [''],
    closingDate: ''
  });

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

    // Reset form and open create modal
    setFormData({
      title: '',
      location: '',
      type: 'full-time',
      salary: '',
      description: '',
      requirements: [''],
      closingDate: ''
    });
    setIsCreating(true);
  };

  const handleEditListing = (listing: JobListing) => {
    if (listing.status === 'active') {
      alert('Cannot edit an active job listing. Please pause it first.');
      return;
    }

    setFormData({
      title: listing.title,
      location: listing.location,
      type: listing.type,
      salary: listing.salary,
      description: listing.description,
      requirements: listing.requirements,
      closingDate: listing.closingDate
    });
    setEditingId(listing.id);
  };

  const handleSaveListing = async () => {
    // Validate form
    if (!formData.title || !formData.location || !formData.salary || !formData.description || !formData.closingDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.requirements.some(req => !req.trim())) {
      alert('Please fill in all requirements or remove empty ones');
      return;
    }

    const listingData = {
      title: formData.title,
      location: formData.location,
      salary: formData.salary,
      description: formData.description,
      requirements: formData.requirements.filter(req => req.trim()),
      applicationDeadline: formData.closingDate,
      employmentType: formData.type || 'full-time',
      isActive: true
    };

    try {
      if (editingId) {
        // Update existing listing
        const response = await apiClient.updateListing(editingId, listingData);
        if (response.success) {
          // Update local state with server response
          setListings(prev =>
            prev.map(listing =>
              listing.id === editingId
                ? { ...listing, ...response.data }
                : listing
            )
          );
          setEditingId(null);
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Job Listing Updated!',
            message: `Your ${formData.title} position has been updated successfully. All changes are now live.`
          });
        } else {
          alert(`Failed to update listing: ${response.error?.error || 'Unknown error'}`);
          return;
        }
      } else {
        // Create new listing
        const response = await apiClient.createListing(listingData);
        if (response.success && response.data) {
          // Add new listing from server response
          setListings(prev => [response.data, ...prev]);
          setIsCreating(false);
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Job Listing Created!',
            message: `Your ${formData.title} position has been posted successfully and is now live. Candidates can start applying immediately.`
          });
        } else {
          alert(`Failed to create listing: ${response.error?.error || 'Unknown error'}`);
          return;
        }
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Failed to save listing. Please try again.');
      return;
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      setFormData(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
          <p className="text-gray-600">Manage your active job postings</p>
        </div>
        <button
          onClick={handleCreateListing}
          disabled={subscriptionLimits.loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          <span>Create Listing</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search job listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <FilterIcon className="h-5 w-5 text-gray-600" />
            </button>

            {showFilters && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10 min-w-48">
                <h4 className="font-semibold text-gray-900 mb-3">Filter by Status</h4>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "paused", label: "Paused" },
                    { value: "closed", label: "Closed" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={statusFilter === option.value}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Listings Grid */}
      <div className="space-y-4">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {listing.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                    <span className="capitalize">{listing.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{listing.applications} applications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(listing.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{listing.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-600 text-lg">
                    {listing.salary}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStatus(listing.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        listing.status === "active"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {listing.status === "active" ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEditListing(listing)}
                      disabled={listing.status === 'active'}
                      className={`p-2 rounded-xl transition-colors ${
                        listing.status === 'active'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title={listing.status === 'active' ? 'Pause the listing first to edit' : 'Edit listing'}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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

      {/* Create/Edit Listing Modal */}
      {(isCreating || editingId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Job Listing' : 'Create New Job Listing'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Software Developer Apprentice"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. London, UK"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range *</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="e.g. £18,000 - £22,000"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder="Describe the role, responsibilities, and what the apprentice will learn..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements *</label>
                <div className="space-y-3">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`Requirement ${index + 1}`}
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          onClick={() => removeRequirement(index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addRequirement}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Requirement</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Closing Date *</label>
                <input
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => setFormData({...formData, closingDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveListing}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingId ? 'Update Listing' : 'Create Listing'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}

// Continue with other page components using the same modern design...
function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await apiClient.getCompanyApplications();
        if (response.success && response.data) {
          setApplications(response.data.applications || response.data || []);
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState<string | null>(null);
  const [interviewDetails, setInterviewDetails] = useState({
    date: '',
    time: '',
    type: 'video' as 'video' | 'phone' | 'in-person',
    duration: '30'
  });

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || application.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateApplicationStatus = (id: string, newStatus: Application["status"]) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
    );
  };

  const handleScheduleInterview = (applicationId: string) => {
    setShowScheduleModal(applicationId);
    // Reset form
    setInterviewDetails({
      date: '',
      time: '',
      type: 'video',
      duration: '30'
    });
  };

  const confirmScheduleInterview = () => {
    if (!interviewDetails.date || !interviewDetails.time) {
      alert('Please fill in all required fields');
      return;
    }

    // Update application status to interview
    updateApplicationStatus(showScheduleModal!, 'interview');

    // Here you would also send the interview details to your backend
    console.log('Scheduling interview:', {
      applicationId: showScheduleModal,
      ...interviewDetails
    });

    alert(`Interview scheduled successfully for ${interviewDetails.date} at ${interviewDetails.time}`);
    setShowScheduleModal(null);
  };

  const handleMessageCandidate = (applicationId: string) => {
    // Navigate to messages page with this candidate
    navigate(`/company/messages/${applicationId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
          <p className="text-gray-600">Review and manage candidate applications</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
      </div>

      {/* Applications Grid */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div
            key={application.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {application.candidateName.charAt(0)}
                </div>
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
                  <p className="text-gray-600 mb-3">{application.jobTitle}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{application.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{application.experience} experience</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-blue-600 font-bold text-xl">
                        {application.score}%
                      </div>
                      <div className="text-gray-600 text-xs">Match Score</div>
                    </div>
                    <div>
                      <div className="text-gray-700 text-sm font-medium mb-1">Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {application.skills?.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {application.skills && application.skills.length > 3 && (
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-xs">
                            +{application.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMessageCandidate(application.id)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 rounded-xl transition-colors"
                    title="Message Candidate"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleScheduleInterview(application.id)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-xl transition-colors"
                    title="Schedule Interview"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
                <select
                  value={application.status}
                  onChange={(e) =>
                    updateApplicationStatus(
                      application.id,
                      e.target.value as Application["status"],
                    )
                  }
                  className="text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedApplication.candidateName} - {selectedApplication.jobTitle}
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
                  <h4 className="font-semibold text-gray-900 mb-3">Application Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Location: {selectedApplication.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Experience: {selectedApplication.experience}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 italic">
                        Contact information has been removed for privacy compliance.
                        Use the message feature to communicate with the candidate.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Application Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      Applied: {new Date(selectedApplication.applicationDate).toLocaleDateString()}
                    </div>
                    <div>Experience: {selectedApplication.experience}</div>
                    <div className="flex items-center space-x-2">
                      <span>Match Score:</span>
                      <span className="font-bold text-blue-600">
                        {selectedApplication.score}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm"
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
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleMessageCandidate(selectedApplication.id);
                    setSelectedApplication(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => {
                    handleScheduleInterview(selectedApplication.id);
                    setSelectedApplication(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Interview</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Schedule Interview</h3>
              <button
                onClick={() => setShowScheduleModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={interviewDetails.date}
                  onChange={(e) => setInterviewDetails({...interviewDetails, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={interviewDetails.time}
                  onChange={(e) => setInterviewDetails({...interviewDetails, time: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                <select
                  value={interviewDetails.type}
                  onChange={(e) => setInterviewDetails({...interviewDetails, type: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <select
                  value={interviewDetails.duration}
                  onChange={(e) => setInterviewDetails({...interviewDetails, duration: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmScheduleInterview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const response = await apiClient.getCompanyInterviews();
        if (response.success && response.data) {
          setInterviews(response.data.interviews || response.data || []);
        }
      } catch (error) {
        console.error('Failed to load interviews:', error);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, []);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || interview.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateInterviewStatus = (id: string, newStatus: Interview["status"]) => {
    setInterviews((prev) =>
      prev.map((interview) =>
        interview.id === id ? { ...interview, status: newStatus } : interview,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interviews</h2>
          <p className="text-gray-600">Manage scheduled interviews with candidates</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Interviews Grid */}
      <div className="space-y-4">
        {filteredInterviews.map((interview) => (
          <div
            key={interview.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
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
                      <span className="capitalize">{interview.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{interview.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-6">
                <select
                  value={interview.status}
                  onChange={(e) =>
                    updateInterviewStatus(
                      interview.id,
                      e.target.value as Interview["status"],
                    )
                  }
                  className="text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => {
                    if (interview.type === 'video' && interview.status === 'scheduled') {
                      // For demo purposes, open a generic video call platform
                      // In a real app, this would connect to your video call service
                      const videoCallUrl = `https://meet.google.com/new?authuser=0`;
                      window.open(videoCallUrl, '_blank');
                    } else if (interview.type !== 'video') {
                      alert(`This is a ${interview.type} interview. Video call not available.`);
                    } else if (interview.status !== 'scheduled') {
                      alert('This interview is not scheduled yet.');
                    }
                  }}
                  disabled={interview.type !== 'video' || interview.status !== 'scheduled'}
                  className={`p-2 rounded-xl transition-colors ${
                    interview.type === 'video' && interview.status === 'scheduled'
                      ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  title={
                    interview.type !== 'video'
                      ? `${interview.type} interview - video call not available`
                      : interview.status !== 'scheduled'
                      ? 'Interview not scheduled yet'
                      : 'Start video call'
                  }
                >
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
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([
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

  const markAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, unread: false } : conv
      )
    );
  };

  const openChat = (conversationId: string) => {
    markAsRead(conversationId);
    navigate(`/company/chat/${conversationId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-gray-600">Communicate with candidates</p>
      </div>

      {/* Messages Grid */}
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => openChat(conversation.id)}
            className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 ${
              conversation.unread ? "border-blue-300 bg-blue-50" : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {conversation.candidateName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {conversation.candidateName}
                    </h3>
                    {conversation.unread && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {conversation.jobTitle}
                  </p>
                  <p className="text-gray-700 line-clamp-2">{conversation.lastMessage}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {new Date(conversation.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                {conversation.unread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {conversations.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-600">Messages from candidates will appear here</p>
        </div>
      )}
    </div>
  );
}

// Subscription Page Component
function SubscriptionPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
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

function CompanyChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      senderId: "student",
      content: "Thank you for considering my application. I'm really excited about this opportunity and would love to learn more about the role.",
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: "2",
      senderId: "company",
      content: "Hi Sarah! We're impressed with your application. We'd like to schedule a video interview with you. Are you available this week?",
      timestamp: "10:45 AM",
      isOwn: true,
    },
    {
      id: "3",
      senderId: "student",
      content: "Yes, I'm available! I'm flexible with timing. What days work best for you?",
      timestamp: "11:00 AM",
      isOwn: false,
    },
  ]);

  const [candidateInfo, setCandidateInfo] = useState(null);

  useEffect(() => {
    const loadCandidateInfo = async () => {
      try {
        const response = await fetch(`/api/conversations/${id}/candidate`);
        if (response.ok) {
          const data = await response.json();
          setCandidateInfo(data.candidate);
        }
      } catch (error) {
        console.error('Failed to load candidate info:', error);
        setCandidateInfo({ name: 'Unknown Candidate', jobTitle: 'Position', avatar: null });
      }
    };

    if (id) {
      loadCandidateInfo();
    }
  }, [id]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: `msg_${Date.now()}`,
        senderId: "company",
        content: message.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // In real app, send message via API to sync with student app
      console.log("Sending message to student app:", newMessage.content);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-700 mr-3 transition-all duration-200"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <img
            src={candidateInfo.avatar}
            alt={candidateInfo.name}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <h1 className="font-semibold text-gray-900">{candidateInfo.name}</h1>
            <p className="text-sm text-gray-600">{candidateInfo.jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const videoCallUrl = `https://meet.google.com/new?authuser=0`;
              window.open(videoCallUrl, '_blank');
            }}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-all duration-200"
            title="Start video call"
          >
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-all duration-200">
            <Phone className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                msg.isOwn
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${
                msg.isOwn ? "text-blue-100" : "text-gray-500"
              }`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanySettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>
        <p className="text-gray-600">Manage your company profile and preferences</p>
      </div>

      {/* Settings Navigation */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/company/settings/profile"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Company Profile</h3>
              <p className="text-gray-600 text-sm">Update company information and branding</p>
            </div>
          </div>
        </Link>

        <Link
          to="/company/settings/users"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <p className="text-gray-600 text-sm">Manage team members and permissions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/company/settings/notifications"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-gray-600 text-sm">Configure alert preferences</p>
            </div>
          </div>
        </Link>

        <Link
          to="/company/settings/integrations"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Integrations</h3>
              <p className="text-gray-600 text-sm">Connect with external tools</p>
            </div>
          </div>
        </Link>

        <Link
          to="/company/settings/billing"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Billing & Payment</h3>
              <p className="text-gray-600 text-sm">Manage payment methods and billing</p>
            </div>
          </div>
        </Link>

        <Link
          to="/company/settings/security"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Settings className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Security</h3>
              <p className="text-gray-600 text-sm">Password and security settings</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function CompanyProfileSettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    companyName: "TechCorp Ltd",
    description: "A leading technology company specializing in software development and digital innovation.",
    industry: "Technology",
    size: "50-100",
    website: "https://techcorp.co.uk",
    address: "123 Tech Street, London, UK",
    phone: "+44 20 1234 5678",
    email: "hr@techcorp.co.uk",
    logo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
          <p className="text-gray-600">Update your company information</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => setProfile({...profile, companyName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select
              value={profile.industry}
              onChange={(e) => setProfile({...profile, industry: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile({...profile, description: e.target.value})}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
            <select
              value={profile.size}
              onChange={(e) => setProfile({...profile, size: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-100">51-100 employees</option>
              <option value="101-500">101-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => setProfile({...profile, website: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({...profile, address: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
            Profile updated successfully!
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyPortal() {
  return (
    <Routes>
      <Route path="/chat/:id" element={<CompanyChatPage />} />
      <Route
        path="/*"
        element={
          <CompanyPortalLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/listings" element={<JobListingsPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/interviews" element={<InterviewsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:id" element={<CompanyChatPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/pricing" element={<CompanyPricingPage />} />
              <Route path="/settings" element={<CompanySettingsPage />} />
              <Route path="/settings/profile" element={<CompanyProfileSettingsPage />} />
            </Routes>
          </CompanyPortalLayout>
        }
      />
    </Routes>
  );
}
