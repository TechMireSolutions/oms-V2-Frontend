import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// Called by the backend after a branding publish (or by an admin action) to
// flush the cached active-brand fetch immediately — so a re-skin is reflected
// app-wide without waiting for the 60s revalidate window or any redeploy.
// Protect with a shared secret matching the backend.
export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag("branding");
  return NextResponse.json({ ok: true, revalidated: "branding" });
}
