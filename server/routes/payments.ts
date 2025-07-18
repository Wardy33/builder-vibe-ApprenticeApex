import express from "express";
import { body, validationResult } from "express-validator";
import {
  authenticateToken,
  AuthenticatedRequest,
  requireCompanyRole,
} from "../middleware/auth";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
import { Subscription, Payment, Invoice } from "../models/Payment";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    name: "Basic",
    price: 2900, // £29.00 in pence
    currency: "gbp",
    interval: "month",
    features: {
      maxJobListings: 5,
      maxApplications: 100,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
    },
  },
  premium: {
    name: "Premium",
    price: 7900, // £79.00 in pence
    currency: "gbp",
    interval: "month",
    features: {
      maxJobListings: 25,
      maxApplications: 500,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: false,
      apiAccess: false,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 19900, // £199.00 in pence
    currency: "gbp",
    interval: "month",
    features: {
      maxJobListings: -1, // unlimited
      maxApplications: -1, // unlimited
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
    },
  },
};

// Get available subscription plans
router.get(
  "/plans",
  asyncHandler(async (req, res) => {
    res.json({
      plans: SUBSCRIPTION_PLANS,
    });
  }),
);

// Get current subscription
router.get(
  "/subscription",
  authenticateToken,
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;

    // Mock subscription for demo
    const mockSubscription = {
      _id: "sub_" + userId,
      userId,
      plan: "basic",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      features: SUBSCRIPTION_PLANS.basic.features,
      stripeCustomerId: "cus_mock_" + userId,
      stripeSubscriptionId: "sub_mock_" + userId,
    };

    res.json({
      subscription: mockSubscription,
    });
  }),
);

// Create subscription
router.post(
  "/subscribe",
  authenticateToken,
  requireCompanyRole,
  [
    body("plan").isIn(["basic", "premium", "enterprise"]),
    body("paymentMethodId").notEmpty().withMessage("Payment method required"),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { userId } = req.user!;
    const { plan, paymentMethodId } = req.body;

    // In a real app, this would integrate with Stripe
    // For demo purposes, we'll create a mock subscription

    const planConfig =
      SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    const subscriptionId = "sub_" + uuidv4();
    const customerId = "cus_" + uuidv4();

    const mockSubscription = {
      _id: subscriptionId,
      userId,
      plan,
      status: "active",
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      features: planConfig.features,
      billingHistory: [],
    };

    // Create initial payment record
    const payment = {
      _id: "pay_" + uuidv4(),
      userId,
      subscriptionId,
      amount: planConfig.price,
      currency: planConfig.currency,
      status: "succeeded",
      type: "subscription",
      description: `${planConfig.name} plan subscription`,
      metadata: {
        plan,
        billingPeriod: "monthly",
      },
    };

    res.json({
      subscription: mockSubscription,
      payment,
      message: "Subscription created successfully",
    });
  }),
);

// Update subscription
router.put(
  "/subscription",
  authenticateToken,
  requireCompanyRole,
  [body("plan").isIn(["basic", "premium", "enterprise"])],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { userId } = req.user!;
    const { plan } = req.body;

    // In a real app, update Stripe subscription
    const planConfig =
      SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];

    res.json({
      message: "Subscription updated successfully",
      plan: planConfig,
    });
  }),
);

// Cancel subscription
router.delete(
  "/subscription",
  authenticateToken,
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;

    // In a real app, cancel Stripe subscription
    res.json({
      message: "Subscription cancelled successfully",
    });
  }),
);

// Get payment history
router.get(
  "/payments",
  authenticateToken,
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Mock payment history
    const mockPayments = [
      {
        _id: "pay_1",
        amount: 2900,
        currency: "gbp",
        status: "succeeded",
        type: "subscription",
        description: "Basic plan subscription",
        createdAt: new Date("2024-01-15"),
      },
      {
        _id: "pay_2",
        amount: 2900,
        currency: "gbp",
        status: "succeeded",
        type: "subscription",
        description: "Basic plan subscription",
        createdAt: new Date("2023-12-15"),
      },
    ];

    res.json({
      payments: mockPayments,
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: mockPayments.length,
        itemsPerPage: limit,
      },
    });
  }),
);

// Get invoices
router.get(
  "/invoices",
  authenticateToken,
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;

    // Mock invoices
    const mockInvoices = [
      {
        _id: "inv_1",
        invoiceNumber: "INV-2024-001",
        amount: 2900,
        currency: "gbp",
        status: "paid",
        dueDate: new Date("2024-01-15"),
        paidAt: new Date("2024-01-15"),
        lineItems: [
          {
            description: "Basic Plan - Monthly",
            quantity: 1,
            unitAmount: 2900,
            totalAmount: 2900,
          },
        ],
      },
    ];

    res.json({
      invoices: mockInvoices,
    });
  }),
);

// Download invoice
router.get(
  "/invoices/:invoiceId/download",
  authenticateToken,
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { invoiceId } = req.params;
    const { userId } = req.user!;

    // In a real app, generate PDF invoice
    res.json({
      downloadUrl: `https://api.apprenticeapex.com/invoices/${invoiceId}/pdf`,
      message: "Invoice download link generated",
    });
  }),
);

// Create payment intent for one-time payments
router.post(
  "/payment-intent",
  authenticateToken,
  requireCompanyRole,
  [
    body("amount").isInt({ min: 1 }),
    body("currency").isIn(["gbp", "usd", "eur"]),
    body("description").notEmpty(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { userId } = req.user!;
    const { amount, currency, description } = req.body;

    // In a real app, create Stripe payment intent
    const paymentIntent = {
      id: "pi_" + uuidv4(),
      clientSecret: "pi_" + uuidv4() + "_secret",
      amount,
      currency,
      status: "requires_payment_method",
    };

    res.json({
      paymentIntent,
    });
  }),
);

// Webhook endpoint for Stripe (in production)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];

    // In a real app, verify webhook signature and process events
    const event = {
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_mock",
          amount: 2900,
          currency: "gbp",
        },
      },
    };

    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("Payment succeeded:", event.data.object);
        break;
      case "invoice.payment_succeeded":
        console.log("Invoice payment succeeded:", event.data.object);
        break;
      case "customer.subscription.updated":
        console.log("Subscription updated:", event.data.object);
        break;
      case "customer.subscription.deleted":
        console.log("Subscription cancelled:", event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }),
);

// Get payment method
router.get(
  "/payment-methods",
  authenticateToken,
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.user!;

    // Mock payment methods
    const mockPaymentMethods = [
      {
        id: "pm_mock_1",
        type: "card",
        card: {
          brand: "visa",
          last4: "4242",
          exp_month: 12,
          exp_year: 2025,
        },
        billing_details: {
          name: "John Doe",
        },
      },
    ];

    res.json({
      paymentMethods: mockPaymentMethods,
    });
  }),
);

// Add payment method
router.post(
  "/payment-methods",
  authenticateToken,
  requireCompanyRole,
  [body("paymentMethodId").notEmpty()],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError("Validation failed", 400);
    }

    const { userId } = req.user!;
    const { paymentMethodId } = req.body;

    // In a real app, attach payment method to customer
    res.json({
      message: "Payment method added successfully",
      paymentMethodId,
    });
  }),
);

// Delete payment method
router.delete(
  "/payment-methods/:paymentMethodId",
  authenticateToken,
  requireCompanyRole,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { paymentMethodId } = req.params;
    const { userId } = req.user!;

    // In a real app, detach payment method
    res.json({
      message: "Payment method removed successfully",
    });
  }),
);

export default router;
