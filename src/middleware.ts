import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/constants/product";

const PUBLIC_PATHS = ["/login", "/offline", "/manifest.webmanifest", "/sw.js"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith("/icons"));
  const isApiAuth = pathname.startsWith("/api/auth");
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (!session && pathname.startsWith("/api/") && !isApiAuth) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  if (!session && !isPublic && !isApiAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|sw.js).*)"],
};
