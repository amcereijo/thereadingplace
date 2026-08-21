"use client";

import { useActionState, useState } from "react";
import { Check, X } from "lucide-react";
import {
  acceptRecommendationAction,
  dismissRecommendationAction,
} from "@/app/actions/recommendations";
import { BOOK_STATUSES, getStatusLabel, type BookFormat, type RecommendationStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ErrorMessage, IconButton, TextArea } from "./ui";

type Props = {
  mode: "received" | "sent";
  recommendationId: string;
  title: string;
  author: string | null;
  formats: BookFormat[];
  counterpartyLabel: string;
  replyFromUsername: string | null;
  message: string | null;
  reply: string | null;
  status: RecommendationStatus;
  sentAt: string;
  dictionary: Dictionary;
};

const STATUS_COLORS: Record<RecommendationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  dismissed: "bg-zinc-200 text-zinc-700",
};

export function RecommendationRow({
  mode,
  recommendationId,
  title,
  author,
  formats,
  counterpartyLabel,
  replyFromUsername,
  message,
  reply,
  status,
  sentAt,
  dictionary,
}: Props) {
  const [open, setOpen] = useState<boolean | "dismiss">(false);
  const [replyText, setReplyText] = useState("");

  const [acceptState, acceptAction, acceptPending] = useActionState(
    async (
      _prev: { error: string | null; ok: string | null },
      formData: FormData,
    ) => {
      const result = await acceptRecommendationAction(
        { error: null, ok: null },
        formData,
      );
      if (!result.error) {
        setOpen(false);
        setReplyText("");
      }
      return result;
    },
    { error: null as string | null, ok: null as string | null },
  );

  const [dismissState, dismissAction, dismissPending] = useActionState(
    async (
      _prev: { error: string | null },
      formData: FormData,
    ) => {
      await dismissRecommendationAction(formData);
      setOpen(false);
      setReplyText("");
      return { error: null as string | null };
    },
    { error: null as string | null },
  );

  const t = (key: string, params?: Record<string, string | number>) => {
    const value = resolveKey(dictionary, `recommendations.${key}`);
    if (!value) return key;
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      String(params?.[name] ?? `{${name}}`),
    );
  };

  const statusLabel = resolveKey(dictionary, `recommendations.status.${status}`) ?? status;

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              {title}
              {author ? <span className="font-normal text-zinc-600"> {dictionary.shelf.by} {author}</span> : null}
            </h3>
            {formats.length > 0 ? (
              <p className="mt-1 text-xs text-zinc-500">{formats.join(" · ")}</p>
            ) : null}
            <p className="mt-1 text-xs text-zinc-500">{counterpartyLabel}</p>
          </div>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status]}`}>
            {statusLabel}
          </span>
        </div>

        {message ? (
          <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
              {t("message")}
            </p>
            <p className="whitespace-pre-wrap">{message}</p>
          </div>
        ) : null}

        {mode === "sent" && reply ? (
          <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-teal-700">
              {t("responseFrom", { username: replyFromUsername ?? "?" })}
            </p>
            <p className="whitespace-pre-wrap">{reply}</p>
          </div>
        ) : null}

        <p className="text-xs text-zinc-400">{t("sentOn", { date: sentAt })}</p>

        {mode === "received" && status === "pending" ? (
          <div className="flex items-center gap-1">
            <IconButton
              variant="secondary"
              onClick={() => setOpen(true)}
              aria-label={t("acceptAria")}
              title={t("accept")}
              icon={<Check className="h-5 w-5" />}
            />
            <IconButton
              variant="ghost"
              onClick={() => setOpen("dismiss")}
              aria-label={t("dismissAria")}
              title={t("dismiss")}
              icon={<X className="h-5 w-5" />}
            />
          </div>
        ) : null}
      </div>

      {open === true ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setReplyText("");
            }
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">{t("acceptTitle")}</h3>
            <p className="mt-1 text-sm text-zinc-600">{t("acceptDescription")}</p>

            <form action={acceptAction} className="mt-4 space-y-4">
              <input type="hidden" name="recommendationId" value={recommendationId} />
              <select
                name="status"
                required
                defaultValue=""
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="" disabled>
                  {t("acceptDescription")}
                </option>
                {BOOK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(dictionary, s)}
                  </option>
                ))}
              </select>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  {t("reply")}
                </label>
                <TextArea
                  name="reply"
                  rows={3}
                  placeholder={t("replyPlaceholder", { username: replyFromUsername ?? "" })}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              {acceptState.error ? (
                <ErrorMessage>
                  {resolveKey(dictionary, `errors.${acceptState.error.split(".").pop()}`) ??
                    acceptState.error}
                </ErrorMessage>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setOpen(false); setReplyText(""); }}>
                  {t("cancel")}
                </Button>
                <Button type="submit" loading={acceptPending} loadingText={t("accepting")}>
                  {t("accept")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {open === "dismiss" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setReplyText("");
            }
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">{t("dismissTitle")}</h3>
            <p className="mt-1 text-sm text-zinc-600">{t("dismissDescription", { username: replyFromUsername ?? "" })}</p>

            <form action={dismissAction} className="mt-4 space-y-4">
              <input type="hidden" name="recommendationId" value={recommendationId} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  {t("reply")}
                </label>
                <TextArea
                  name="reply"
                  rows={3}
                  placeholder={t("replyPlaceholder", { username: replyFromUsername ?? "" })}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              {dismissState.error ? (
                <ErrorMessage>
                  {resolveKey(dictionary, `errors.${dismissState.error.split(".").pop()}`) ??
                    dismissState.error}
                </ErrorMessage>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setOpen(false); setReplyText(""); }}>
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  loading={dismissPending}
                  loadingText={t("dismissing")}
                >
                  {t("dismiss")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function resolveKey(dict: Dictionary, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}
