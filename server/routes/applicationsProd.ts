import express from "express";
import { body, query, validationResult } from "express-validator";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
import { sendSuccess, sendError, sendValidationError } from "../utils/apiResponse";
import { validateDatabaseInput } from "../middleware/database";

// Import production schemas
import { Application, validateApplicationCreation } from "../schemas/Application";
import { Apprenticeship } from "../schemas/Apprenticeship";
import { User } from "../schemas/User";
import emailService from "../services/emailService";

const router = express.Router();

// Application creation validation
const applicationValidation = [
  body("apprenticeshipId").isMongoId().withMessage("Valid apprenticeship ID is required"),
  body("coverLetter").optional().isLength({ max: 2000 }).withMessage("Cover letter cannot exceed 2000 characters"),
  body("portfolioUrls").optional().isArray().withMessage("Portfolio URLs must be an array"),
  body("portfolioUrls.*").optional().isURL().withMessage("Invalid portfolio URL"),
  body("documents").optional().isArray().withMessage("Documents must be an array"),
];

// Status update validation  
const statusUpdateValidation = [
  body("status").isIn([
    'draft', 'submitted', 'under_review', 'shortlisted', 'interview_scheduled',
    'interview_completed', 'technical_assessment', 'background_check',
    'offer_pending', 'offer_made', 'offer_accepted', 'offer_declined',
    'hired', 'rejected', 'withdrawn'
  ]).withMessage("Invalid application status"),
  body("notes").optional().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),
  body("interviewDate").optional().isISO8601().withMessage("Invalid interview date"),
  body("interviewLocation").optional().isLength({ max: 200 }).withMessage("Interview location too long"),
];

// Submit Application
router.post("/submit", 
  authenticateToken,
  applicationValidation,
  validateDatabaseInput,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, "Validation failed", errors.array());
    }

    const { apprenticeshipId, coverLetter, portfolioUrls, documents, availabilityNotes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Authentication required", 401, 'UNAUTHORIZED');
    }

    try {
      // Verify the apprenticeship exists and is active
      const apprenticeship = await Apprenticeship.findById(apprenticeshipId);
      if (!apprenticeship) {
        return sendError(res, "Apprenticeship not found", 404, 'APPRENTICESHIP_NOT_FOUND');
      }

      if (apprenticeship.status !== 'active') {
        return sendError(res, "This apprenticeship is no longer accepting applications", 400, 'APPRENTICESHIP_INACTIVE');
      }

      // Check if user already applied to this apprenticeship
      const existingApplication = await Application.findOne({
        studentId: userId,
        apprenticeshipId: apprenticeshipId
      });

      if (existingApplication) {
        return sendError(res, "You have already applied to this apprenticeship", 400, 'DUPLICATE_APPLICATION');
      }

      // Get user information for matching
      const user = await User.findById(userId);
      if (!user) {
        return sendError(res, "User not found", 404, 'USER_NOT_FOUND');
      }

      // Create new application
      const applicationData = {
        studentId: userId,
        apprenticeshipId,
        companyId: apprenticeship.companyId,
        status: 'submitted' as const,
        personalStatement: coverLetter,
        portfolioUrls: portfolioUrls || [],
        documents: documents || [],
        submittedAt: new Date(),
        availabilityNotes,
        userLocation: user.profile?.location,
        preferredStartDate: user.profile?.availableFrom,
      };

      // Validate application data
      const validationResult = validateApplicationCreation(applicationData);
      if (!validationResult.success) {
        return sendValidationError(res, "Application validation failed", validationResult.errors);
      }

      const application = new Application(applicationData);
      
      // Calculate AI match score
      const matchScore = await application.calculateMatchScore();
      application.aiMatchScore = matchScore.overallScore;
      application.matchingData = matchScore;

      const savedApplication = await application.save();

      // Update apprenticeship application count
      await Apprenticeship.findByIdAndUpdate(apprenticeshipId, {
        $inc: { applicationCount: 1 }
      });

      // Send application confirmation email to student
      try {
        await emailService.sendApplicationSubmitted(user, savedApplication, apprenticeship);
        console.log(`📧 Application confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.warn('⚠️  Failed to send application confirmation email:', emailError);
      }

      // Notify employer of new application (if they have notifications enabled)
      try {
        const employer = await User.findById(apprenticeship.companyId);
        if (employer && employer.emailPreferences?.applicationNotifications !== false) {
          const emailTemplates = await import('../services/emailTemplates');
          const template = emailTemplates.default.getNotificationTemplate({
            user: employer,
            customData: {
              title: 'New Application Received',
              message: `You have received a new application for ${apprenticeship.title} from ${user.profile?.firstName || 'a candidate'}. The candidate has a ${matchScore.overallScore}% match score.`,
              actionUrl: `${process.env.FRONTEND_URL}/employer/applications/${savedApplication._id}`,
              actionText: 'Review Application'
            }
          });

          await emailService.sendEmail({
            to: employer.email,
            subject: template.subject,
            html: template.html,
            text: template.text
          });
          console.log(`📧 New application notification sent to employer ${employer.email}`);
        }
      } catch (emailError) {
        console.warn('⚠️  Failed to send employer notification email:', emailError);
      }

      console.log(`✅ Application submitted successfully: ${savedApplication.applicationId}`);

      sendSuccess(res, {
        application: {
          id: savedApplication._id,
          applicationId: savedApplication.applicationId,
          status: savedApplication.status,
          submittedAt: savedApplication.submittedAt,
          aiMatchScore: savedApplication.aiMatchScore,
          apprenticeship: {
            title: apprenticeship.title,
            companyName: apprenticeship.companyName,
            location: apprenticeship.location
          }
        }
      }, 201);

    } catch (error: any) {
      console.error('Application submission error:', error);
      
      if (error.name === "ValidationError") {
        return sendValidationError(res, "Application validation failed", error.errors);
      }
      return sendError(res, "Failed to submit application", 500, 'APPLICATION_ERROR');
    }
  })
);

// Update Application Status (for employers)
router.patch("/:applicationId/status",
  authenticateToken,
  statusUpdateValidation,
  validateDatabaseInput,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, "Validation failed", errors.array());
    }

    const { applicationId } = req.params;
    const { status, notes, interviewDate, interviewLocation, interviewType, rejectionReason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Authentication required", 401, 'UNAUTHORIZED');
    }

    try {
      const application = await Application.findById(applicationId)
        .populate('apprenticeshipId')
        .populate('studentId');

      if (!application) {
        return sendError(res, "Application not found", 404, 'APPLICATION_NOT_FOUND');
      }

      // Check if user has permission to update this application
      const apprenticeship = application.apprenticeshipId as any;
      if (apprenticeship.companyId.toString() !== userId && req.user?.role !== 'admin') {
        return sendError(res, "Not authorized to update this application", 403, 'FORBIDDEN');
      }

      // Update application status
      const updateData: any = {
        status,
        lastUpdated: new Date(),
        statusHistory: [
          ...application.statusHistory,
          {
            status,
            timestamp: new Date(),
            updatedBy: userId,
            notes
          }
        ]
      };

      // Handle interview scheduling
      if (status === 'interview_scheduled' && interviewDate) {
        updateData.interviewDetails = {
          scheduledDate: new Date(interviewDate),
          location: interviewLocation,
          type: interviewType || 'in_person',
          status: 'scheduled'
        };
      }

      // Handle rejection
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const updatedApplication = await Application.findByIdAndUpdate(
        applicationId,
        updateData,
        { new: true, runValidators: true }
      );

      // Send status update email to student
      try {
        const student = application.studentId as any;
        await emailService.sendApplicationStatusUpdate(student, updatedApplication, apprenticeship);
        console.log(`📧 Status update email sent to ${student.email}`);

        // Send interview reminder email if interview scheduled
        if (status === 'interview_scheduled' && interviewDate) {
          // Schedule reminder email for 24 hours before interview
          const reminderTime = new Date(interviewDate).getTime() - (24 * 60 * 60 * 1000);
          if (reminderTime > Date.now()) {
            setTimeout(async () => {
              try {
                const emailTemplates = await import('../services/emailTemplates');
                const template = emailTemplates.default.getInterviewReminderTemplate({
                  user: student,
                  apprenticeship,
                  interview: updatedApplication.interviewDetails,
                  application: updatedApplication
                });

                await emailService.sendEmail({
                  to: student.email,
                  subject: template.subject,
                  html: template.html,
                  text: template.text
                });
                console.log(`📧 Interview reminder email sent to ${student.email}`);
              } catch (reminderError) {
                console.warn('⚠️  Failed to send interview reminder email:', reminderError);
              }
            }, reminderTime - Date.now());
          }
        }
      } catch (emailError) {
        console.warn('⚠️  Failed to send status update email:', emailError);
      }

      console.log(`✅ Application status updated: ${applicationId} -> ${status}`);

      sendSuccess(res, {
        application: {
          id: updatedApplication!._id,
          status: updatedApplication!.status,
          lastUpdated: updatedApplication!.lastUpdated,
          interviewDetails: updatedApplication!.interviewDetails
        }
      });

    } catch (error: any) {
      console.error('Application status update error:', error);
      
      if (error.name === "ValidationError") {
        return sendValidationError(res, "Update validation failed", error.errors);
      }
      return sendError(res, "Failed to update application status", 500, 'UPDATE_ERROR');
    }
  })
);

// Get User Applications
router.get("/my-applications",
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return sendError(res, "Authentication required", 401, 'UNAUTHORIZED');
    }

    try {
      const applications = await Application.find({ studentId: userId })
        .populate('apprenticeshipId', 'title companyName location salaryMin salaryMax')
        .sort({ submittedAt: -1 })
        .limit(50);

      sendSuccess(res, {
        applications: applications.map(app => ({
          id: app._id,
          applicationId: app.applicationId,
          status: app.status,
          submittedAt: app.submittedAt,
          aiMatchScore: app.aiMatchScore,
          lastUpdated: app.lastUpdated,
          apprenticeship: app.apprenticeshipId,
          interviewDetails: app.interviewDetails
        }))
      });

    } catch (error) {
      console.error('Error fetching user applications:', error);
      return sendError(res, "Failed to fetch applications", 500, 'FETCH_ERROR');
    }
  })
);

// Get Application Details
router.get("/:applicationId",
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { applicationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Authentication required", 401, 'UNAUTHORIZED');
    }

    try {
      const application = await Application.findById(applicationId)
        .populate('apprenticeshipId')
        .populate('studentId', 'profile email');

      if (!application) {
        return sendError(res, "Application not found", 404, 'APPLICATION_NOT_FOUND');
      }

      // Check if user has permission to view this application
      const apprenticeship = application.apprenticeshipId as any;
      const isOwner = application.studentId._id.toString() === userId;
      const isEmployer = apprenticeship.companyId.toString() === userId;
      const isAdmin = req.user?.role === 'admin';

      if (!isOwner && !isEmployer && !isAdmin) {
        return sendError(res, "Not authorized to view this application", 403, 'FORBIDDEN');
      }

      sendSuccess(res, {
        application: {
          id: application._id,
          applicationId: application.applicationId,
          status: application.status,
          submittedAt: application.submittedAt,
          lastUpdated: application.lastUpdated,
          aiMatchScore: application.aiMatchScore,
          personalStatement: application.personalStatement,
          portfolioUrls: application.portfolioUrls,
          documents: application.documents,
          statusHistory: application.statusHistory,
          interviewDetails: application.interviewDetails,
          apprenticeship: application.apprenticeshipId,
          student: isEmployer || isAdmin ? application.studentId : undefined,
          matchingData: application.matchingData
        }
      });

    } catch (error) {
      console.error('Error fetching application details:', error);
      return sendError(res, "Failed to fetch application details", 500, 'FETCH_ERROR');
    }
  })
);

export default router;
