import { NextResponse } from "next/server";

export function json<T>(body: T, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function error(message: string, status = 400) {
  return json({ error: message }, { status });
}
