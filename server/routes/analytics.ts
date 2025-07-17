import express from "express";
import { query, validationResult } from "express-validator";
import { AuthenticatedRequest, requireCompanyRole } from "../middleware/auth";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
import { mockApprenticeships } from "../index";

const router = express.Router();

// Get company dashboard analytics
router.get(
  "/dashboard",
  requireCompanyRole,
  [
    query("period")
      .optional()
      .isIn(["7d", "30d", "90d", "1y"])
      .withMessage("Period must be 7d, 30d, 90d, or 1y"),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const companyId = req.user!.userId;
    const { period = "30d" } = req.query;

    // Mock analytics data - in real app, this would query the database
    const analytics = {
      overview: {
        activeListings: 3,
        totalApplications: 127,
        newApplicationsThisWeek: 23,
        interviewsScheduled: 8,
        hiredCandidates: 2,
        averageTimeToHire: 21, // days
        conversionRate: 37, // percentage
        responseRate: 82, // percentage
      },
      applications: {
        weekly: [
          { week: "Week 1", applications: 18, swipes: 45 },
          { week: "Week 2", applications: 22, swipes: 58 },
          { week: "Week 3", applications: 31, swipes: 72 },
          { week: "Week 4", applications: 28, swipes: 63 },
          { week: "Week 5", applications: 28, swipes: 70 },
        ],
        byStatus: [
          { status: "Applied", count: 67, percentage: 52.8 },
          { status: "Viewed", count: 28, percentage: 22.0 },
          { status: "Shortlisted", count: 18, percentage: 14.2 },
          { status: "Interview", count: 8, percentage: 6.3 },
          { status: "Hired", count: 6, percentage: 4.7 },
        ],
        byIndustry: [
          { industry: "Technology", count: 67, percentage: 52.8 },
          { industry: "Engineering", count: 34, percentage: 26.8 },
          { industry: "Marketing", count: 26, percentage: 20.4 },
        ],
      },
      listings: {
        performance: mockApprenticeships
          .filter((app) => app.companyId === companyId)
          .map((app) => ({
            id: app._id,
            jobTitle: app.jobTitle,
            applications: app.applicationCount,
            views: app.viewCount,
            swipes: app.swipeStats.totalSwipes,
            conversionRate: Math.round(
              (app.swipeStats.rightSwipes /
                Math.max(app.swipeStats.totalSwipes, 1)) *
                100,
            ),
            applicationRate: Math.round(
              (app.applicationCount / Math.max(app.viewCount, 1)) * 100,
            ),
            createdAt: new Date().toISOString(),
          })),
        topPerforming: {
          mostApplications: "Software Developer Apprentice",
          highestConversion: "Digital Marketing Apprentice",
          mostViewed: "Software Developer Apprentice",
        },
      },
      demographics: {
        ageGroups: [
          { range: "16-18", count: 45, percentage: 35.4 },
          { range: "19-21", count: 52, percentage: 40.9 },
          { range: "22-24", count: 25, percentage: 19.7 },
          { range: "25+", count: 5, percentage: 3.9 },
        ],
        locations: [
          { city: "London", count: 38, percentage: 29.9 },
          { city: "Manchester", count: 24, percentage: 18.9 },
          { city: "Birmingham", count: 19, percentage: 15.0 },
          { city: "Leeds", count: 15, percentage: 11.8 },
          { city: "Other", count: 31, percentage: 24.4 },
        ],
        topSkills: [
          { skill: "JavaScript", count: 42 },
          { skill: "Communication", count: 38 },
          { skill: "Problem Solving", count: 35 },
          { skill: "Teamwork", count: 33 },
          { skill: "Python", count: 28 },
        ],
      },
      trends: {
        applicationTrend: generateTrendData(period as string, "applications"),
        swipeTrend: generateTrendData(period as string, "swipes"),
        conversionTrend: generateTrendData(period as string, "conversion"),
      },
      benchmarks: {
        industryAverage: {
          conversionRate: 28,
          averageApplications: 34,
          timeToHire: 28,
        },
        yourPerformance: {
          conversionRate: 37,
          averageApplications: 42,
          timeToHire: 21,
        },
        percentileRank: 78, // Your company is better than 78% of similar companies
      },
    };

    res.json({
      analytics,
      period,
      generatedAt: new Date().toISOString(),
      companyId,
    });
  }),
);

// Get detailed listing analytics
router.get(
  "/listings/:listingId",
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { listingId } = req.params;
    const companyId = req.user!.userId;

    const listing = mockApprenticeships.find(
      (app) => app._id === listingId && app.companyId === companyId,
    );

    if (!listing) {
      throw new CustomError("Listing not found or unauthorized", 404);
    }

    const detailedAnalytics = {
      listing: {
        id: listing._id,
        jobTitle: listing.jobTitle,
        industry: listing.industry,
        createdAt: new Date().toISOString(),
        status: "active",
      },
      performance: {
        views: listing.viewCount,
        swipes: listing.swipeStats.totalSwipes,
        rightSwipes: listing.swipeStats.rightSwipes,
        leftSwipes: listing.swipeStats.leftSwipes,
        applications: listing.applicationCount,
        conversionRate: Math.round(
          (listing.swipeStats.rightSwipes /
            Math.max(listing.swipeStats.totalSwipes, 1)) *
            100,
        ),
        applicationRate: Math.round(
          (listing.applicationCount / Math.max(listing.viewCount, 1)) * 100,
        ),
      },
      dailyMetrics: generateDailyMetrics(),
      candidateInsights: {
        topSkills: [
          { skill: "JavaScript", applicants: 18 },
          { skill: "React", applicants: 14 },
          { skill: "Problem Solving", applicants: 22 },
          { skill: "Communication", applicants: 20 },
        ],
        educationLevels: [
          { level: "A-Levels", count: 15 },
          { level: "University Degree", count: 8 },
          { level: "Vocational Training", count: 12 },
          { level: "Other", count: 7 },
        ],
        averageMatchScore: 84,
        scoreDistribution: [
          { range: "90-100", count: 8 },
          { range: "80-89", count: 15 },
          { range: "70-79", count: 12 },
          { range: "60-69", count: 7 },
        ],
      },
      suggestions: [
        "Consider adding more specific skill requirements to attract better matches",
        "Your listing performs 23% better than industry average",
        "Peak viewing times are 2-4 PM and 7-9 PM",
      ],
    };

    res.json({
      analytics: detailedAnalytics,
      generatedAt: new Date().toISOString(),
    });
  }),
);

// Export analytics data
router.get(
  "/export",
  requireCompanyRole,
  [
    query("format").optional().isIn(["csv", "pdf", "json"]),
    query("period").optional().isIn(["7d", "30d", "90d", "1y"]),
    query("includeDetails").optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const {
      format = "csv",
      period = "30d",
      includeDetails = "false",
    } = req.query;
    const companyId = req.user!.userId;

    // Mock export data
    const exportData = {
      companyId,
      period,
      exportedAt: new Date().toISOString(),
      summary: {
        totalApplications: 127,
        activeListings: 3,
        conversionRate: 37,
        hiredCandidates: 2,
      },
      listings: mockApprenticeships
        .filter((app) => app.companyId === companyId)
        .map((app) => ({
          id: app._id,
          jobTitle: app.jobTitle,
          applications: app.applicationCount,
          swipes: app.swipeStats.totalSwipes,
          conversionRate: Math.round(
            (app.swipeStats.rightSwipes /
              Math.max(app.swipeStats.totalSwipes, 1)) *
              100,
          ),
        })),
      ...(includeDetails === "true" && {
        detailedApplications: [
          {
            applicationId: "app_1",
            candidateName: "Sarah Johnson",
            listingTitle: "Software Developer",
            appliedDate: "2024-01-15",
            status: "applied",
            matchScore: 92,
          },
        ],
      }),
    };

    if (format === "json") {
      res.json(exportData);
    } else {
      // For CSV/PDF, in real app would generate actual files
      res.json({
        message: `${String(format).toUpperCase()} export ready`,
        downloadUrl: `https://mock-exports.com/${companyId}_analytics_${Date.now()}.${format}`,
        data: exportData,
      });
    }
  }),
);

// Helper functions for generating mock data
function generateTrendData(period: string, metric: string) {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    let value;
    switch (metric) {
      case "applications":
        value = Math.floor(Math.random() * 10) + 2;
        break;
      case "swipes":
        value = Math.floor(Math.random() * 25) + 10;
        break;
      case "conversion":
        value = Math.floor(Math.random() * 20) + 25;
        break;
      default:
        value = Math.floor(Math.random() * 50);
    }

    data.push({
      date: date.toISOString().split("T")[0],
      value,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    });
  }

  return data;
}

function generateDailyMetrics() {
  const metrics = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    metrics.push({
      date: date.toISOString().split("T")[0],
      views: Math.floor(Math.random() * 15) + 5,
      swipes: Math.floor(Math.random() * 12) + 3,
      applications: Math.floor(Math.random() * 5) + 1,
    });
  }
  return metrics;
}

export default router;
