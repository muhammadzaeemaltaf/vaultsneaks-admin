import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const admin_token = request.cookies.get("admin_token")?.value; 
  const url = request.nextUrl.clone();

  if (!admin_token) {
    url.pathname = "/auth"; 
    return NextResponse.redirect(url);
  }

  if(admin_token && url.pathname === "/auth") {
    return NextResponse.redirect(new URL('/', request.url))
   }

  // return NextResponse.next(); 

  // console.log("first middleware");
}

export const config = {
  matcher: [
    "/",
    "/products/",
    "/orders/",
    "/categories",
    "/users/",
  ],
}
