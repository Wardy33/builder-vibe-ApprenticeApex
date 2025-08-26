import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Clock, 
  RefreshCw,
  AlertCircle,
  Database,
  User,
  ArrowRight
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
  const [lastApiCall, setLastApiCall] = useState<string>("");
  const [apiDataSource, setApiDataSource] = useState<string>("");
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  // Search filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  // Available filter options from API
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const clearAllCaches = async () => {
    console.log("🧹 EMERGENCY CACHE CLEAR - Starting comprehensive cache clearing...");
    
    // Clear service worker caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_ALL_CACHES'
      });
      console.log("🧹 Service worker cache clear message sent");
    }

    // Clear all browser caches
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log("🧹 Found caches:", cacheNames);
        
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log("🧹 Deleted cache:", cacheName);
        }
      } catch (error) {
        console.error("🧹 Error clearing caches:", error);
      }
    }

    // Clear local storage
    try {
      localStorage.clear();
      console.log("🧹 Local storage cleared");
    } catch (error) {
      console.error("🧹 Error clearing local storage:", error);
    }

    // Clear session storage
    try {
      sessionStorage.clear();
      console.log("🧹 Session storage cleared");
    } catch (error) {
      console.error("🧹 Error clearing session storage:", error);
    }

    console.log("🧹 EMERGENCY CACHE CLEAR - Complete!");
  };

  const fetchJobsFromAPI = async () => {
    console.log("🚀 STARTING FRESH API CALL - NO CACHED DATA ALLOWED");
    
    try {
      setLoading(true);
      setError(null);
      
      const timestamp = new Date().toISOString();
      setLastApiCall(timestamp);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        _cache_bust: Date.now().toString(), // Force cache busting
        _refresh: refreshCount.toString()
      });

      if (searchTerm && searchTerm !== "") {
        params.set("search", searchTerm);
      }
      if (selectedCategory && selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      if (selectedLocation && selectedLocation !== "all") {
        params.set("location", selectedLocation);
      }

      const apiUrl = `/api/apprenticeships/public?${params.toString()}`;
      console.log("📡 API URL:", apiUrl);
      console.log("📡 API Call Timestamp:", timestamp);

      // Make the API call with aggressive no-cache headers
      const response = await fetch(apiUrl, {
        method: 'GET',
        cache: 'no-store', // Never use cache
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-None-Match': '', // Prevent ETag caching
          'If-Modified-Since': '', // Prevent Last-Modified caching
        }
      });

      console.log("📡 Response Status:", response.status);
      console.log("📡 Response Headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const responseData: ApiResponse = await response.json();
      console.log("📊 FULL API RESPONSE:", JSON.stringify(responseData, null, 2));

      if (responseData.success) {
        const jobsFromAPI = responseData.data.jobs || [];
        const totalFromAPI = responseData.data.pagination?.totalItems || 0;
        const categoriesFromAPI = responseData.data.filters?.categories || [];
        const locationsFromAPI = responseData.data.filters?.locations || [];

        console.log("✅ SUCCESS - Jobs received from API:", jobsFromAPI.length);
        console.log("✅ Total jobs in database:", totalFromAPI);
        console.log("✅ Categories available:", categoriesFromAPI);
        console.log("✅ Locations available:", locationsFromAPI);

        // Set all data from API
        setJobs(jobsFromAPI);
        setTotalJobs(totalFromAPI);
        setCategories(categoriesFromAPI);
        setLocations(locationsFromAPI);
        setApiDataSource("LIVE API - SUCCESS");
        setError(null);

      } else {
        console.error("❌ API returned success: false");
        console.error("❌ API message:", responseData.message);
        setError(`API Error: ${responseData.message || 'Unknown error'}`);
        setApiDataSource("LIVE API - ERROR");
        setJobs([]);
        setTotalJobs(0);
      }

    } catch (fetchError) {
      console.error("💥 FETCH ERROR:", fetchError);
      setError(`Network Error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      setApiDataSource("LIVE API - NETWORK ERROR");
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
      console.log("🏁 API call completed at:", new Date().toISOString());
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log("🔄 MANUAL REFRESH TRIGGERED");
    setRefreshCount(prev => prev + 1);
    await clearAllCaches();
    await fetchJobsFromAPI();
  };

  // Initial load - clear caches and fetch fresh data
  useEffect(() => {
    console.log("🚀 COMPONENT MOUNTED - EMERGENCY FRESH START");
    const initializeData = async () => {
      await clearAllCaches();
      await fetchJobsFromAPI();
    };
    initializeData();
  }, []); // Only run on mount

  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (selectedCategory !== "all") newParams.set("category", selectedCategory);
    if (selectedLocation !== "all") newParams.set("location", selectedLocation);
    if (currentPage > 1) newParams.set("page", currentPage.toString());
    setSearchParams(newParams);
  }, [searchTerm, selectedCategory, selectedLocation, currentPage, setSearchParams]);

  // Refetch when filters change (but not on initial mount)
  useEffect(() => {
    if (refreshCount > 0) { // Only fetch if not initial load
      fetchJobsFromAPI();
    }
  }, [searchTerm, selectedCategory, selectedLocation, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setRefreshCount(prev => prev + 1);
  };

  const formatSalary = (job: Job) => {
    const currency = job.salary.currency === "GBP" ? "£" : "$";
    return `${currency}${job.salary.min?.toLocaleString()} - ${currency}${job.salary.max?.toLocaleString()} ${job.salary.type}`;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const seoConfig = {
    title: `Search Apprenticeship Jobs${searchTerm ? ` - ${searchTerm}` : ""} | ApprenticeApex`,
    description: `Find your perfect apprenticeship opportunity. Browse ${totalJobs} available apprenticeship jobs across different industries and locations.`,
    keywords: "apprenticeship jobs, apprentice opportunities, career training, vocational training, entry level jobs",
    canonical: "/search-jobs"
  };

  return (
    <WebLayout>
      <SEOHead {...seoConfig} />
      
      <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
        <div className="container mx-auto px-4 py-8">
          
          {/* EMERGENCY DEBUG INFO - ALWAYS VISIBLE */}
          <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-6 mb-8">
            <h2 className="text-green-300 font-bold text-xl mb-4 flex items-center gap-2">
              <Database className="h-6 w-6" />
              LIVE API DATA STATUS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-200"><strong>Data Source:</strong> {apiDataSource}</p>
                <p className="text-green-200"><strong>Jobs Loaded:</strong> {jobs.length}</p>
                <p className="text-green-200"><strong>Total Jobs in Database:</strong> {totalJobs}</p>
                <p className="text-green-200"><strong>Loading:</strong> {loading ? "YES" : "NO"}</p>
              </div>
              <div>
                <p className="text-green-200"><strong>Last API Call:</strong> {lastApiCall}</p>
                <p className="text-green-200"><strong>Refresh Count:</strong> {refreshCount}</p>
                <p className="text-green-200"><strong>Error:</strong> {error || "NONE"}</p>
                <p className="text-green-200"><strong>Page Load Time:</strong> {new Date().toISOString()}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? "Refreshing..." : "Force Fresh API Call"}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Hard Page Reload
              </button>
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              Find Your Perfect Apprenticeship
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {loading ? "Loading live jobs from database..." : `Discover ${totalJobs} live apprenticeship opportunities from our database.`}
            </p>
            <p className="text-lg text-green-400 mt-2 font-semibold">
              ✅ Data from: Live API - No mock data - Fresh from database
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
            <form onSubmit={handleSearch} className="space-y-4">
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

              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500"
                >
                  <option value="all">All Industries</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500"
                >
                  <option value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <h3 className="text-red-300 font-bold text-lg">API Error</h3>
              </div>
              <p className="text-red-200 mb-4">{error}</p>
              <button
                onClick={handleManualRefresh}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry API Call
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <RefreshCw className="h-16 w-16 text-pink-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-2xl font-bold text-white mb-2">Loading Live Data from Database</h3>
              <p className="text-gray-400">Fetching fresh apprenticeship jobs from our API...</p>
              <p className="text-green-400 mt-2">✅ No cached data - Direct from database</p>
            </div>
          )}

          {/* Jobs Grid */}
          {!loading && jobs.length > 0 && (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Showing {jobs.length} of {totalJobs} Live Apprenticeship Jobs
                </h2>
                <p className="text-green-400 font-semibold">
                  ✅ Data fetched from live API at {lastApiCall}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location.city}, {job.location.state}
                        </div>
                      </div>
                      <p className="text-xs text-green-400 mb-2">
                        ✅ Live data from API - Job ID: {job._id}
                      </p>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {job.shortDescription || job.description?.substring(0, 150) + "..."}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Industry:</span>
                        <span className="text-white">{job.industry}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Salary:</span>
                        <span className="text-white font-medium">{formatSalary(job)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Deadline:</span>
                        <span className="text-white">
                          {getDaysUntilDeadline(job.applicationDeadline)} days left
                        </span>
                      </div>
                    </div>

                    <Link
                      to={job.seoUrl || `/apprenticeships/${job._id}`}
                      className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl text-center hover:from-pink-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 group"
                    >
                      View Full Details & Apply
                      <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* No Results */}
          {!loading && jobs.length === 0 && !error && (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-white mb-2">No Jobs Found in Database</h3>
              <p className="text-gray-400 mb-4">
                The API returned 0 jobs for your search criteria.
              </p>
              <p className="text-green-400 mb-6">
                ✅ Data confirmed from live API - {totalJobs} total jobs in database
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
                  setCurrentPage(1);
                  setRefreshCount(prev => prev + 1);
                }}
                className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
              >
                Show All Jobs
              </button>
            </div>
          )}

          {/* Lead Generation CTA */}
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
    </WebLayout>
  );
}
