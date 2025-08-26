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

    // In a production environment, you would:
    // 1. Save the subscription to database
    // 2. Send a notification email to hello@apprenticeapex.co.uk
    // 3. Send a confirmation email to the subscriber
    // 4. Add to email marketing platform (e.g., Mailchimp, SendGrid)

    // For now, we'll log the subscription and send success response
    console.log(`✅ New subscription: ${email} for ${type} alerts`);
    console.log(`📬 Notification should be sent to: ${notificationEmail || 'hello@apprenticeapex.co.uk'}`);

    // TODO: Implement actual email sending service
    // await sendNotificationEmail({
    //   to: notificationEmail || 'hello@apprenticeapex.co.uk',
    //   subject: 'New Job Alerts Subscription',
    //   body: `New subscription received: ${email} signed up for ${type} alerts from ${source}`
    // });

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
