"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
          Welcome back
        </h1>
        <p className="mb-6 text-sm text-zinc-600">Sign in to your shelf</p>
        <SignIn />
      </div>
    </div>
  );
}
