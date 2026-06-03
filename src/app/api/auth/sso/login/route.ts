import { NextResponse } from "next/server";

import { getSsoLoginUrl } from "@/lib/auth/cas";

export const runtime = "nodejs";

export async function GET() {
  // TODO: integrate SSO per SSO.md
  return NextResponse.redirect(getSsoLoginUrl());
}
