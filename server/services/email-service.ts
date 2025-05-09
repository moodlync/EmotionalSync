import { MailService } from '@sendgrid/mail';
import crypto from 'crypto';
import { User as SelectUser } from '@shared/schema';

// Initialize mail service
const mailService = new MailService();

// API key will be set when provided
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Verification token expiry in hours
const VERIFICATION_TOKEN_EXPIRY = 24; 

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

/**
 * Send an email using SendGrid
 */
async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY not set. Email service is disabled.');
      return false;
    }

    const fromEmail = params.from || 'noreply@moodlync.com';
    
    await mailService.send({
      to: params.to,
      from: fromEmail,
      subject: params.subject,
      text: params.text || '',
      html: params.html,
    });
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Generate a verification token for a user
 */
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send a verification email to a newly registered user
 */
async function sendVerificationEmail(user: SelectUser, verificationToken: string): Promise<boolean> {
  if (!user.email) {
    console.error('Cannot send verification email: User has no email address');
    return false;
  }

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://moodlync.com' 
    : 'http://localhost:8080';
  
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6366f1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to MoodLync!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hello ${user.firstName || user.username},</p>
        <p>Thank you for creating a MoodLync account. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify My Email</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all;">${verificationUrl}</p>
        <p>This verification link will expire in ${VERIFICATION_TOKEN_EXPIRY} hours.</p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <p>Best regards,<br>The MoodLync Team</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
        <p>MoodLync - Connect through emotions</p>
      </div>
    </div>
  `;
  
  const emailText = `
    Welcome to MoodLync!
    
    Hello ${user.firstName || user.username},
    
    Thank you for creating a MoodLync account. To complete your registration and access all features, please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This verification link will expire in ${VERIFICATION_TOKEN_EXPIRY} hours.
    
    If you didn't create this account, you can safely ignore this email.
    
    Best regards,
    The MoodLync Team
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Verify Your MoodLync Email Address',
    html: emailHtml,
    text: emailText
  });
}

export const emailService = {
  sendEmail,
  generateVerificationToken,
  sendVerificationEmail,
  VERIFICATION_TOKEN_EXPIRY
};