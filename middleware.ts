import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value; 
  const url = request.nextUrl.clone();

  if (!token) {
    url.pathname = "/auth"; 
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: [
    "//:path*",
    "/products/:path*",
    "/orders/:path*",
    "/categories/:path*",
    "/users/:path*",
  ],
};
