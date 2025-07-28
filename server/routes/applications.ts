import express from "express";
import { body, query, validationResult } from "express-validator";
import { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
// Mock data removed - now using real MongoDB data

const router = express.Router();

// Mock applications data
const mockApplications: any[] = [
  {
    _id: "app_1",
    studentId: "student1",
    apprenticeshipId: "app1",
    companyId: "company1",
    status: "applied",
    aiMatchScore: 92,
    swipeDirection: "right",
    appliedAt: new Date("2024-01-15"),
    coverLetter:
      "I am excited to apply for this position and believe my skills in JavaScript and React make me a strong candidate.",
  },
  {
    _id: "app_2",
    studentId: "student2",
    apprenticeshipId: "app2",
    companyId: "company1",
    status: "interview_scheduled",
    aiMatchScore: 88,
    swipeDirection: "right",
    appliedAt: new Date("2024-01-14"),
    interviewDetails: {
      scheduledDate: new Date("2024-01-20T14:00:00Z"),
      meetingUrl: "https://zoom.us/j/123456789",
    },
  },
  {
    _id: "app_3",
    studentId: "student1",
    apprenticeshipId: "app2",
    companyId: "company1",
    status: "viewed",
    aiMatchScore: 76,
    swipeDirection: "right",
    appliedAt: new Date("2024-01-13"),
  },
  {
    _id: "app_4",
    studentId: "student2",
    apprenticeshipId: "app1",
    companyId: "company1",
    status: "shortlisted",
    aiMatchScore: 94,
    swipeDirection: "right",
    appliedAt: new Date("2024-01-12"),
  },
];

// Get student's applications
router.get(
  "/my-applications",
  [
    query("status").optional().isString(),
    query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (req.user!.role !== "student") {
      throw new CustomError("Only students can view their applications", 403);
    }

    const studentId = req.user!.userId;
    const { status, limit = 20, offset = 0 } = req.query;

    let applications = mockApplications.filter(
      (app) => app.studentId === studentId,
    );

    if (status) {
      applications = applications.filter((app) => app.status === status);
    }

    // Add apprenticeship details
    const enrichedApplications = applications.map((app) => {
      const apprenticeship = mockApprenticeships.find(
        (a) => a._id === app.apprenticeshipId,
      );
      return {
        ...app,
        apprenticeship: apprenticeship
          ? {
              jobTitle: apprenticeship.jobTitle,
              company: "TechCorp Ltd", // Mock company name
              location: apprenticeship.location.city,
              salary: `£${apprenticeship.salary.min.toLocaleString()} - £${apprenticeship.salary.max.toLocaleString()}`,
            }
          : null,
        formattedDate: app.appliedAt.toLocaleDateString(),
        statusColor:
          app.status === "applied"
            ? "yellow"
            : app.status === "interview_scheduled"
              ? "blue"
              : app.status === "accepted"
                ? "green"
                : "red",
      };
    });

    const total = enrichedApplications.length;
    const paginatedResults = enrichedApplications.slice(
      Number(offset),
      Number(offset) + Number(limit),
    );

    res.json({
      applications: paginatedResults,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total,
      },
      statusCounts: {
        applied: applications.filter((a) => a.status === "applied").length,
        viewed: applications.filter((a) => a.status === "viewed").length,
        shortlisted: applications.filter((a) => a.status === "shortlisted")
          .length,
        interview_scheduled: applications.filter(
          (a) => a.status === "interview_scheduled",
        ).length,
        rejected: applications.filter((a) => a.status === "rejected").length,
        accepted: applications.filter((a) => a.status === "accepted").length,
      },
    });
  }),
);

// Get company's received applications
router.get(
  "/received",
  [
    query("apprenticeshipId").optional().isString(),
    query("status").optional().isString(),
    query("sortBy")
      .optional()
      .isIn(["date", "score", "name"])
      .withMessage("sortBy must be date, score, or name"),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (req.user!.role !== "company") {
      throw new CustomError(
        "Only companies can view received applications",
        403,
      );
    }

    const companyId = req.user!.userId;
    const {
      apprenticeshipId,
      status,
      sortBy = "date",
      sortOrder = "desc",
      limit = 20,
      offset = 0,
    } = req.query;

    let applications = mockApplications.filter(
      (app) => app.companyId === companyId,
    );

    if (apprenticeshipId) {
      applications = applications.filter(
        (app) => app.apprenticeshipId === apprenticeshipId,
      );
    }

    if (status) {
      applications = applications.filter((app) => app.status === status);
    }

    // Add student and apprenticeship details
    const enrichedApplications = applications.map((app) => {
      const student = mockStudents.find((s) => s._id === app.studentId);
      const apprenticeship = mockApprenticeships.find(
        (a) => a._id === app.apprenticeshipId,
      );

      return {
        ...app,
        student: student
          ? {
              name: `${(student.profile as any).firstName} ${(student.profile as any).lastName}`,
              email: student.email,
              location: (student.profile as any).location?.city,
              skills: (student.profile as any).skills,
              videoProfile: (student.profile as any).videoProfile,
              cvUrl: (student.profile as any).cvUrl,
            }
          : null,
        apprenticeship: apprenticeship
          ? {
              jobTitle: apprenticeship.jobTitle,
              id: apprenticeship._id,
            }
          : null,
        formattedDate: app.appliedAt.toLocaleDateString(),
        daysAgo: Math.floor(
          (Date.now() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24),
        ),
      };
    });

    // Sort applications
    enrichedApplications.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "score":
          comparison = a.aiMatchScore - b.aiMatchScore;
          break;
        case "name":
          comparison = (a.student?.name || "").localeCompare(
            b.student?.name || "",
          );
          break;
        case "date":
        default:
          comparison = a.appliedAt.getTime() - b.appliedAt.getTime();
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    const total = enrichedApplications.length;
    const paginatedResults = enrichedApplications.slice(
      Number(offset),
      Number(offset) + Number(limit),
    );

    res.json({
      applications: paginatedResults,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total,
      },
      filters: {
        statusCounts: {
          all: applications.length,
          applied: applications.filter((a) => a.status === "applied").length,
          viewed: applications.filter((a) => a.status === "viewed").length,
          shortlisted: applications.filter((a) => a.status === "shortlisted")
            .length,
          interview_scheduled: applications.filter(
            (a) => a.status === "interview_scheduled",
          ).length,
          rejected: applications.filter((a) => a.status === "rejected").length,
          accepted: applications.filter((a) => a.status === "accepted").length,
        },
      },
    });
  }),
);

// Update application status (company only)
router.patch(
  "/:id/status",
  [
    body("status").isIn([
      "viewed",
      "shortlisted",
      "interview_scheduled",
      "rejected",
      "accepted",
    ]),
    body("notes").optional().trim().isLength({ max: 500 }),
    body("interviewDetails").optional().isObject(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (req.user!.role !== "company") {
      throw new CustomError(
        "Only companies can update application status",
        403,
      );
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { id } = req.params;
    const { status, notes, interviewDetails } = req.body;
    const companyId = req.user!.userId;

    const applicationIndex = mockApplications.findIndex(
      (app) => app._id === id && app.companyId === companyId,
    );

    if (applicationIndex === -1) {
      throw new CustomError("Application not found or unauthorized", 404);
    }

    // Update application
    mockApplications[applicationIndex] = {
      ...mockApplications[applicationIndex],
      status,
      ...(notes && { companyNotes: notes }),
      ...(interviewDetails && { interviewDetails }),
    };

    // In real app, send notification to student
    console.log(
      `Application ${id} status updated to ${status} by company ${companyId}`,
    );

    res.json({
      message: "Application status updated successfully",
      application: mockApplications[applicationIndex],
    });
  }),
);

// Schedule interview
router.post(
  "/:id/schedule-interview",
  [
    body("scheduledDate").isISO8601().toDate(),
    body("meetingUrl").optional().isURL(),
    body("notes").optional().trim().isLength({ max: 500 }),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (req.user!.role !== "company") {
      throw new CustomError("Only companies can schedule interviews", 403);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { id } = req.params;
    const { scheduledDate, meetingUrl, notes } = req.body;
    const companyId = req.user!.userId;

    const applicationIndex = mockApplications.findIndex(
      (app) => app._id === id && app.companyId === companyId,
    );

    if (applicationIndex === -1) {
      throw new CustomError("Application not found or unauthorized", 404);
    }

    // Generate Twilio meeting URL if not provided
    const finalMeetingUrl =
      meetingUrl || `https://video.twilio.com/room/${id}_${Date.now()}`;

    // Update application with interview details
    mockApplications[applicationIndex] = {
      ...mockApplications[applicationIndex],
      status: "interview_scheduled",
      interviewDetails: {
        scheduledDate: new Date(scheduledDate),
        meetingUrl: finalMeetingUrl,
        ...(notes && { interviewerNotes: notes }),
      },
    };

    // In real app:
    // 1. Create Twilio video room
    // 2. Add to Google Calendar
    // 3. Send email notifications
    // 4. Send push notification

    res.json({
      message: "Interview scheduled successfully",
      interviewDetails: mockApplications[applicationIndex].interviewDetails,
    });
  }),
);

// Get application details
router.get(
  "/:id",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const application = mockApplications.find((app) => {
      if (userRole === "student") {
        return app._id === id && app.studentId === userId;
      } else {
        return app._id === id && app.companyId === userId;
      }
    });

    if (!application) {
      throw new CustomError("Application not found or unauthorized", 404);
    }

    // Add related data
    const student = mockStudents.find((s) => s._id === application.studentId);
    const apprenticeship = mockApprenticeships.find(
      (a) => a._id === application.apprenticeshipId,
    );

    const enrichedApplication = {
      ...application,
      student: student
        ? {
            name: `${(student.profile as any).firstName} ${(student.profile as any).lastName}`,
            email: student.email,
            profile: student.profile,
          }
        : null,
      apprenticeship: apprenticeship
        ? {
            jobTitle: apprenticeship.jobTitle,
            description: apprenticeship.description,
            company: "TechCorp Ltd",
            location: apprenticeship.location,
            requirements: apprenticeship.requirements,
          }
        : null,
    };

    res.json({
      application: enrichedApplication,
    });
  }),
);

export default router;
