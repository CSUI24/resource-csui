import { NextResponse, type NextRequest } from "next/server";

import { clearSessionCookie, deleteCurrentSession } from "@/lib/auth/session";
import { getSsoLogoutUrl } from "@/lib/auth/cas";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  await deleteCurrentSession();
  const redirectToSso = request.nextUrl.searchParams.get("sso") === "1";
  const response = NextResponse.redirect(redirectToSso ? getSsoLogoutUrl() : new URL("/api/auth/sso/login", request.url));
  clearSessionCookie(response);
  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
