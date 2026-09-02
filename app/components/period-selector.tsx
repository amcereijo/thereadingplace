"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  year: number;
  month: number | null;
  availableYears: number[];
  yearLabel: string;
  monthLabel: string;
  allMonthsLabel: string;
  monthLabels: readonly string[];
};

export function PeriodSelector({
  year,
  month,
  availableYears,
  yearLabel,
  monthLabel,
  allMonthsLabel,
  monthLabels,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const sortedYears = [...availableYears].sort((a, b) => b - a);

  function navigate(nextYear: number, nextMonth: number | null) {
    const params = new URLSearchParams();
    params.set("year", String(nextYear));
    if (nextMonth !== null) params.set("month", String(nextMonth));
    startTransition(() => {
      router.push(`/stats?${params.toString()}`);
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <div>
        <label
          htmlFor="period-year"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          {yearLabel}
        </label>
        <select
          id="period-year"
          name="year"
          value={String(year)}
          onChange={(e) => navigate(Number(e.target.value), month)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          {sortedYears.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="period-month"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          {monthLabel}
        </label>
        <select
          id="period-month"
          name="month"
          value={month === null ? "all" : String(month)}
          onChange={(e) => {
            const v = e.target.value;
            navigate(year, v === "all" ? null : Number(v));
          }}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          <option value="all">{allMonthsLabel}</option>
          {monthLabels.map((name, i) => {
            const m = i + 1;
            return (
              <option key={m} value={String(m)}>
                {name}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
