import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirect";

import { getSupabaseEnv } from "./env";

const AUTH_ROUTES = new Set(["/login", "/signup"]);
const PUBLIC_PREFIXES = ["/auth/callback", "/auth/auth-code-error"];
const PLANNER_PREFIXES = [
  "/dashboard",
  "/calendar",
  "/studies",
  "/books",
  "/pocs",
  "/review",
  "/workouts",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPlannerPath(pathname: string) {
  return PLANNER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function buildLoginRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return redirectUrl;
}

function buildAuthenticatedRedirect(request: NextRequest) {
  return new URL(
    getSafeRedirectPath(request.nextUrl.searchParams.get("next")),
    request.url,
  );
}

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  const pathname = request.nextUrl.pathname;
  const isAuthenticated = Boolean(data?.claims);

  if (!isAuthenticated && isPlannerPath(pathname)) {
    return NextResponse.redirect(buildLoginRedirect(request));
  }

  if (isAuthenticated && AUTH_ROUTES.has(pathname)) {
    return NextResponse.redirect(buildAuthenticatedRedirect(request));
  }

  return response;
}

export function shouldRunSessionProxy(pathname: string) {
  return !isPublicPath(pathname);
}
