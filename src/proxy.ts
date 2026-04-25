import { NextRequest, NextResponse } from "next/server";

const REFRESH_COOKIE = "refresh_token";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(REFRESH_COOKIE);

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const loginUrl = new URL("/account/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
