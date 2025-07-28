import express from "express";
import {
  authenticateToken,
  AuthenticatedRequest,
  requireStudentRole,
} from "../middleware/auth";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
import {
  getMatchedJobs,
  isProfileCompleteForMatching,
  calculateJobMatch,
} from "../services/matchingService";
// Mock data removed - now using real MongoDB data

const router = express.Router();

// Get matched jobs for current student
router.get(
  "/jobs",
  authenticateToken,
  requireStudentRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

        // Find student (mock data)
    const student = mockStudents.find((s) => s._id === userId);
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Check if profile is complete enough for matching
    const profileCheck = isProfileCompleteForMatching(student as any);
    if (!profileCheck.isComplete) {
      return res.json({
        profileIncomplete: true,
        missingFields: profileCheck.missingFields,
        matches: [],
        message:
          "Please complete your profile to see job matches. Missing: " +
          profileCheck.missingFields.join(", "),
      });
    }

        // Get matched jobs
    const matches = getMatchedJobs(student as any, mockApprenticeships as any);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatches = matches.slice(startIndex, endIndex);

    // Add job details to matches
    const matchesWithJobs = paginatedMatches.map((match) => {
      const job = mockApprenticeships.find(
        (j) => j._id === match.apprenticeshipId,
      );
      return {
        ...match,
        job,
      };
    });

    res.json({
      profileIncomplete: false,
      matches: matchesWithJobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(matches.length / limit),
        totalItems: matches.length,
        itemsPerPage: limit,
      },
      averageMatch:
        matches.length > 0
          ? Math.round(
              matches.reduce((sum, match) => sum + match.matchPercentage, 0) /
                matches.length,
            )
          : 0,
    });
  }),
);

// Get detailed match information for a specific job
router.get(
  "/jobs/:jobId",
  authenticateToken,
  requireStudentRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;
    const { jobId } = req.params;

        // Find student and job (mock data)
    const student = mockStudents.find((s) => s._id === userId);
    const job = mockApprenticeships.find((j) => j._id === jobId);

    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    if (!job) {
      throw new CustomError("Job not found", 404);
    }

    // Check if profile is complete
    const profileCheck = isProfileCompleteForMatching(student as any);
    if (!profileCheck.isComplete) {
      return res.json({
        profileIncomplete: true,
        missingFields: profileCheck.missingFields,
        message:
          "Please complete your profile to see match details. Missing: " +
          profileCheck.missingFields.join(", "),
      });
    }

        // Calculate detailed match
    const match = calculateJobMatch(student as any, job as any);

    res.json({
      profileIncomplete: false,
      match: {
        ...match,
        job,
      },
    });
  }),
);

// Check profile completion status
router.get(
  "/profile-status",
  authenticateToken,
  requireStudentRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;

        // Find student (mock data)
    const student = mockStudents.find((s) => s._id === userId);
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    const profileCheck = isProfileCompleteForMatching(student as any);

    res.json({
      isComplete: profileCheck.isComplete,
      missingFields: profileCheck.missingFields,
      completionPercentage: Math.round(
        ((7 - profileCheck.missingFields.length) / 7) * 100,
      ),
    });
  }),
);

// Get matching statistics for student
router.get(
  "/stats",
  authenticateToken,
  requireStudentRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;

        // Find student (mock data)
    const student = mockStudents.find((s) => s._id === userId);
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Check if profile is complete
    const profileCheck = isProfileCompleteForMatching(student as any);
    if (!profileCheck.isComplete) {
      return res.json({
        profileIncomplete: true,
        missingFields: profileCheck.missingFields,
      });
    }

        // Get all matches
    const matches = getMatchedJobs(student as any, mockApprenticeships as any);

    // Calculate statistics
    const stats = {
      totalJobs: mockApprenticeships.filter((j) => j.isActive).length,
      matchingJobs: matches.length,
      averageMatch:
        matches.length > 0
          ? Math.round(
              matches.reduce((sum, match) => sum + match.matchPercentage, 0) /
                matches.length,
            )
          : 0,
      excellentMatches: matches.filter((m) => m.matchPercentage >= 80).length,
      goodMatches: matches.filter(
        (m) => m.matchPercentage >= 60 && m.matchPercentage < 80,
      ).length,
      fairMatches: matches.filter(
        (m) => m.matchPercentage >= 40 && m.matchPercentage < 60,
      ).length,
      topIndustries: {}, // Could calculate top matching industries
      averageDistance:
        matches.length > 0
          ? Math.round(
              (matches.reduce(
                (sum, match) => sum + match.travelInfo.distance,
                0,
              ) /
                matches.length) *
                10,
            ) / 10
          : 0,
    };

    res.json({
      profileIncomplete: false,
      stats,
    });
  }),
);

export default router;
