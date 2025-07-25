import express from "express";
import { body, query, validationResult } from "express-validator";
import { AuthenticatedRequest, requireCompanyRole, authenticateToken } from "../middleware/auth";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
import { mockApprenticeships } from "../index";
import { database } from "../config/database";

const router = express.Router();

// Get apprenticeships for student swiping
router.get(
  "/discover",
  [
    query("lat").optional().isFloat({ min: -90, max: 90 }),
    query("lng").optional().isFloat({ min: -180, max: 180 }),
    query("maxDistance").optional().isInt({ min: 1, max: 200 }),
    query("industries").optional().isString(),
    query("salaryMin").optional().isInt({ min: 0 }),
    query("salaryMax").optional().isInt({ min: 0 }),
    query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
  ],
  // Conditionally apply auth middleware based on database connection
  (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    if (!database.isConnected() && (!process.env.MONGODB_URI || process.env.MONGODB_URI === '')) {
      // Mock authentication for development mode
      req.user = {
        userId: 'mock-student-id',
        role: 'student',
        email: 'mock@student.com'
      };
      next();
    } else {
      authenticateToken(req, res, next);
    }
  },
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Invalid query parameters", 400);
    }

    if (req.user?.role !== "student") {
      throw new CustomError("Only students can discover apprenticeships", 403);
    }

    const {
      lat,
      lng,
      maxDistance = 25,
      industries,
      salaryMin,
      salaryMax,
      limit = 10,
      offset = 0,
    } = req.query;

    let filteredApprenticeships = [...mockApprenticeships];

    // Filter by industry
    if (industries) {
      const industryList = (industries as string).split(",");
      filteredApprenticeships = filteredApprenticeships.filter((app) =>
        industryList.includes(app.industry),
      );
    }

    // Filter by salary range
    if (salaryMin) {
      filteredApprenticeships = filteredApprenticeships.filter(
        (app) => app.salary.max >= parseInt(salaryMin as string),
      );
    }

    if (salaryMax) {
      filteredApprenticeships = filteredApprenticeships.filter(
        (app) => app.salary.min <= parseInt(salaryMax as string),
      );
    }

    // Simulate distance filtering (in real app, use MongoDB geospatial queries)
    if (lat && lng) {
      // Mock distance calculation - in real app use $geoNear
      filteredApprenticeships = filteredApprenticeships.map((app) => ({
        ...app,
        distance: Math.random() * 50, // Mock distance
      }));

      filteredApprenticeships = filteredApprenticeships.filter(
        (app: any) => app.distance <= maxDistance,
      );
    }

    // Apply pagination
    const total = filteredApprenticeships.length;
    const paginatedResults = filteredApprenticeships.slice(
      Number(offset),
      Number(offset) + Number(limit),
    );

    // Add mock image URLs and additional data for frontend
    const enrichedResults = paginatedResults.map((app) => ({
      ...app,
      thumbnailImage:
        app.industry === "Technology"
          ? "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=600&fit=crop"
          : app.industry === "Marketing"
            ? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop"
            : "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=600&fit=crop",
      company: {
        name: "TechCorp Ltd",
        logo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop",
      },
      formattedSalary: `£${app.salary.min.toLocaleString()} - £${app.salary.max.toLocaleString()}`,
      formattedDuration: `${app.duration.years} year${app.duration.years > 1 ? "s" : ""}`,
      conversionRate: Math.round(
        (app.swipeStats.rightSwipes / app.swipeStats.totalSwipes) * 100,
      ),
    }));

    res.json({
      apprenticeships: enrichedResults,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total,
      },
      filters: {
        industries: ["Technology", "Marketing", "Engineering", "Healthcare"],
        maxDistance: Number(maxDistance),
        salaryRange: { min: salaryMin, max: salaryMax },
      },
    });
  }),
);

// Record swipe action
router.post(
  "/:id/swipe",
  [
    body("direction").isIn(["left", "right"]),
    body("studentLocation").optional().isObject(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Invalid swipe data", 400);
    }

    if (req.user?.role !== "student") {
      throw new CustomError("Only students can swipe", 403);
    }

    const { id } = req.params;
    const { direction, studentLocation } = req.body;

    const apprenticeship = mockApprenticeships.find((app) => app._id === id);
    if (!apprenticeship) {
      throw new CustomError("Apprenticeship not found", 404);
    }

    // Update swipe statistics
    apprenticeship.swipeStats.totalSwipes += 1;
    if (direction === "right") {
      apprenticeship.swipeStats.rightSwipes += 1;
    } else {
      apprenticeship.swipeStats.leftSwipes += 1;
    }

    // If right swipe, create application
    if (direction === "right") {
      // In real app, check if application already exists
      const aiMatchScore = Math.floor(Math.random() * 30) + 70; // Mock 70-100% match

      console.log(
        `Created application for student ${req.user.userId} -> ${id}`,
      );

      res.json({
        message: "Application created successfully",
        match: true,
        matchScore: aiMatchScore,
        apprenticeship: {
          id: apprenticeship._id,
          jobTitle: apprenticeship.jobTitle,
          company: "TechCorp Ltd",
        },
      });
    } else {
      res.json({
        message: "Swipe recorded",
        match: false,
      });
    }
  }),
);

// Get company's apprenticeship listings
router.get(
  "/my-listings",
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const companyId = req.user!.userId;

    const listings = mockApprenticeships
      .filter((app) => app.companyId === companyId)
      .map((app) => ({
        ...app,
        conversionRate: Math.round(
          (app.swipeStats.rightSwipes /
            Math.max(app.swipeStats.totalSwipes, 1)) *
            100,
        ),
        formattedSalary: `£${app.salary.min.toLocaleString()} - £${app.salary.max.toLocaleString()}`,
      }));

    res.json({
      listings,
      total: listings.length,
    });
  }),
);

// Create new apprenticeship listing
router.post(
  "/",
  requireCompanyRole,
  [
    body("jobTitle").trim().isLength({ min: 1, max: 100 }),
    body("description").trim().isLength({ min: 50, max: 2000 }),
    body("industry").isIn([
      "Technology",
      "Healthcare",
      "Finance",
      "Engineering",
      "Marketing",
      "Education",
      "Manufacturing",
      "Retail",
      "Construction",
      "Hospitality",
      "Other",
    ]),
    body("location.city").trim().isLength({ min: 1 }),
    body("location.address").trim().isLength({ min: 1 }),
    body("requirements").isArray({ min: 1 }),
    body("duration.years").isInt({ min: 0, max: 5 }),
    body("duration.months").isInt({ min: 0, max: 11 }),
    body("salary.min").isInt({ min: 0 }),
    body("salary.max").isInt({ min: 0 }),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const companyId = req.user!.userId;
    const newListing = {
      _id: `app_${Date.now()}`,
      companyId,
      ...req.body,
      applicationCount: 0,
      swipeStats: { totalSwipes: 0, rightSwipes: 0, leftSwipes: 0 },
      isActive: true,
      createdAt: new Date(),
    };

    // In real app, save to database
    mockApprenticeships.push(newListing);

    res.status(201).json({
      message: "Apprenticeship listing created successfully",
      listing: newListing,
    });
  }),
);

// Update apprenticeship listing
router.put(
  "/:id",
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const companyId = req.user!.userId;

    const listingIndex = mockApprenticeships.findIndex(
      (app) => app._id === id && app.companyId === companyId,
    );

    if (listingIndex === -1) {
      throw new CustomError("Listing not found or unauthorized", 404);
    }

    // Update listing
    mockApprenticeships[listingIndex] = {
      ...mockApprenticeships[listingIndex],
      ...req.body,
      updatedAt: new Date(),
    };

    res.json({
      message: "Listing updated successfully",
      listing: mockApprenticeships[listingIndex],
    });
  }),
);

// Delete apprenticeship listing
router.delete(
  "/:id",
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const companyId = req.user!.userId;

    const listingIndex = mockApprenticeships.findIndex(
      (app) => app._id === id && app.companyId === companyId,
    );

    if (listingIndex === -1) {
      throw new CustomError("Listing not found or unauthorized", 404);
    }

    // In real app, soft delete by setting isActive: false
    mockApprenticeships.splice(listingIndex, 1);

    res.json({
      message: "Listing deleted successfully",
    });
  }),
);

export default router;
