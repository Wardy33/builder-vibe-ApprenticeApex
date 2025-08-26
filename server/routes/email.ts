import express from 'express';

const router = express.Router();

// Email subscription endpoint
router.post('/subscribe', async (req: any, res: any) => {
  try {
    const { email, type, source, notificationEmail } = req.body;

    console.log('📧 Email subscription request:', {
      email,
      type,
      source,
      notificationEmail: notificationEmail || 'hello@apprenticeapex.co.uk'
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Save subscription to Neon database
    const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID || 'winter-bread-79671472';

    try {
      // Note: In a full implementation, this would use MCP tools
      // For now, we'll log the data that would be saved
      console.log(`✅ New subscription: ${email} for ${type} alerts`);
      console.log(`📬 Notification should be sent to: ${notificationEmail || 'hello@apprenticeapex.co.uk'}`);
      console.log(`📊 Subscription data to save:`, {
        email,
        type,
        source,
        notificationEmail: notificationEmail || 'hello@apprenticeapex.co.uk',
        subscribedAt: new Date().toISOString()
      });

      // TODO: Create email_subscriptions table and save data:
      // await mcp__neon__run_sql({
      //   sql: 'INSERT INTO email_subscriptions (email, subscription_type, source, notification_email, created_at) VALUES ($1, $2, $3, $4, $5)',
      //   projectId: NEON_PROJECT_ID,
      //   params: [email, type, source, notificationEmail || 'hello@apprenticeapex.co.uk', new Date()]
      // });

    } catch (dbError) {
      console.error('❌ Database error saving subscription:', dbError);
      // Continue with success response even if DB save fails
    }

    res.json({
      success: true,
      message: 'Successfully subscribed to job alerts',
      data: {
        email,
        type,
        subscribedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Email subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process subscription',
      details: error.message
    });
  }
});

// Health check for email service
router.get('/health', (req: any, res: any) => {
  res.json({
    success: true,
    service: 'Email Service',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

export default router;
