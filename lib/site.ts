const DEFAULT_SITE_URL = "https://viraj.computer";

export const SITE_NAME = "Viraj's Computer";
export const SITE_DESCRIPTION =
  "Viraj Patel is a software engineer in Bengaluru building developer platforms, SDKs, orchestration systems, and open-source infrastructure.";

export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL?.trim() || DEFAULT_SITE_URL;
  return new URL(configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`);
}
