import { NextResponse } from 'next/server';
import { getFullSession, isAdminEmail } from '@/lib/auth';
import { getRegistrationStatus, setRegistrationStatus } from '@/lib/google-sheets';

export async function GET() {
  try {
    const isRegistrationOpen = await getRegistrationStatus();
    return NextResponse.json({ isRegistrationOpen });
  } catch (error) {
    console.error("GET registration status error:", error);
    return NextResponse.json({ error: "Failed to fetch registration status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getFullSession();

  if (!session || !isAdminEmail(session.email)) {
    return NextResponse.json({ error: "Access Denied. Admin authorization required." }, { status: 403 });
  }

  try {
    const { isOpen } = await request.json();

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json({ error: "Invalid status value provided. Expected boolean." }, { status: 400 });
    }

    const updatedStatus = await setRegistrationStatus(isOpen);

    console.log(`[ADMIN CONTROL] Registration status updated to ${updatedStatus ? 'OPEN' : 'CLOSED'} by ${session.email}`);

    return NextResponse.json({
      success: true,
      isRegistrationOpen: updatedStatus,
      message: `Course registration is now ${updatedStatus ? 'OPEN' : 'CLOSED'}.`
    });
  } catch (error) {
    console.error("POST toggle-registration error:", error);
    return NextResponse.json({ error: "Failed to update registration status" }, { status: 500 });
  }
}
