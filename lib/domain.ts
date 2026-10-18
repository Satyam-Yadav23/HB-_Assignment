export const ALLOWED_DOMAIN = "hbplus.fit";

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (typeof email !== "string") return false;
  const parts = email.toLowerCase().split("@");
  return parts.length === 2 && parts[0].length > 0 && parts[1] === ALLOWED_DOMAIN;
}
