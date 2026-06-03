import { redirect } from "next/navigation";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string | string[] }>;
}) {
  const params = await searchParams;
  const ticket = Array.isArray(params.ticket) ? params.ticket[0] : params.ticket;
  redirect(ticket ? `/api/auth/sso/callback?ticket=${encodeURIComponent(ticket)}` : "/api/auth/sso/login");
}
