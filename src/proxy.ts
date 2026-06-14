import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const xfHost = request.headers.get("x-forwarded-host") ?? "";
  const pathname = request.nextUrl.pathname;

  // Use x-forwarded-host first (Vercel sets this to the original domain), fall back to host
  const effectiveHost = xfHost || host;

  const isKundeservice = effectiveHost.startsWith("kundeservice.") || host.startsWith("kundeservice.");
  const isMit = effectiveHost.startsWith("mit.") || host.startsWith("mit.");

  if (isKundeservice && !pathname.startsWith("/kundeservice")) {
    const target = new URL(`/kundeservice${pathname === "/" ? "" : pathname}`, request.url);
    return NextResponse.rewrite(target);
  }

  if (isMit && !pathname.startsWith("/mit")) {
    const target = new URL(`/mit${pathname === "/" ? "" : pathname}`, request.url);
    const res = NextResponse.rewrite(target);
    res.headers.set("x-proxy-rewrite", `${effectiveHost} -> /mit${pathname === "/" ? "" : pathname}`);
    return res;
  }

  // Debug: log what the proxy sees for every non-matched request
  const res = NextResponse.next();
  res.headers.set("x-proxy-miss", `host=${host} xfh=${xfHost} path=${pathname} isMit=${isMit}`);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
