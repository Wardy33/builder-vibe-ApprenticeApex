import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
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
  Cancel,
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
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Listings</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
            <Building2 className="h-8 w-8 text-orange" />
          </div>
          <div className="mt-4">
            <span className="text-orange text-sm">+2 this week</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Applications This Month
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2">
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
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Recent Applications
          </h3>
          <Link
            to="/company/applications"
            className="text-orange hover:text-orange/80"
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Match student app black header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-black">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-full text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-white">
            <span className="text-orange">ApprenticeApex</span> Portal
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-800 rounded-full relative text-white">
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-full text-white">
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Light theme like student app */}
        <aside className="w-64 border-r border-gray-200 min-h-[calc(100vh-73px)] bg-gray-50">
          <nav className="p-4 space-y-2">
            <Link
              to="/company"
              className="flex items-center space-x-3 p-3 rounded-lg bg-orange/10 text-orange"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/company/listings"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 text-gray-700"
            >
              <Building2 className="h-5 w-5" />
              <span>Job Listings</span>
            </Link>
            <Link
              to="/company/applications"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 text-gray-700"
            >
              <Users className="h-5 w-5" />
              <span>Applications</span>
            </Link>
            <Link
              to="/company/interviews"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 text-gray-700"
            >
              <Video className="h-5 w-5" />
              <span>Interviews</span>
            </Link>
            <Link
              to="/company/messages"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 text-gray-700"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content - White background */}
        <main className="flex-1 bg-white text-gray-900">{children}</main>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange mb-4">{title}</h2>
        <p className="text-gray-600">This feature is coming soon!</p>
      </div>
    </div>
  );
}

export default function CompanyPortal() {
  return (
    <CompanyPortalLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/listings"
          element={<PlaceholderPage title="Job Listings" />}
        />
        <Route
          path="/applications"
          element={<PlaceholderPage title="Applications" />}
        />
        <Route
          path="/interviews"
          element={<PlaceholderPage title="Interviews" />}
        />
        <Route
          path="/messages"
          element={<PlaceholderPage title="Messages" />}
        />
      </Routes>
    </CompanyPortalLayout>
  );
}
