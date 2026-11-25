import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ACCES } from "@/lib/acces";

export function middleware(request: NextRequest) {
  const attendu = process.env.APP_PASSWORD;
  const cookie = request.cookies.get(COOKIE_ACCES)?.value;
  if (attendu && cookie === attendu) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/connexion";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!connexion|_next/|favicon.ico|robots.txt).*)"],
};
