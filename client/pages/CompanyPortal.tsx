import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
} from "lucide-react";

interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  applicationDate: string;
  status: "pending" | "reviewed" | "interview" | "rejected" | "accepted";
  score: number;
}

const mockApplications: Application[] = [
  {
    id: "1",
    candidateName: "Sarah Johnson",
    jobTitle: "Software Developer",
    applicationDate: "2024-01-15",
    status: "pending",
    score: 92,
  },
  {
    id: "2",
    candidateName: "Mike Chen",
    jobTitle: "Digital Marketing Assistant",
    applicationDate: "2024-01-14",
    status: "interview",
    score: 88,
  },
  {
    id: "3",
    candidateName: "Emma Davis",
    jobTitle: "Electrical Engineer",
    applicationDate: "2024-01-13",
    status: "reviewed",
    score: 95,
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
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Applications</h3>
          <Link
            to="/company/applications"
            className="text-company-accent hover:text-company-accent/80"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {mockApplications.slice(0, 3).map((application) => (
            <div
              key={application.id}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
            >
              <div>
                <h4 className="font-semibold text-white">
                  {application.candidateName}
                </h4>
                <p className="text-gray-400 text-sm">{application.jobTitle}</p>
                <p className="text-gray-500 text-xs">
                  {application.applicationDate}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-company-accent font-bold">
                    {application.score}%
                  </div>
                  <div className="text-gray-400 text-xs">Match</div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    application.status === "pending"
                      ? "bg-yellow-900 text-yellow-300"
                      : application.status === "interview"
                        ? "bg-blue-900 text-blue-300"
                        : application.status === "reviewed"
                          ? "bg-purple-900 text-purple-300"
                          : "bg-gray-900 text-gray-300"
                  }`}
                >
                  {application.status}
                </div>
                <button className="text-company-accent hover:text-company-accent/80">
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
        <h2 className="text-2xl font-bold company-accent mb-4">{title}</h2>
        <p className="text-gray-400">This feature is coming soon!</p>
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
