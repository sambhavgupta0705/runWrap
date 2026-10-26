import { NextResponse, type NextRequest } from "next/server";
import { deleteAthleteData } from "@/lib/data";

// Strava subscription validation.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const expected = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;
  if (p.get("hub.mode") !== "subscribe" || !expected || p.get("hub.verify_token") !== expected) {
    return new NextResponse(null, { status: 403 });
  }
  return NextResponse.json({ "hub.challenge": p.get("hub.challenge") });
}

// Events. We only act on deauthorization; Strava expects a 200 within 2 seconds.
export async function POST(req: NextRequest) {
  const event = await req.json().catch(() => null);
  if (event?.object_type === "athlete" && event?.updates?.authorized === "false") {
    await deleteAthleteData(Number(event.owner_id ?? event.object_id));
  }
  return new NextResponse(null, { status: 200 });
}
