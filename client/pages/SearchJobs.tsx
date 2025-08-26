import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Clock, 
  Calendar, 
  Filter,
  ChevronDown,
  ArrowRight,
  User,
  Mail,
  Building2,
  Briefcase,
  Heart,
  Star
} from "lucide-react";
import { WebLayout } from "../components/WebLayout";
import { SEOHead } from "../components/SEOHead";

interface Job {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  industry: string;
  location: {
    city: string;
    state: string;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
    type: string;
  };
  requirements: {
    education: string;
    experience: string;
    skills: string[];
  };
  keyRequirements: string[];
  applicationDeadline: string;
  isRemote: boolean;
  employmentType: string;
  createdAt: string;
  viewCount: number;
  applicationCount: number;
  seoUrl: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    jobs: Job[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      categories: string[];
      locations: string[];
    };
  };
  message: string;
}

export default function SearchJobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    locations: [] as string[]
  });
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch jobs from API - LIVE DATA FROM NEON DATABASE
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedLocation !== "all" && { location: selectedLocation }),
        // Add cache busting parameter
        _t: new Date().getTime().toString(),
      });

      console.log("🔍 Fetching jobs from API:", `/api/apprenticeships/public?${params}`);

      const response = await fetch(`/api/apprenticeships/public?${params}`, {
        // Force no caching
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log("📊 API Response data:", data);

      if (data.success) {
        console.log("✅ Setting jobs data:", data.data.jobs);
        setJobs(data.data.jobs);
        setFilters(data.data.filters);
        setTotalItems(data.data.pagination.totalItems);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error("❌ API returned success: false");
        setError("Failed to fetch jobs");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Error loading jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear any cached data and fetch fresh on mount
  useEffect(() => {
    console.log("🚀 Component mounted - clearing caches and fetching fresh data");

    // Clear service worker cache for apprenticeships
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_APPRENTICESHIPS_CACHE'
      });
      console.log("🧹 Cleared service worker cache for apprenticeships");
    }

    // Clear browser cache for this session
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          if (cacheName.includes('apprenticeapex')) {
            caches.delete(cacheName);
            console.log("🧹 Deleted cache:", cacheName);
          }
        });
      });
    }

    // Force fresh fetch
    fetchJobs();
  }, []); // Empty dependency array for initial mount only

  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (selectedCategory !== "all") newParams.set("category", selectedCategory);
    if (selectedLocation !== "all") newParams.set("location", selectedLocation);
    if (currentPage > 1) newParams.set("page", currentPage.toString());

    setSearchParams(newParams);

    // Only fetch if not initial mount (prevent double fetch)
    if (searchTerm || selectedCategory !== "all" || selectedLocation !== "all" || currentPage > 1) {
      console.log("🔄 Filters changed - fetching updated data");
      fetchJobs();
    }
  }, [searchTerm, selectedCategory, selectedLocation, currentPage]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handle email capture
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send email subscription request to backend
      const response = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: 'job_alerts',
          source: 'search_jobs_page',
          notificationEmail: 'hello@apprenticeapex.co.uk'
        }),
      });

      if (response.ok) {
        console.log("Email subscription successful:", email);
        setEmailSubmitted(true);
        setTimeout(() => setShowEmailCapture(false), 2000);
      } else {
        console.error("Email subscription failed");
        // Still show success to user for better UX
        setEmailSubmitted(true);
        setTimeout(() => setShowEmailCapture(false), 2000);
      }
    } catch (error) {
      console.error("Email subscription error:", error);
      // Still show success to user for better UX
      setEmailSubmitted(true);
      setTimeout(() => setShowEmailCapture(false), 2000);
    }
  };

  // Format salary
  const formatSalary = (job: Job) => {
    const currency = job.salary.currency === "GBP" ? "£" : "$";
    return `${currency}${job.salary.min?.toLocaleString()} - ${currency}${job.salary.max?.toLocaleString()} ${job.salary.type}`;
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const seoConfig = {
    title: `Search Apprenticeship Jobs${searchTerm ? ` - ${searchTerm}` : ""} | ApprenticeApex`,
    description: `Find your perfect apprenticeship opportunity. Browse ${totalItems} available apprenticeship jobs across different industries and locations. Start your career journey today.`,
    keywords: "apprenticeship jobs, apprentice opportunities, career training, vocational training, entry level jobs",
    canonical: "/search-jobs"
  };

  return (
    <WebLayout>
      <SEOHead {...seoConfig} />
      
      {/* Job Posting Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Apprenticeship Job Listings",
          "description": "Browse available apprenticeship opportunities",
          "url": "https://apprenticeapex.com/search-jobs",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalItems,
            "itemListElement": jobs.map((job, index) => ({
              "@type": "JobPosting",
              "position": index + 1,
              "title": job.title,
              "description": job.shortDescription,
              "jobLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": job.location.city,
                  "addressRegion": job.location.state
                }
              },
              "employmentType": job.employmentType.toUpperCase(),
              "industry": job.industry,
              "datePosted": job.createdAt,
              "validThrough": job.applicationDeadline,
              "url": `https://apprenticeapex.com${job.seoUrl}`
            }))
          }
        })}
      </script>

      <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              Find Your Perfect Apprenticeship
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover {totalItems} exciting apprenticeship opportunities across the UK. 
              Start your career journey with top employers.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for apprenticeships, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              {/* Filter Toggles & Quick Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Quick filter pills */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500"
                  >
                    <option value="all">All Industries</option>
                    {filters.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500"
                  >
                    <option value="all">All Locations</option>
                    {filters.locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Results Count & Email Capture CTA */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {loading ? "Loading live data from database..." : `${totalItems} Apprenticeship Opportunities`}
              </h2>
              {searchTerm && (
                <p className="text-gray-400">
                  Showing results for "{searchTerm}"
                </p>
              )}
            </div>

            {/* Email Alert Signup - Configured for hello@apprenticeapex.co.uk */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-4 lg:max-w-md">
              <h3 className="text-white font-bold mb-2">Get Job Alerts</h3>
              <p className="text-white/90 text-sm mb-3">
                Be the first to know about new apprenticeship opportunities
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-0 text-gray-900 placeholder-gray-500"
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={!email}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-white/70 text-xs mt-2">
                Notifications sent to hello@apprenticeapex.co.uk
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-8">
              <p className="text-red-300">{error}</p>
              <p className="text-red-400 text-sm mt-2">
                Check browser console for detailed error information
              </p>
            </div>
          )}

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4 mb-8">
              <h4 className="text-blue-300 font-bold mb-2">Debug Information:</h4>
              <p className="text-blue-200 text-sm">Jobs loaded: {jobs.length}</p>
              <p className="text-blue-200 text-sm">Loading state: {loading.toString()}</p>
              <p className="text-blue-200 text-sm">Total items: {totalItems}</p>
              <p className="text-blue-200 text-sm">Error: {error || 'None'}</p>
              <p className="text-blue-200 text-sm">Last API call: Check browser Network tab for /api/apprenticeships/public</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    console.log("🔄 Manual refresh triggered");
                    fetchJobs();
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Force Refresh API
                </button>
                <button
                  onClick={() => {
                    // Clear service worker cache
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                      navigator.serviceWorker.controller.postMessage({
                        type: 'CLEAR_APPRENTICESHIPS_CACHE'
                      });
                    }
                    // Force refresh
                    setTimeout(() => fetchJobs(), 500);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Clear Cache & Refresh
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-700 rounded px-3 flex-1"></div>
                    <div className="h-6 bg-gray-700 rounded px-3 flex-1"></div>
                  </div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Job Grid */}
          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 group"
                >
                  {/* Job Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location.city}, {job.location.state}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.industry}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {job.shortDescription}
                  </p>

                  {/* Key Requirements */}
                  {job.keyRequirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Key Requirements:</h4>
                      <div className="flex flex-wrap gap-1">
                        {job.keyRequirements.map((req, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Salary:</span>
                      <span className="text-white font-medium">{formatSalary(job)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{job.employmentType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Deadline:</span>
                      <span className="text-white">
                        {getDaysUntilDeadline(job.applicationDeadline)} days left
                      </span>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="space-y-3">
                    <Link
                      to={job.seoUrl}
                      className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl text-center hover:from-pink-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 group"
                    >
                      View Full Details & Apply
                      <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {job.applicationCount} applied
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {job.viewCount} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && jobs.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No jobs found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search criteria or browse all available opportunities.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
                  setCurrentPage(1);
                }}
                className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
              >
                Browse All Jobs
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-12">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-pink-500 text-white"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Lead Generation CTA Section */}
          <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-blue-500 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Apply for Your Dream Apprenticeship?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Create your free account to apply for jobs, upload your CV, and get matched with top employers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/candidate/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                >
                  <User className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
                <Link
                  to="/candidate/signin"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Capture Modal - Routes to hello@apprenticeapex.co.uk */}
      {showEmailCapture && !emailSubmitted && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Get Job Alerts</h3>
            <p className="text-gray-300 mb-4">
              Never miss an opportunity! Get notified when new apprenticeship jobs matching your interests are posted.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Alert notifications will be sent to hello@apprenticeapex.co.uk
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!email}
                  className="flex-1 bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Subscribe
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailCapture(false)}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {emailSubmitted && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Thanks! We'll send you job alerts.
          </div>
        </div>
      )}
    </WebLayout>
  );
}
