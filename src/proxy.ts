import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv, isSupabaseConfigured } from "@/lib/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) {
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      request.nextUrl.pathname !== "/admin/login"
    ) {
      return NextResponse.redirect(new URL("/admin/login?setup=1", request.url));
    }
    return response;
  }

  const { url, publishableKey } = getSupabasePublicEnv();
  const client = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await client.auth.getUser();
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isPublicAdminRoute =
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname === "/admin/reset-password";

  if (isAdminRoute && !isPublicAdminRoute && !user) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (request.nextUrl.pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/callback"],
};
