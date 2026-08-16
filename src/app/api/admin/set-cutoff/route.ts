import { NextResponse } from 'next/server';
import { getFullSession, isAdminEmail } from '@/lib/auth';
import { setRegistrationCutoff } from '@/lib/google-sheets';

export async function POST(request: Request) {
  const session = await getFullSession();

  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json({ error: "Access Denied. Admin authorization required." }, { status: 403 });
  }

  try {
    const { cutoffIsoString } = await request.json();

    if (!cutoffIsoString || typeof cutoffIsoString !== 'string') {
      return NextResponse.json({ error: "Invalid cutoff ISO date string provided." }, { status: 400 });
    }

    const updatedCutoff = await setRegistrationCutoff(cutoffIsoString);

    console.log(`[ADMIN CONTROL] Registration cutoff updated to ${updatedCutoff} by ${session.email}`);

    return NextResponse.json({
      success: true,
      registrationCutoff: updatedCutoff,
      message: `Registration cutoff timestamp updated successfully.`,
    });
  } catch (error) {
    console.error("POST set-cutoff error:", error);
    return NextResponse.json({ error: "Failed to update registration cutoff" }, { status: 500 });
  }
}
