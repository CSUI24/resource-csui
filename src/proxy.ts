import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/constants";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const devBypass = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH !== "false";

  if (hasSession || devBypass) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/drive/:path*", "/search/:path*"],
};
