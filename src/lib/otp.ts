import nodemailer from 'nodemailer';

// Temporary in-memory store for OTPs
// In a real serverless app, this should be Redis or a database table
const otpStore = new Map<string, { code: string, expiresAt: number }>();

// Configure nodemailer using environment variables
// Note: If you're using Gmail, you MUST use an "App Password", not your normal password.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function generateAndSendOtp(email: string): Promise<void> {
  // Generate 6 digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store it for 5 minutes
  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  // If SMTP credentials aren't set in .env.local, fallback to console (mock)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n\n=== MOCK EMAIL ===\nTo: ${email}\nYour OTP is: ${code}\n==================\n\n`);
    return;
  }

  // Send real email via Nodemailer
  const mailOptions = {
    from: `"Campus Registration" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Registration OTP Code",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Login Verification</h2>
        <p style="color: #475569; font-size: 16px;">
          You requested to log in to the Campus Life Course Registration Portal.
          Here is your One-Time Password:
        </p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3b82f6;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This code will expire in 5 minutes. If you did not request this, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Real OTP email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send OTP email via Nodemailer:", error);
    throw new Error("Failed to send email");
  }
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const record = otpStore.get(normalizedEmail);
  
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }
  
  if (record.code === code) {
    otpStore.delete(normalizedEmail);
    return true;
  }
  
  return false;
}
