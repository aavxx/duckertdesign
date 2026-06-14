import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const xfHost = request.headers.get("x-forwarded-host") ?? "";
  // nextUrl.hostname is parsed from the actual incoming URL — most reliable on Node.js runtime
  const urlHost = request.nextUrl.hostname ?? "";
  const effectiveHost = xfHost || host || urlHost;

  const isKundeservice =
    effectiveHost.startsWith("kundeservice.") ||
    host.startsWith("kundeservice.") ||
    urlHost.startsWith("kundeservice.");

  const isMit =
    effectiveHost.startsWith("mit.") ||
    host.startsWith("mit.") ||
    urlHost.startsWith("mit.");

  if (isKundeservice) {
    if (request.nextUrl.pathname.startsWith("/kundeservice")) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname === "/" ? "/kundeservice" : `/kundeservice${request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isMit) {
    if (request.nextUrl.pathname.startsWith("/mit")) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname === "/" ? "/mit" : `/mit${request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-proxy-debug", `eff=${effectiveHost} host=${host} url=${urlHost}`);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
