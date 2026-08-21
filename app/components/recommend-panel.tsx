"use client";

import { useActionState, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { sendRecommendationAction } from "@/app/actions/recommendations";
import { type AppUser } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ErrorMessage, IconButton, Input, TextArea } from "./ui";

type Props = {
  bookId: string;
  friends: AppUser[];
  dictionary: Dictionary;
  ariaLabel?: string;
};

export function RecommendPanel({ bookId, friends, dictionary, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [receiverId, setReceiverId] = useState<string>("");
  const [message, setMessage] = useState("");

  const [state, formAction, pending] = useActionState(
    async (
      _prev: { error: string | null; ok: string | null },
      formData: FormData,
    ) => {
      const result = await sendRecommendationAction({ error: null, ok: null }, formData);
      if (!result.error) {
        setReceiverId("");
        setMessage("");
        setOpen(false);
      }
      return result;
    },
    { error: null as string | null, ok: null as string | null },
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((friend) => friend.username?.toLowerCase().includes(q));
  }, [friends, filter]);

  const t = (key: string, params?: Record<string, string | number>) => {
    const value = resolveKey(dictionary, `recommendations.${key}`);
    if (!value) return key;
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      String(params?.[name] ?? `{${name}}`),
    );
  };

  return (
    <div className="relative inline-block">
      {ariaLabel ? (
        <IconButton
          variant="secondary"
          onClick={() => setOpen(true)}
          aria-label={ariaLabel}
          title={t("recommend")}
          icon={<Send className="h-5 w-5" />}
        />
      ) : (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {t("recommend")}
        </Button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">
              {t("panelTitle")}
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              {t("panelDescription")}
            </p>

            <form action={formAction} className="mt-4 space-y-4">
              <input type="hidden" name="bookId" value={bookId} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  {t("pickFriend")}
                </label>
                <Input
                  type="search"
                  placeholder={t("pickFriend")}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                {friends.length === 0 ? (
                  <p className="mt-2 text-xs text-zinc-500">{t("noFriends")}</p>
                ) : (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2">
                    {filtered.length === 0 ? (
                      <li className="px-2 py-1 text-xs text-zinc-500">
                        {resolveKey(dictionary, "friends.noMatch")?.replace(
                          /\{query\}/g,
                          filter,
                        ) ?? filter}
                      </li>
                    ) : (
                      filtered.map((friend) => (
                        <li key={friend.id}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-zinc-50">
                            <input
                              type="radio"
                              name="receiverId"
                              value={friend.id}
                              checked={receiverId === friend.id}
                              onChange={() => setReceiverId(friend.id)}
                              required
                              className="h-4 w-4 text-teal-700 focus:ring-teal-600"
                            />
                            <span className="text-sm text-zinc-800">
                              @{friend.username}
                            </span>
                          </label>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  {t("message")}
                </label>
                <TextArea
                  name="message"
                  rows={3}
                  placeholder={t("messagePlaceholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {state.error ? (
                <ErrorMessage>
                  {resolveKey(dictionary, `errors.${state.error.split(".").pop()}`) ??
                    state.error}
                </ErrorMessage>
              ) : null}
              {state.ok ? (
                <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">
                  {resolveKey(dictionary, `recommendations.${state.ok.split(".").pop()}`) ??
                    state.ok}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={pending || !receiverId}>
                  {pending ? t("sending") : t("send")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
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
