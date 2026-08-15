"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-zinc-900">
          Welcome back
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-600">Sign in to your shelf</p>
        <SignIn appearance={{ elements: { card: "shadow-none" } }} />
      </div>
    </div>
  );
}
