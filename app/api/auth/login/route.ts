import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeUrl } from "@/lib/strava";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authorizeUrl(state));
  res.cookies.set("rw_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
