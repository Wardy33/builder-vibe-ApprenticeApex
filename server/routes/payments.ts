import express from "express";
import { body, validationResult } from "express-validator";
import {
  authenticateToken,
  AuthenticatedRequest,
  requireCompanyRole,
} from "../middleware/auth";
import { asyncHandler, CustomError } from "../middleware/errorHandler";
import { sendSuccess, sendError, sendValidationError } from "../utils/apiResponse";
import { validateDatabaseInput } from "../middleware/database";
import StripeService from "../services/stripeService";
import { User } from "../schemas/User";
import { Payment, Subscription } from "../schemas/Payment";
import { Application } from "../schemas/Application";

const router = express.Router();

// Get Stripe publishable key for frontend
router.get("/config", asyncHandler(async (req, res) => {
  try {
    const publishableKey = await stripeService.getPublishableKey();
    
    sendSuccess(res, {
      publishableKey,
      subscriptionPlans: StripeService.SUBSCRIPTION_PLANS,
      trialPlacementFee: StripeService.TRIAL_PLACEMENT_FEE,
      successFeePercentage: StripeService.SUCCESS_FEE_PERCENTAGE
    });

  } catch (error) {
    console.error('❌ Failed to get Stripe config:', error);
    sendError(res, 'Failed to get payment configuration', 500, 'STRIPE_CONFIG_ERROR');
  }
}));

// Create trial payment intent (£399 one-time payments)
router.post("/create-trial-intent", [
  authenticateToken,
  requireCompanyRole,
  body("metadata").optional().isObject()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  console.log('💳 Creating trial payment intent...');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  try {
    const userId = req.user!.userId;
    const { metadata = {} } = req.body;

    // Verify user is a company
    const user = await User.findById(userId);
    if (!user || user.role !== 'company') {
      return sendError(res, 'Only companies can purchase trial placements', 403, 'COMPANY_ONLY');
    }

    // Check if user already has an active trial payment
    const existingTrialPayment = await Payment.findOne({
      userId,
      'metadata.trialPlacement': true,
      status: { $in: ['succeeded', 'pending'] }
    });

    if (existingTrialPayment) {
      return sendError(res, 'Trial placement already purchased or pending', 400, 'TRIAL_EXISTS');
    }

    const result = await stripeService.createTrialPaymentIntent(userId, {
      companyName: user.profile.companyName || 'Unknown Company',
      ...metadata
    });

    console.log(`✅ Trial payment intent created for company: ${user.profile.companyName}`);

    sendSuccess(res, {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntent.id,
      amount: result.paymentIntent.amount,
      currency: result.paymentIntent.currency,
      description: result.paymentIntent.description,
      paymentRecord: {
        id: result.paymentRecord._id,
        status: result.paymentRecord.status,
        createdAt: result.paymentRecord.createdAt
      }
    }, 201);

  } catch (error: any) {
    console.error('❌ Failed to create trial payment intent:', error);
    sendError(res, error.message || 'Failed to create trial payment intent', 500, 'TRIAL_PAYMENT_ERROR');
  }
}));

// Create subscription (£49, £99, £149 monthly plans)
router.post("/create-subscription", [
  authenticateToken,
  requireCompanyRole,
  body("planType").isIn(['professional', 'business', 'enterprise']),
  body("paymentMethodId").optional().isString()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  console.log('📋 Creating subscription...');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  try {
    const userId = req.user!.userId;
    const { planType, paymentMethodId } = req.body;

    // Verify user is a company
    const user = await User.findById(userId);
    if (!user || user.role !== 'company') {
      return sendError(res, 'Only companies can purchase subscriptions', 403, 'COMPANY_ONLY');
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing'] }
    });

    if (existingSubscription) {
      return sendError(res, 'User already has an active subscription', 400, 'SUBSCRIPTION_EXISTS');
    }

    const result = await stripeService.createSubscription(userId, planType, paymentMethodId);

    console.log(`✅ Subscription created for company: ${user.profile.companyName} (${planType})`);

    sendSuccess(res, {
      subscription: {
        id: result.subscription.id,
        status: result.subscription.status,
        current_period_end: result.subscription.current_period_end,
        latest_invoice: result.subscription.latest_invoice
      },
      subscriptionRecord: {
        id: result.subscriptionRecord._id,
        plan: result.subscriptionRecord.plan,
        status: result.subscriptionRecord.status,
        features: result.subscriptionRecord.features,
        nextBillingDate: result.subscriptionRecord.nextBillingDate
      },
      clientSecret: result.subscription.latest_invoice?.payment_intent?.client_secret
    }, 201);

  } catch (error: any) {
    console.error('❌ Failed to create subscription:', error);
    sendError(res, error.message || 'Failed to create subscription', 500, 'SUBSCRIPTION_ERROR');
  }
}));

// Calculate success fee (12% of first-year salary)
router.post("/calculate-success-fee", [
  authenticateToken,
  requireCompanyRole,
  body("applicationId").isMongoId()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  console.log('🧮 Calculating success fee...');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  try {
    const { applicationId } = req.body;
    const companyUserId = req.user!.userId;

    // Verify the application belongs to the company
    const application = await Application.findById(applicationId);
    if (!application) {
      return sendError(res, 'Application not found', 404, 'APPLICATION_NOT_FOUND');
    }

    if (application.companyId !== companyUserId) {
      return sendError(res, 'Application does not belong to this company', 403, 'ACCESS_DENIED');
    }

    // Check if application is in a state where success fee can be calculated
    if (!['offer_accepted', 'hired'].includes(application.status)) {
      return sendError(res, 'Success fee can only be calculated for hired candidates', 400, 'INVALID_APPLICATION_STATUS');
    }

    const successFeeCalculation = await stripeService.calculateSuccessFee(applicationId);

    sendSuccess(res, {
      calculation: successFeeCalculation,
      formattedAmount: `£${(successFeeCalculation.calculatedFee / 100).toFixed(2)}`,
      formattedBaseAmount: `£${(successFeeCalculation.baseAmount / 100).toFixed(2)}`,
      feePercentageDisplay: `${(successFeeCalculation.feePercentage * 100).toFixed(1)}%`
    });

  } catch (error: any) {
    console.error('❌ Failed to calculate success fee:', error);
    sendError(res, error.message || 'Failed to calculate success fee', 500, 'SUCCESS_FEE_CALCULATION_ERROR');
  }
}));

// Create success fee payment intent
router.post("/create-success-fee-intent", [
  authenticateToken,
  requireCompanyRole,
  body("applicationId").isMongoId(),
  body("metadata").optional().isObject()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  console.log('💰 Creating success fee payment intent...');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  try {
    const { applicationId, metadata = {} } = req.body;
    const companyUserId = req.user!.userId;

    // Verify the application belongs to the company
    const application = await Application.findById(applicationId);
    if (!application) {
      return sendError(res, 'Application not found', 404, 'APPLICATION_NOT_FOUND');
    }

    if (application.companyId !== companyUserId) {
      return sendError(res, 'Application does not belong to this company', 403, 'ACCESS_DENIED');
    }

    // Check if success fee has already been paid
    const existingSuccessFeePayment = await Payment.findOne({
      userId: companyUserId,
      'metadata.applicationId': applicationId,
      'metadata.successFee': true,
      status: { $in: ['succeeded', 'pending'] }
    });

    if (existingSuccessFeePayment) {
      return sendError(res, 'Success fee already paid or pending for this application', 400, 'SUCCESS_FEE_EXISTS');
    }

    const result = await stripeService.createSuccessFeePaymentIntent(
      applicationId,
      companyUserId,
      metadata
    );

    console.log(`✅ Success fee payment intent created for application: ${applicationId}`);

    sendSuccess(res, {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntent.id,
      amount: result.paymentIntent.amount,
      currency: result.paymentIntent.currency,
      description: result.paymentIntent.description,
      calculation: result.successFeeCalculation,
      paymentRecord: {
        id: result.paymentRecord._id,
        status: result.paymentRecord.status,
        createdAt: result.paymentRecord.createdAt
      }
    }, 201);

  } catch (error: any) {
    console.error('❌ Failed to create success fee payment intent:', error);
    sendError(res, error.message || 'Failed to create success fee payment intent', 500, 'SUCCESS_FEE_PAYMENT_ERROR');
  }
}));

// Get customer payment history
router.get("/customer/:userId", [
  authenticateToken
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user!.userId;

    // Users can only view their own payment history (or admin can view any)
    if (userId !== requestingUserId && req.user!.role !== 'admin') {
      return sendError(res, 'Access denied', 403, 'ACCESS_DENIED');
    }

    const paymentHistory = await stripeService.getCustomerPaymentHistory(userId);

    // Get subscription information
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing', 'past_due'] }
    });

    sendSuccess(res, {
      paymentHistory,
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        nextBillingDate: subscription.nextBillingDate,
        features: subscription.features
      } : null,
      summary: {
        totalPayments: paymentHistory.length,
        totalAmount: paymentHistory.reduce((sum, payment) => 
          payment.status === 'succeeded' ? sum + payment.amount : sum, 0
        ),
        lastPaymentDate: paymentHistory.length > 0 ? paymentHistory[0].createdAt : null
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get payment history:', error);
    sendError(res, error.message || 'Failed to get payment history', 500, 'PAYMENT_HISTORY_ERROR');
  }
}));

// Update subscription
router.put("/update-subscription", [
  authenticateToken,
  requireCompanyRole,
  body("planType").isIn(['professional', 'business', 'enterprise'])
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  console.log('🔄 Updating subscription...');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  try {
    const userId = req.user!.userId;
    const { planType } = req.body;

    const result = await stripeService.updateSubscription(userId, planType);

    console.log(`✅ Subscription updated for user: ${userId} to ${planType}`);

    sendSuccess(res, {
      subscription: {
        id: result.subscription.id,
        status: result.subscription.status,
        current_period_end: result.subscription.current_period_end
      },
      subscriptionRecord: {
        id: result.subscriptionRecord._id,
        plan: result.subscriptionRecord.plan,
        planName: result.subscriptionRecord.planName,
        amount: result.subscriptionRecord.amount,
        features: result.subscriptionRecord.features
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to update subscription:', error);
    sendError(res, error.message || 'Failed to update subscription', 500, 'SUBSCRIPTION_UPDATE_ERROR');
  }
}));

// Cancel subscription
router.post("/cancel-subscription", [
  authenticateToken,
  requireCompanyRole,
  body("cancelAtPeriodEnd").optional().isBoolean(),
  body("cancellationReason").optional().isString().isLength({ max: 500 })
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  console.log('❌ Canceling subscription...');
  
  try {
    const userId = req.user!.userId;
    const { cancelAtPeriodEnd = true, cancellationReason } = req.body;

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      return sendError(res, 'No active subscription found', 404, 'NO_SUBSCRIPTION');
    }

    // Cancel in Stripe
    const stripeSubscription = await stripeService['stripe'].subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: cancelAtPeriodEnd,
        ...(cancellationReason && {
          metadata: { cancellationReason }
        })
      }
    );

    // Update database
    subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
    subscription.cancellationReason = cancellationReason;
    if (!cancelAtPeriodEnd) {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
    }
    await subscription.save();

    console.log(`✅ Subscription ${cancelAtPeriodEnd ? 'scheduled for cancellation' : 'cancelled'}: ${subscription.stripeSubscriptionId}`);

    sendSuccess(res, {
      message: cancelAtPeriodEnd ? 
        'Subscription will be cancelled at the end of the current period' : 
        'Subscription cancelled immediately',
      subscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        current_period_end: stripeSubscription.current_period_end
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to cancel subscription:', error);
    sendError(res, error.message || 'Failed to cancel subscription', 500, 'SUBSCRIPTION_CANCEL_ERROR');
  }
}));

// Legacy subscription endpoints (for backwards compatibility)
router.get("/subscription", authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing', 'past_due', 'cancelled'] }
    });

    if (!subscription) {
      return sendSuccess(res, { subscription: null });
    }

    sendSuccess(res, {
      subscription: {
        id: subscription._id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        features: subscription.features,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get subscription:', error);
    sendError(res, 'Failed to get subscription', 500, 'SUBSCRIPTION_GET_ERROR');
  }
}));

// Legacy payment endpoints
router.post("/create-payment-intent", [
  authenticateToken,
  body("amount").isInt({ min: 50 }), // Minimum £0.50
  body("currency").isIn(['gbp', 'usd', 'eur']),
  body("description").isString().isLength({ min: 1, max: 500 })
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, "Validation failed", errors.array());
  }

  try {
    const userId = req.user!.userId;
    const { amount, currency, description, metadata = {} } = req.body;

    const customer = await stripeService.getOrCreateCustomer(userId);

    const paymentIntent = await stripeService['stripe'].paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      description,
      metadata: {
        userId,
        ...metadata
      }
    });

    // Create payment record
    const paymentRecord = new Payment({
      userId,
      amount,
      currency: currency.toUpperCase(),
      description,
      type: 'one_time',
      paymentMethodType: 'card',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,
      metadata
    });

    await paymentRecord.save();

    sendSuccess(res, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }, 201);

  } catch (error: any) {
    console.error('❌ Failed to create payment intent:', error);
    sendError(res, 'Failed to create payment intent', 500, 'PAYMENT_INTENT_ERROR');
  }
}));

export default router;
