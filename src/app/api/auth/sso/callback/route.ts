import { NextResponse, type NextRequest } from "next/server";

import { getSsoLoginUrl, validateCasTicket } from "@/lib/auth/cas";
import { createApplicationSession, setSessionCookie } from "@/lib/auth/session";
import { getAppBaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // TODO: integrate SSO per SSO.md
  const appBaseUrl = getAppBaseUrl();
  const ticket = request.nextUrl.searchParams.get("ticket");
  if (!ticket) {
    return NextResponse.redirect(getSsoLoginUrl());
  }

  const casUser = await validateCasTicket(ticket);
  if (!casUser) {
    return NextResponse.redirect(new URL("/api/auth/sso/login?error=sso_failed", appBaseUrl));
  }

  const user = await prisma.user.upsert({
    where: { username: casUser.username },
    create: {
      username: casUser.username,
      name: casUser.name,
      email: `${casUser.username}@ui.ac.id`,
      npm: casUser.npm,
      organizationalCode: casUser.organizationalCode,
    },
    update: {
      name: casUser.name,
      npm: casUser.npm,
      organizationalCode: casUser.organizationalCode,
    },
  });

  const token = await createApplicationSession(user.id);
  const response = NextResponse.redirect(new URL("/drive", appBaseUrl));
  setSessionCookie(response, token);
  return response;
}
