const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function renderOtpEmailHtml(token: string): string {
  return `
    <h2>Confirm your signup</h2>
    <p>Your 6-digit verification code for Campus Life Registration is:</p>
    <h1 style="font-size: 32px; letter-spacing: 6px; color: #2563eb;">${token}</h1>
    <p>Enter this code in the portal to verify your email and complete your registration.</p>
  `.trim();
}

export function generateOtp(email: string): string {
  const normalizedEmail = email.toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL

  otpStore.set(normalizedEmail, { code, expiresAt });

  const emailHtml = renderOtpEmailHtml(code);

  console.log(`\n========================================`);
  console.log(`[OTP GENERATED] To: ${normalizedEmail}`);
  console.log(`[OTP CODE]: ${code}`);
  console.log(`[EMAIL TEMPLATE OUTPUT]:\n${emailHtml}`);
  console.log(`========================================\n`);

  return code;
}

export function verifyOtpCode(email: string, inputCode: string): boolean {
  const normalizedEmail = email.toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (record.code === inputCode.trim()) {
    otpStore.delete(normalizedEmail);
    return true;
  }

  return false;
}
