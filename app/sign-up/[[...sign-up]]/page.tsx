"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
          Create your shelf
        </h1>
        <p className="mb-6 text-sm text-zinc-600">Sign up to start tracking your books</p>
        <SignUp />
      </div>
    </div>
  );
}
