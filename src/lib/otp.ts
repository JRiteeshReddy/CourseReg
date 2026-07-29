const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function generateOtp(email: string): string {
  const normalizedEmail = email.toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL

  otpStore.set(normalizedEmail, { code, expiresAt });

  console.log(`\n========================================`);
  console.log(`[OTP GENERATED] To: ${normalizedEmail}`);
  console.log(`[OTP CODE]: ${code}`);
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
