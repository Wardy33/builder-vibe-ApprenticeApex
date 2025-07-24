import { getEnvConfig } from '../config/env.js';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailTemplateData {
  user: any;
  company?: any;
  apprenticeship?: any;
  application?: any;
  payment?: any;
  interview?: any;
  subscription?: any;
  customData?: Record<string, any>;
}

export class EmailTemplates {
  private static instance: EmailTemplates;

  public static getInstance(): EmailTemplates {
    if (!EmailTemplates.instance) {
      EmailTemplates.instance = new EmailTemplates();
    }
    return EmailTemplates.instance;
  }

  private getBaseUrl(): string {
    return getEnvConfig().FRONTEND_URL;
  }

  // Password Reset Template
  public getPasswordResetTemplate(data: EmailTemplateData): EmailTemplate {
    const { user, customData } = data;
    const resetToken = customData?.resetToken || '';
    const resetUrl = `${this.getBaseUrl()}/reset-password?token=${resetToken}`;

    const subject = 'Reset Your ApprenticeApex Password';
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password 🔒</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Secure your account</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #0A0E27; margin: 0 0 20px 0; font-size: 24px;">Hi ${user.firstName || user.name || 'there'},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password for your ApprenticeApex account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                    <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #0080FF; word-break: break-all;">${resetUrl}</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #0A0E27; padding: 30px; text-align: center;">
            <p style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">ApprenticeApex</p>
            <p style="color: #B3B3B3; margin: 0; font-size: 14px;">Keeping your account secure</p>
        </div>
    </div>
</body>
</html>`;

    const text = `Reset Your Password - ApprenticeApex

Hi ${user.firstName || user.name || 'there'},

We received a request to reset your password for your ApprenticeApex account. If you didn't make this request, you can safely ignore this email.

Reset your password: ${resetUrl}

This link will expire in 1 hour for your security.

ApprenticeApex - Keeping your account secure`;

    return { subject, html, text };
  }

  // Email Verification Template
  public getEmailVerificationTemplate(data: EmailTemplateData): EmailTemplate {
    const { user, customData } = data;
    const verificationToken = customData?.verificationToken || '';
    const verificationUrl = `${this.getBaseUrl()}/verify-email?token=${verificationToken}`;

    const subject = 'Verify Your Email Address - ApprenticeApex';
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Verify Your Email ✉️</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">One click to activate your account</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #0A0E27; margin: 0 0 20px 0; font-size: 24px;">Hi ${user.firstName || user.name || 'there'},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Welcome to ApprenticeApex! To complete your registration and start your apprenticeship journey, please verify your email address by clicking the button below.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #155724; margin: 0; font-size: 14px;">
                    <strong>Why verify?</strong> Email verification helps us keep your account secure and ensures you receive important updates about your apprenticeship applications.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify My Email</a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #0080FF; word-break: break-all;">${verificationUrl}</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #0A0E27; padding: 30px; text-align: center;">
            <p style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">ApprenticeApex</p>
            <p style="color: #B3B3B3; margin: 0; font-size: 14px;">Start your journey with verified security</p>
        </div>
    </div>
</body>
</html>`;

    const text = `Verify Your Email Address - ApprenticeApex

Hi ${user.firstName || user.name || 'there'},

Welcome to ApprenticeApex! To complete your registration and start your apprenticeship journey, please verify your email address.

Verify your email: ${verificationUrl}

Email verification helps us keep your account secure and ensures you receive important updates about your apprenticeship applications.

ApprenticeApex - Start your journey with verified security`;

    return { subject, html, text };
  }

  // Interview Reminder Template
  public getInterviewReminderTemplate(data: EmailTemplateData): EmailTemplate {
    const { user, apprenticeship, interview } = data;
    const interviewDate = new Date(interview.scheduledAt);
    const isToday = interviewDate.toDateString() === new Date().toDateString();

    const subject = `${isToday ? 'Today:' : 'Reminder:'} Interview for ${apprenticeship.title} at ${apprenticeship.companyName}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6f42c1 0%, #0080FF 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">${isToday ? 'Interview Today!' : 'Interview Reminder'} 💼</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You're one step closer to your dream apprenticeship</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #0A0E27; margin: 0 0 20px 0; font-size: 24px;">Hi ${user.firstName || 'there'},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${isToday ? 'Your interview is today!' : 'This is a friendly reminder about your upcoming interview.'} Here are the details:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0080FF; margin: 0 0 15px 0; font-size: 18px;">${apprenticeship.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: bold;">Company:</td>
                        <td style="padding: 8px 0; color: #333;">${apprenticeship.companyName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                        <td style="padding: 8px 0; color: #333;">${interviewDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
                        <td style="padding: 8px 0; color: #333;">${interviewDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                    ${interview.location ? `
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
                        <td style="padding: 8px 0; color: #333;">${interview.location}</td>
                    </tr>
                    ` : ''}
                    ${interview.type === 'video' ? `
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: bold;">Type:</td>
                        <td style="padding: 8px 0; color: #333;">Video Interview</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #0080FF; margin: 0 0 10px 0;">Interview Tips:</h4>
                <ul style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>Review the job description and company information</li>
                    <li>Prepare examples that showcase your skills and experiences</li>
                    <li>Have questions ready to ask about the role and company culture</li>
                    <li>Test your technology if it's a video interview</li>
                    <li>Arrive/join 5-10 minutes early</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${this.getBaseUrl()}/applications/${data.application?._id || ''}" style="background: #6f42c1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Application Details</a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Good luck! We're rooting for you. If you need to reschedule, contact the employer as soon as possible.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #0A0E27; padding: 30px; text-align: center;">
            <p style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">ApprenticeApex</p>
            <p style="color: #B3B3B3; margin: 0; font-size: 14px;">Preparing you for success</p>
        </div>
    </div>
</body>
</html>`;

    const text = `Interview Reminder - ApprenticeApex

Hi ${user.firstName || 'there'},

${isToday ? 'Your interview is today!' : 'This is a friendly reminder about your upcoming interview.'}

Interview Details:
Position: ${apprenticeship.title}
Company: ${apprenticeship.companyName}
Date: ${interviewDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${interviewDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
${interview.location ? `Location: ${interview.location}` : ''}
${interview.type === 'video' ? 'Type: Video Interview' : ''}

Interview Tips:
- Review the job description and company information
- Prepare examples that showcase your skills and experiences
- Have questions ready to ask about the role and company culture
- Test your technology if it's a video interview
- Arrive/join 5-10 minutes early

Good luck!

ApprenticeApex`;

    return { subject, html, text };
  }

  // Subscription Confirmation Template
  public getSubscriptionConfirmationTemplate(data: EmailTemplateData): EmailTemplate {
    const { user, subscription } = data;
    const planNames = {
      'starter': 'Starter Plan',
      'professional': 'Professional Plan',
      'enterprise': 'Enterprise Plan'
    };

    const planPrices = {
      'starter': '£49',
      'professional': '£99',
      'enterprise': '£149'
    };

    const subject = `Subscription Confirmed - ${planNames[subscription.plan as keyof typeof planNames]} - ApprenticeApex`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Subscription Active! 🎉</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Welcome to ${planNames[subscription.plan as keyof typeof planNames]}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #0A0E27; margin: 0 0 20px 0; font-size: 24px;">Hi ${user.companyName || user.firstName || 'there'},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for subscribing to ApprenticeApex! Your ${planNames[subscription.plan as keyof typeof planNames]} is now active and you have access to all the features included in your plan.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #28a745; margin: 0 0 15px 0; font-size: 18px;">Subscription Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Plan:</td>
                        <td style="padding: 10px 0; color: #333;">${planNames[subscription.plan as keyof typeof planNames]}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Monthly Cost:</td>
                        <td style="padding: 10px 0; color: #333;">${planPrices[subscription.plan as keyof typeof planPrices]} per month</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Next Billing:</td>
                        <td style="padding: 10px 0; color: #333;">${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Status:</td>
                        <td style="padding: 10px 0; color: #28a745; font-weight: bold;">Active</td>
                    </tr>
                </table>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #155724; margin: 0 0 10px 0;">What's included in your plan:</h4>
                <ul style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    ${subscription.plan === 'starter' ? `
                    <li>Post up to 3 jobs simultaneously</li>
                    <li>Access to candidate database</li>
                    <li>Basic matching algorithm</li>
                    <li>Email support</li>
                    ` : subscription.plan === 'professional' ? `
                    <li>Post up to 10 jobs simultaneously</li>
                    <li>Advanced AI-powered matching</li>
                    <li>Priority candidate visibility</li>
                    <li>Video interview scheduling</li>
                    <li>Priority email & chat support</li>
                    ` : `
                    <li>Unlimited job postings</li>
                    <li>Premium AI matching & analytics</li>
                    <li>Dedicated account manager</li>
                    <li>Custom branding options</li>
                    <li>API access for integrations</li>
                    <li>24/7 phone support</li>
                    `}
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${this.getBaseUrl()}/employer/dashboard" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Your Dashboard</a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                You can manage your subscription, update payment methods, or view billing history in your account settings.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #0A0E27; padding: 30px; text-align: center;">
            <p style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">ApprenticeApex</p>
            <p style="color: #B3B3B3; margin: 0; font-size: 14px;">Empowering your recruitment success</p>
        </div>
    </div>
</body>
</html>`;

    const text = `Subscription Confirmed - ApprenticeApex

Hi ${user.companyName || user.firstName || 'there'},

Thank you for subscribing to ApprenticeApex! Your ${planNames[subscription.plan as keyof typeof planNames]} is now active.

Subscription Details:
Plan: ${planNames[subscription.plan as keyof typeof planNames]}
Monthly Cost: ${planPrices[subscription.plan as keyof typeof planPrices]} per month
Next Billing: ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB')}
Status: Active

Access your dashboard: ${this.getBaseUrl()}/employer/dashboard

You can manage your subscription in your account settings.

ApprenticeApex - Empowering your recruitment success`;

    return { subject, html, text };
  }

  // Success Fee Invoice Template
  public getSuccessFeeInvoiceTemplate(data: EmailTemplateData): EmailTemplate {
    const { user, payment, apprenticeship, customData } = data;
    const successFee = payment.amount;
    const candidateName = customData?.candidateName || 'Selected candidate';
    const annualSalary = customData?.annualSalary || 0;

    const subject = `Success Fee Invoice - £${successFee} - ${apprenticeship.title}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Success Fee Invoice</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0080FF 0%, #00D4FF 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Successful Hire! 🎉</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Success fee invoice - ${apprenticeship.title}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #0A0E27; margin: 0 0 20px 0; font-size: 24px;">Hi ${user.companyName || user.firstName || 'there'},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Congratulations on your successful hire! ${candidateName} has been placed in the ${apprenticeship.title} position. As per our agreement, here's your success fee invoice.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0080FF; margin: 0 0 15px 0; font-size: 18px;">Invoice Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Position:</td>
                        <td style="padding: 10px 0; color: #333;">${apprenticeship.title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Placed Candidate:</td>
                        <td style="padding: 10px 0; color: #333;">${candidateName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Annual Salary:</td>
                        <td style="padding: 10px 0; color: #333;">£${annualSalary.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Success Fee (12%):</td>
                        <td style="padding: 10px 0; color: #0080FF; font-weight: bold; font-size: 18px;">£${successFee.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Invoice Date:</td>
                        <td style="padding: 10px 0; color: #333;">${new Date(payment.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666; font-weight: bold;">Payment Status:</td>
                        <td style="padding: 10px 0; color: #28a745; font-weight: bold;">${payment.status === 'succeeded' ? 'Paid' : 'Pending'}</td>
                    </tr>
                </table>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #155724; margin: 0 0 10px 0;">What's included in this fee:</h4>
                <ul style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>Complete candidate sourcing and screening</li>
                    <li>AI-powered matching technology</li>
                    <li>Application management and coordination</li>
                    <li>Interview scheduling and support</li>
                    <li>Onboarding assistance</li>
                    <li>90-day replacement guarantee</li>
                </ul>
            </div>
            
            ${payment.status !== 'succeeded' ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${this.getBaseUrl()}/payments/success-fee/${payment._id}" style="background: #0080FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Pay Success Fee</a>
            </div>
            ` : ''}
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Thank you for using ApprenticeApex for your recruitment needs. We look forward to helping you find more exceptional talent.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #0A0E27; padding: 30px; text-align: center;">
            <p style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">ApprenticeApex</p>
            <p style="color: #B3B3B3; margin: 0; font-size: 14px;">Invoice Reference: ${payment._id}</p>
        </div>
    </div>
</body>
</html>`;

    const text = `Success Fee Invoice - ApprenticeApex

Hi ${user.companyName || user.firstName || 'there'},

Congratulations on your successful hire! ${candidateName} has been placed in the ${apprenticeship.title} position.

Invoice Details:
Position: ${apprenticeship.title}
Placed Candidate: ${candidateName}
Annual Salary: £${annualSalary.toLocaleString()}
Success Fee (12%): £${successFee.toLocaleString()}
Invoice Date: ${new Date(payment.createdAt).toLocaleDateString('en-GB')}
Payment Status: ${payment.status === 'succeeded' ? 'Paid' : 'Pending'}

What's included:
- Complete candidate sourcing and screening
- AI-powered matching technology
- Application management and coordination
- Interview scheduling and support
- Onboarding assistance
- 90-day replacement guarantee

${payment.status !== 'succeeded' ? `Pay success fee: ${this.getBaseUrl()}/payments/success-fee/${payment._id}` : ''}

Invoice Reference: ${payment._id}

ApprenticeApex`;

    return { subject, html, text };
  }

  // Generic notification template
  public getNotificationTemplate(data: EmailTemplateData): EmailTemplate {
    const { user, customData } = data;
    const title = customData?.title || 'Notification';
    const message = customData?.message || 'You have a new notification.';
    const actionUrl = customData?.actionUrl;
    const actionText = customData?.actionText || 'View Details';

    const subject = `${title} - ApprenticeApex`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">${title}</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">ApprenticeApex Notification</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #0A0E27; margin: 0 0 20px 0; font-size: 24px;">Hi ${user.firstName || user.companyName || 'there'},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${message}
            </p>
            
            ${actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${actionUrl}" style="background: #6c757d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${actionText}</a>
            </div>
            ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background: #0A0E27; padding: 30px; text-align: center;">
            <p style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">ApprenticeApex</p>
            <p style="color: #B3B3B3; margin: 0; font-size: 14px;">Stay connected with your apprenticeship journey</p>
        </div>
    </div>
</body>
</html>`;

    const text = `${title} - ApprenticeApex

Hi ${user.firstName || user.companyName || 'there'},

${message}

${actionUrl ? `${actionText}: ${actionUrl}` : ''}

ApprenticeApex`;

    return { subject, html, text };
  }
}

export default EmailTemplates.getInstance();
