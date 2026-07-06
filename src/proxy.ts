import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const xfHost = request.headers.get("x-forwarded-host") ?? "";
  const pathname = request.nextUrl.pathname;

  // Use x-forwarded-host first (Vercel sets this to the original domain), fall back to host
  const effectiveHost = xfHost || host;

  const isKundeservice = effectiveHost.startsWith("kundeservice.") || host.startsWith("kundeservice.");

  if (isKundeservice && !pathname.startsWith("/kundeservice")) {
    const target = new URL(`/kundeservice${pathname === "/" ? "" : pathname}`, request.url);
    return NextResponse.rewrite(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
