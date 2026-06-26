const DEFAULT_REDIRECT_PATH = "/dashboard";

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_REDIRECT_PATH,
): string {
  if (!value || !fallback.startsWith("/") || fallback.startsWith("//")) {
    return DEFAULT_REDIRECT_PATH;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "http://weekly-os.local");

    if (parsed.origin !== "http://weekly-os.local") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
