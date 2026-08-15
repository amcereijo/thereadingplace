import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { INVITE_COOKIE } from "@/lib/auth-constants";
import { getInviteLink } from "@/lib/friendships";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const { userId } = await auth();
  const origin = new URL(request.url).origin;

  if (userId) {
    return NextResponse.redirect(`${origin}/invite/existing`);
  }

  const link = await getInviteLink(token);
  if (!link || link.usedAt) {
    return NextResponse.redirect(`${origin}/invite/invalid`);
  }

  const response = NextResponse.redirect(`${origin}/sign-up`);
  response.cookies.set(INVITE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
