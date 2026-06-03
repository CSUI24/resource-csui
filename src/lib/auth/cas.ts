import { XMLParser } from "fast-xml-parser";

import { getAppBaseUrl } from "../env";

export interface CasUser {
  username: string;
  name: string;
  npm?: string;
  organizationalCode?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
});

export function getSsoBaseUrl() {
  return process.env.SSO_BASE_URL ?? "https://sso.ui.ac.id/cas2";
}

export function getSsoServiceUrl() {
  return process.env.SSO_CALLBACK_URL ?? `${getAppBaseUrl()}/api/auth/sso/callback`;
}

export function getSsoLoginUrl() {
  const url = new URL(`${getSsoBaseUrl()}/login`);
  url.searchParams.set("service", getSsoServiceUrl());
  return url;
}

export function getSsoLogoutUrl() {
  const url = new URL(`${getSsoBaseUrl()}/logout`);
  url.searchParams.set("service", `${getAppBaseUrl()}/api/auth/sso/login`);
  return url;
}

export async function validateCasTicket(ticket: string): Promise<CasUser | null> {
  // TODO: integrate SSO per SSO.md
  const url = new URL(`${getSsoBaseUrl()}/serviceValidate`);
  url.searchParams.set("service", getSsoServiceUrl());
  url.searchParams.set("ticket", ticket);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;

  const xml = await response.text();
  const parsed: unknown = parser.parse(xml);
  return parseCasValidationResponse(parsed);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function readText(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function parseCasValidationResponse(parsed: unknown): CasUser | null {
  const root = asRecord(parsed);
  const serviceResponse = asRecord(root?.serviceResponse);
  const success = asRecord(serviceResponse?.authenticationSuccess);
  if (!success) return null;

  const username = readText(success, "user");
  if (!username) return null;

  return {
    username,
    name: readText(success, "nama") ?? username,
    npm: readText(success, "npm"),
    organizationalCode: readText(success, "kd_org"),
  };
}
