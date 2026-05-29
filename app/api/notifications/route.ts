import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { title: "Upcoming PTP", message: "Promise to Pay reminder for A/C: LN-92019", account: "LN-92019", time: "14:30" },
    { title: "Overdue Follow-up", message: "PTP outstanding collection required", account: "LN-28192", time: "16:15" }
  ]);
}
