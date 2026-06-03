import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";

import type { SessionUser } from "@/types/user";

import { DEV_SESSION_COOKIE, SESSION_COOKIE } from "../constants";
import { isDevAuthEnabled } from "../env";
import { prisma } from "../prisma";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const devUser: SessionUser = {
  id: "dev-user",
  username: "dev.student",
  name: "Dev Student",
  email: "dev.student@ui.ac.id",
  npm: "0000000000",
  organizationalCode: "CSUI",
};

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createApplicationSession(userId: string) {
  const token = createSessionToken();
  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  });
  return token;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(DEV_SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token && isDevAuthEnabled()) {
    return ensureDevUser();
  }

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    username: session.user.username,
    name: session.user.name,
    email: session.user.email ?? `${session.user.username}@ui.ac.id`,
    avatarUrl: session.user.avatarUrl ?? undefined,
    npm: session.user.npm ?? undefined,
    organizationalCode: session.user.organizationalCode ?? undefined,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;
  await prisma.session.deleteMany({
    where: { tokenHash: hashSessionToken(token) },
  });
}

async function ensureDevUser(): Promise<SessionUser> {
  const user = await prisma.user.upsert({
    where: { username: devUser.username },
    create: {
      username: devUser.username,
      name: devUser.name,
      email: devUser.email,
      npm: devUser.npm,
      organizationalCode: devUser.organizationalCode,
    },
    update: {
      name: devUser.name,
      email: devUser.email,
      npm: devUser.npm,
      organizationalCode: devUser.organizationalCode,
    },
  });

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email ?? devUser.email,
    avatarUrl: user.avatarUrl ?? undefined,
    npm: user.npm ?? undefined,
    organizationalCode: user.organizationalCode ?? undefined,
  };
}
