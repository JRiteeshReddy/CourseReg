import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'coursereg-university-super-secret-jwt-key-2026'
);

const COOKIE_NAME = 'coursereg_session';

export const ADMIN_EMAILS = [
  'riteesh4754x@gmail.com'
];

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email.trim().toLowerCase());
}

export interface SessionUser {
  email: string;
  name: string;
  regNo: string;
  isAdmin: boolean;
}

export async function setSession(user: SessionUser) {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    regNo: user.regNo,
    isAdmin: user.isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400, // 1 day
  });
}

export async function getSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.email as string) || null;
  } catch (err) {
    return null;
  }
}

export async function getFullSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const email = (payload.email as string) || '';
    return {
      email,
      name: (payload.name as string) || '',
      regNo: (payload.regNo as string) || '',
      isAdmin: Boolean(payload.isAdmin || isAdminEmail(email)),
    };
  } catch (err) {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
