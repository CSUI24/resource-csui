import { redirect } from "next/navigation";

import { getAppBaseUrl } from "@/lib/env";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string | string[] }>;
}) {
  const params = await searchParams;
  const ticket = Array.isArray(params.ticket)
    ? params.ticket[0]
    : params.ticket;
  const appBaseUrl = getAppBaseUrl();

  if (!ticket) {
    redirect(`${appBaseUrl}/api/auth/sso/login`);
  }

  const callbackUrl = new URL("/api/auth/sso/callback", appBaseUrl);
  callbackUrl.searchParams.set("ticket", ticket);
  redirect(callbackUrl.toString());
}
