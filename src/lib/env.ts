export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getAppBaseUrl() {
  return process.env.APP_BASE_URL ?? "http://localhost:3000";
}

export function isDevAuthEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH !== "false";
}
