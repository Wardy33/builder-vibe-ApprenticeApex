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
import { useSubscriptionLimits } from "../hooks/useSubscriptionLimits";
import LiveChat from "../components/LiveChat";
import NotificationModal from "../components/NotificationModal";
import {
  ArrowLeft, Home, Building2, Users, BarChart3, Plus, Search, Filter, Eye, MessageCircle, Video, Settings, Bell, X,
  CheckCircle, Clock, Calendar, Mail, Phone, MapPin, Edit, Trash2, Save, CreditCard, Menu, TrendingUp, Target,
  Award, UserCheck, DollarSign, Activity, Star, FileText, Download, Filter as FilterIcon,
} from "lucide-react";

// Simplified interfaces
interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  applicationDate: string;
  status: "pending" | "reviewed" | "interview" | "rejected" | "accepted";
  score: number;
  location?: string;
  experience?: string;
  skills?: string[];
}

interface JobListing {
  id: string;
  title: string;
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

// Reduced mock data (keeping only essential items)
const mockApplications: Application[] = [
  {
    id: "1", candidateName: "Sarah Johnson", jobTitle: "Software Developer", applicationDate: "2024-01-15", status: "pending", score: 92,
    location: "London, UK", experience: "2 years", skills: ["React", "TypeScript", "Node.js", "Python"],
  },
  {
    id: "2", candidateName: "Mike Chen", jobTitle: "Digital Marketing Assistant", applicationDate: "2024-01-14", status: "interview", score: 88,
    location: "Manchester, UK", experience: "1 year", skills: ["SEO", "Social Media", "Analytics"],
  },
  {
    id: "3", candidateName: "Emma Davis", jobTitle: "Electrical Engineer", applicationDate: "2024-01-13", status: "reviewed", score: 95,
    location: "Birmingham, UK", experience: "3 years", skills: ["Circuit Design", "CAD", "Project Management"],
  },
];

const mockJobListings: JobListing[] = [
  {
    id: "1", title: "Software Developer Apprentice", location: "London, UK", type: "full-time", salary: "£18,000 - £22,000",
    description: "Join our development team as an apprentice software developer. You'll work on real projects while studying for your qualification.",
    requirements: ["A-Levels or equivalent", "Interest in programming", "Problem-solving skills"], postedDate: "2024-01-10", closingDate: "2024-02-15", applications: 24, status: "active",
  },
  {
    id: "2", title: "Digital Marketing Apprentice", location: "Manchester, UK", type: "full-time", salary: "£16,000 - £20,000",
    description: "Learn digital marketing while working with our experienced team on client campaigns.",
    requirements: ["GCSEs including English and Maths", "Social media savvy", "Creative thinking"], postedDate: "2024-01-08", closingDate: "2024-02-28", applications: 18, status: "active",
  },
];

const mockInterviews: Interview[] = [
  {
    id: "1", candidateName: "Sarah Johnson", jobTitle: "Software Developer", date: "2024-01-20", time: "14:00",
    type: "video", status: "scheduled", duration: "45 minutes",
  },
  {
    id: "2", candidateName: "Mike Chen", jobTitle: "Digital Marketing Assistant", date: "2024-01-22", time: "10:30",
    type: "video", status: "scheduled", duration: "30 minutes",
  },
];

const mockNotifications: Notification[] = [
  {
    id: "1", type: "application", title: "New Application", message: "Sarah Johnson applied for Software Developer position",
    timestamp: "2024-01-15T10:30:00Z", read: false,
  },
  {
    id: "2", type: "interview", title: "Interview Reminder", message: "Video interview with Mike Chen in 1 hour",
    timestamp: "2024-01-15T13:00:00Z", read: false,
  },
];

// Reusable style constants
const cardClass = "bg-white rounded-2xl p-6 border border-gray-200 shadow-sm";
const buttonPrimary = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors";
const inputClass = "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

// Status badge helper
const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    interview: "bg-blue-100 text-blue-700",
    reviewed: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    paused: "bg-yellow-100 text-yellow-700",
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
};

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, TechCorp Ltd!</h1>
            <p className="text-gray-600">Here's your recruitment overview for today</p>
          </div>
          <button onClick={() => navigate('/company/listings?create=true')} className={`${buttonPrimary} flex items-center space-x-2`}>
            <Plus className="h-4 w-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Building2, color: "blue", label: "Active Job Listings", value: "12", change: "+2 this week" },
          { icon: Users, color: "purple", label: "Total Applications", value: "247", change: "+18 this week" },
          { icon: Video, color: "orange", label: "Interviews Scheduled", value: "8", change: "3 today" },
          { icon: TrendingUp, color: "green", label: "Match Rate", value: "78%", change: "+5% this month" },
        ].map((stat, i) => (
          <div key={i} className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-lg">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
            <Link to="/company/applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
          </div>
          <div className="space-y-4">
            {mockApplications.slice(0, 3).map((app) => (
              <div key={app.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {app.candidateName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{app.candidateName}</h4>
                  <p className="text-gray-600 text-xs">{app.jobTitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-blue-600 font-semibold text-sm">{app.score}%</div>
                  <StatusBadge status={app.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
            <Link to="/company/interviews" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
          </div>
          <div className="space-y-4">
            {mockInterviews.slice(0, 3).map((interview) => (
              <div key={interview.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{interview.candidateName}</h4>
                  <p className="text-gray-600 text-xs">{interview.jobTitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-gray-900 font-medium text-sm">{new Date(interview.date).toLocaleDateString()}</div>
                  <div className="text-gray-600 text-xs">{interview.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyPortalLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/company", icon: BarChart3, label: "Dashboard" },
    { path: "/company/listings", icon: Building2, label: "Job Listings" },
    { path: "/company/applications", icon: Users, label: "Applications" },
    { path: "/company/interviews", icon: Video, label: "Interviews" },
    { path: "/company/messages", icon: MessageCircle, label: "Messages" },
    { path: "/company/subscription", icon: CreditCard, label: "Subscription" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowMobileSidebar(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
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
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 rounded-xl relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}>
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
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
        {showMobileSidebar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileSidebar(false)} />
        )}

        <aside className={`${showMobileSidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-81px)] z-50 transition-transform`}>
          <nav className="p-6 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} 
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                  isActive(item.path) ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-700"
                }`}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t border-gray-200 mt-6">
              <Link to="/company/settings/profile" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 text-gray-700">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button onClick={() => navigate('/')} className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-red-600">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Main Site</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <LiveChat />
    </div>
  );
}

// Simplified page components
function JobListingsPage() {
  const [listings] = useState<JobListing[]>(mockJobListings);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
          <p className="text-gray-600">Manage your active job postings</p>
        </div>
        <button className={`${buttonPrimary} flex items-center space-x-2`}>
          <Plus className="h-5 w-5" />
          <span>Create Listing</span>
        </button>
      </div>

      <div className={cardClass}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search job listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredListings.map((listing) => (
          <div key={listing.id} className={`${cardClass} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                  <StatusBadge status={listing.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location}</span>
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
                <p className="text-gray-700 mb-4">{listing.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-600 text-lg">{listing.salary}</span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
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
  const [applications] = useState<Application[]>(mockApplications);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = applications.filter(app =>
    app.candidateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
        <p className="text-gray-600">Review and manage candidate applications</p>
      </div>

      <div className={cardClass}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredApplications.map((app) => (
          <div key={app.id} className={`${cardClass} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {app.candidateName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{app.candidateName}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-gray-600 mb-3">{app.jobTitle}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{app.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(app.applicationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{app.experience} experience</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-blue-600 font-bold text-xl">{app.score}%</div>
                <div className="text-gray-600 text-xs">Match</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterviewsPage() {
  const [interviews] = useState<Interview[]>(mockInterviews);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Interviews</h2>
        <p className="text-gray-600">Manage scheduled interviews</p>
      </div>

      <div className="space-y-4">
        {interviews.map((interview) => (
          <div key={interview.id} className={`${cardClass} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{interview.candidateName}</h3>
                    <StatusBadge status={interview.status} />
                  </div>
                  <p className="text-gray-600 mb-3">{interview.jobTitle}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
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

function MessagesPage() {
  const conversations = [
    {
      id: "1", candidateName: "Sarah Johnson", lastMessage: "Thank you for considering my application.",
      timestamp: "2024-01-15T14:30:00Z", unread: true, jobTitle: "Software Developer",
    },
    {
      id: "2", candidateName: "Mike Chen", lastMessage: "I'm available for the interview on Tuesday at 2 PM.",
      timestamp: "2024-01-15T11:20:00Z", unread: false, jobTitle: "Digital Marketing Assistant",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-gray-600">Communicate with candidates</p>
      </div>

      <div className="space-y-4">
        {conversations.map((conv) => (
          <div key={conv.id} className={`${cardClass} hover:shadow-md cursor-pointer transition-all ${conv.unread ? "border-blue-300 bg-blue-50" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {conv.candidateName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{conv.candidateName}</h3>
                    {conv.unread && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{conv.jobTitle}</p>
                  <p className="text-gray-700 line-clamp-2">{conv.lastMessage}</p>
                  <p className="text-gray-500 text-sm mt-2">{new Date(conv.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
        <p className="text-gray-600">Manage your subscription plan and billing</p>
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
      id: "1", senderId: "student", content: "Thank you for considering my application.", timestamp: "10:30 AM", isOwn: false,
    },
    {
      id: "2", senderId: "company", content: "Hi Sarah! We'd like to schedule a video interview with you.", timestamp: "10:45 AM", isOwn: true,
    },
  ]);

  const candidateInfo = { name: "Sarah Johnson", jobTitle: "Software Developer" };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: `msg_${Date.now()}`, senderId: "company", content: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isOwn: true,
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full mr-3">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">{candidateInfo.name}</h1>
            <p className="text-sm text-gray-600">{candidateInfo.jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
              msg.isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
            }`}>
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.isOwn ? "text-blue-100" : "text-gray-500"}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <input
            type="text" value={message} onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..." className={inputClass}
          />
          <button onClick={handleSendMessage} disabled={!message.trim()} className={buttonPrimary}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanySettingsPage() {
  const navigate = useNavigate();

  const settingsOptions = [
    { path: "/company/settings/profile", icon: Building2, title: "Company Profile", desc: "Update company information" },
    { path: "/company/settings/users", icon: Users, title: "User Management", desc: "Manage team members" },
    { path: "/company/settings/notifications", icon: Bell, title: "Notifications", desc: "Configure alerts" },
    { path: "/company/settings/billing", icon: CreditCard, title: "Billing", desc: "Manage payments" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>
        <p className="text-gray-600">Manage your company profile and preferences</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {settingsOptions.map((option) => (
          <Link key={option.path} to={option.path} className={`${cardClass} hover:shadow-md transition-all group`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200">
                <option.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-gray-600 text-sm">{option.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CompanyProfileSettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    companyName: "TechCorp Ltd",
    description: "A leading technology company specializing in software development.",
    industry: "Technology", size: "50-100", website: "https://techcorp.co.uk",
    address: "123 Tech Street, London, UK", phone: "+44 20 1234 5678", email: "hr@techcorp.co.uk"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
          <p className="text-gray-600">Update your company information</p>
        </div>
      </div>

      <div className={`${cardClass} space-y-6`}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input type="text" value={profile.companyName}
              onChange={(e) => setProfile({...profile, companyName: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select value={profile.industry}
              onChange={(e) => setProfile({...profile, industry: e.target.value})} className={inputClass}>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea value={profile.description} rows={4}
            onChange={(e) => setProfile({...profile, description: e.target.value})} className={inputClass} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
            <select value={profile.size} onChange={(e) => setProfile({...profile, size: e.target.value})} className={inputClass}>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-100">51-100 employees</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input type="url" value={profile.website}
              onChange={(e) => setProfile({...profile, website: e.target.value})} className={inputClass} />
          </div>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
            Profile updated successfully!
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className={buttonPrimary}>
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
      <Route path="/*" element={
        <CompanyPortalLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/listings" element={<JobListingsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:id" element={<CompanyChatPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/settings" element={<CompanySettingsPage />} />
            <Route path="/settings/profile" element={<CompanyProfileSettingsPage />} />
          </Routes>
        </CompanyPortalLayout>
      } />
    </Routes>
  );
}
