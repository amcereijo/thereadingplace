"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-zinc-900">
          Create your shelf
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-600">Sign up to start tracking your books</p>
        <SignUp appearance={{ elements: { card: "shadow-none" } }} />
      </div>
    </div>
  );
}
