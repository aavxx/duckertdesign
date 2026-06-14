import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const xfHost = request.headers.get("x-forwarded-host") ?? "";
  const effectiveHost = xfHost || host;

  if (effectiveHost.startsWith("kundeservice.") || host.startsWith("kundeservice.")) {
    const url = request.nextUrl.clone();
    const originalPath = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/kundeservice${originalPath}`;
    return NextResponse.rewrite(url);
  }

  if (
    effectiveHost.startsWith("mit.") ||
    host.startsWith("mit.") ||
    effectiveHost === "mit.duckert.design" ||
    host === "mit.duckert.design"
  ) {
    const url = request.nextUrl.clone();
    const originalPath = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/mit${originalPath}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("x-proxy-host-seen", effectiveHost || host);
    return res;
  }

  // Diagnostic: expose which host the proxy sees (remove after debugging)
  const res = NextResponse.next();
  res.headers.set("x-proxy-host-seen", effectiveHost || host);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
