import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("kundeservice.")) {
    const url = request.nextUrl.clone();
    const originalPath = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/kundeservice${originalPath}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
