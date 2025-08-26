import express from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { sendSuccess, sendError } from "../utils/apiResponse";
import NeonPaymentService from "../services/neonPaymentService";
import { authMiddleware } from "../middleware/auth";
import { createRateLimit } from "../middleware/security";

const router = express.Router();

// Apply authentication to all payment routes
router.use(authMiddleware);

// Apply rate limiting to prevent payment abuse
const paymentRateLimit = createRateLimit(15 * 60 * 1000, 20); // 20 requests per 15 minutes

// Get Stripe publishable key
router.get("/config", asyncHandler(async (req, res) => {
  try {
    const publishableKey = await NeonPaymentService.getInstance().getPublishableKey();
    
    sendSuccess(res, {
      publishableKey,
      currency: 'GBP',
      country: 'GB'
    });

  } catch (error: any) {
    console.error('❌ Failed to get payment config:', error);
    sendError(res, 'Failed to get payment configuration', 500, 'PAYMENT_CONFIG_ERROR');
  }
}));

// Get job posting payment packages
router.get("/packages", asyncHandler(async (req, res) => {
  try {
    const packages = await NeonPaymentService.getInstance().getJobPaymentPackages();
    
    sendSuccess(res, {
      packages: packages.map(pkg => ({
        id: pkg.id,
        type: pkg.package_type,
        name: pkg.package_name,
        description: pkg.description,
        price: pkg.price,
        currency: pkg.currency,
        duration_days: pkg.duration_days,
        features: pkg.features,
        popular: pkg.package_type === 'featured', // Mark featured as popular
        savings: pkg.package_type === 'premium' ? 'Most Popular' : null
      }))
    });

  } catch (error: any) {
    console.error('❌ Failed to get payment packages:', error);
    sendError(res, 'Failed to get payment packages', 500, 'PACKAGES_ERROR');
  }
}));

// Create payment intent for job posting
router.post("/job-posting", [paymentRateLimit], asyncHandler(async (req, res) => {
  try {
    const { jobId, packageType } = req.body;
    const userId = req.user.id;

    // Validate request
    if (!jobId || !packageType) {
      return sendError(res, 'jobId and packageType are required', 400, 'MISSING_REQUIRED_FIELDS');
    }

    if (!['basic', 'featured', 'premium', 'urgent'].includes(packageType)) {
      return sendError(res, 'Invalid package type', 400, 'INVALID_PACKAGE_TYPE');
    }

    // Verify user owns the job (security check)
    const paymentService = NeonPaymentService.getInstance();
    const jobs = await paymentService.sql('SELECT company_id FROM jobs WHERE id = $1', [jobId]);
    
    if (!jobs.length) {
      return sendError(res, 'Job not found', 404, 'JOB_NOT_FOUND');
    }

    if (jobs[0].company_id !== userId) {
      return sendError(res, 'You can only pay for your own job postings', 403, 'UNAUTHORIZED_JOB_ACCESS');
    }

    // Check if job already has a pending or successful payment
    const existingPayments = await paymentService.sql(
      'SELECT status FROM payments WHERE job_id = $1 AND status IN ($2, $3)',
      [jobId, 'pending', 'succeeded']
    );

    if (existingPayments.length > 0) {
      return sendError(res, 'Job already has a payment in progress or completed', 400, 'PAYMENT_ALREADY_EXISTS');
    }

    // Create payment intent
    const paymentResult = await paymentService.createJobPostingPayment({
      userId,
      jobId: parseInt(jobId),
      packageType,
      metadata: {
        source: 'job_posting_ui',
        userAgent: req.headers['user-agent'] || 'unknown'
      }
    });

    sendSuccess(res, {
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntent.id,
      amount: paymentResult.paymentIntent.amount,
      currency: paymentResult.paymentIntent.currency,
      packageInfo: {
        type: packageType,
        name: NeonPaymentService.JOB_PACKAGES[packageType].name,
        price: NeonPaymentService.JOB_PACKAGES[packageType].price,
        features: NeonPaymentService.JOB_PACKAGES[packageType].features
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to create job posting payment:', error);
    sendError(res, 'Failed to create payment', 500, 'PAYMENT_CREATION_ERROR');
  }
}));

// Create subscription
router.post("/subscription", [paymentRateLimit], asyncHandler(async (req, res) => {
  try {
    const { planType, paymentMethodId } = req.body;
    const userId = req.user.id;

    // Validate request
    if (!planType) {
      return sendError(res, 'planType is required', 400, 'MISSING_PLAN_TYPE');
    }

    if (!['professional', 'business', 'enterprise'].includes(planType)) {
      return sendError(res, 'Invalid plan type', 400, 'INVALID_PLAN_TYPE');
    }

    // Check if user already has an active subscription
    const paymentService = NeonPaymentService.getInstance();
    const existingSubscriptions = await paymentService.sql(
      'SELECT status FROM subscriptions WHERE user_id = $1 AND status IN ($2, $3)',
      [userId, 'active', 'trialing']
    );

    if (existingSubscriptions.length > 0) {
      return sendError(res, 'You already have an active subscription', 400, 'SUBSCRIPTION_ALREADY_EXISTS');
    }

    // Create subscription
    const subscriptionResult = await paymentService.createSubscription(
      userId,
      planType,
      paymentMethodId
    );

    const subscription = subscriptionResult.subscription;
    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent;

    sendSuccess(res, {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      status: subscription.status,
      planInfo: {
        type: planType,
        name: NeonPaymentService.SUBSCRIPTION_PLANS[planType].name,
        price: NeonPaymentService.SUBSCRIPTION_PLANS[planType].price,
        features: NeonPaymentService.SUBSCRIPTION_PLANS[planType].features
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to create subscription:', error);
    sendError(res, 'Failed to create subscription', 500, 'SUBSCRIPTION_CREATION_ERROR');
  }
}));

// Get payment history
router.get("/history", asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const payments = await NeonPaymentService.getInstance().getPaymentHistory(userId);

    sendSuccess(res, {
      payments: payments.map(payment => ({
        id: payment.id,
        type: payment.payment_type,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        created_at: payment.created_at,
        processed_at: payment.processed_at,
        metadata: payment.metadata
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: payments.length
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get payment history:', error);
    sendError(res, 'Failed to get payment history', 500, 'PAYMENT_HISTORY_ERROR');
  }
}));

// Get current subscription status
router.get("/subscription", asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    const paymentService = NeonPaymentService.getInstance();
    const subscriptions = await paymentService.sql(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND status IN ('active', 'trialing', 'past_due') 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (subscriptions.length === 0) {
      return sendSuccess(res, {
        hasSubscription: false,
        subscription: null
      });
    }

    const subscription = subscriptions[0];

    sendSuccess(res, {
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        planType: subscription.plan_type,
        planName: subscription.plan_name,
        status: subscription.status,
        amount: subscription.amount,
        currency: subscription.currency,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        nextBillingDate: subscription.next_billing_date,
        features: subscription.features,
        usage: subscription.usage
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get subscription:', error);
    sendError(res, 'Failed to get subscription', 500, 'SUBSCRIPTION_ERROR');
  }
}));

// Cancel subscription
router.post("/subscription/cancel", [paymentRateLimit], asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    const paymentService = NeonPaymentService.getInstance();
    const subscriptions = await paymentService.sql(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (subscriptions.length === 0) {
      return sendError(res, 'No active subscription found', 404, 'NO_ACTIVE_SUBSCRIPTION');
    }

    const stripeSubscriptionId = subscriptions[0].stripe_subscription_id;
    
    // Cancel the subscription in Stripe (will trigger webhook)
    const stripe = paymentService.stripe;
    const canceledSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    sendSuccess(res, {
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
        currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000)
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to cancel subscription:', error);
    sendError(res, 'Failed to cancel subscription', 500, 'SUBSCRIPTION_CANCEL_ERROR');
  }
}));

// Verify payment status (for frontend polling)
router.get("/status/:paymentIntentId", asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.user.id;

    const paymentService = NeonPaymentService.getInstance();
    const payments = await paymentService.sql(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = $1 AND user_id = $2',
      [paymentIntentId, userId]
    );

    if (payments.length === 0) {
      return sendError(res, 'Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    const payment = payments[0];

    sendSuccess(res, {
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      processedAt: payment.processed_at,
      failedAt: payment.failed_at,
      jobActivated: payment.payment_type === 'job_posting' && payment.status === 'succeeded'
    });

  } catch (error: any) {
    console.error('❌ Failed to get payment status:', error);
    sendError(res, 'Failed to get payment status', 500, 'PAYMENT_STATUS_ERROR');
  }
}));

export default router;
