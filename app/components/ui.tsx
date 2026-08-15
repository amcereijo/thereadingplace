import Link from "next/link";
import type { ReactNode } from "react";
import { STATUS_LABELS } from "@/lib/types";

export function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function buttonClasses(
  variant: "primary" | "secondary" | "danger" | "ghost" = "primary",
  className?: string,
) {
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-600",
    secondary: "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",
  };

  return cn(
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50",
    variants[variant],
    className,
  );
}

export function Button({
  type = "button",
  children,
  variant = "primary",
  className,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  asChild?: never;
}) {
  if (asChild) {
    return null;
  }

  return (
    <button type={type} className={buttonClasses(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-700">
      {children}
    </label>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-zinc-200 bg-white p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{children}</h1>;
}

export function PageSubtitle({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-sm text-zinc-600">{children}</p>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

export function ErrorMessage({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{children}</p>;
}

export function SuccessMessage({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">{children}</p>;
}

export function StatusBadge({ status }: { status: keyof typeof STATUS_LABELS }) {
  const colors: Record<keyof typeof STATUS_LABELS, string> = {
    "to-read": "bg-amber-100 text-amber-800",
    reading: "bg-sky-100 text-sky-800",
    read: "bg-emerald-100 text-emerald-800",
    abandoned: "bg-zinc-200 text-zinc-700",
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", colors[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StyledLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-teal-700 underline-offset-2 hover:text-teal-800 hover:underline">
      {children}
    </Link>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-zinc-900">{children}</h2>;
}
