"use client";

import { useMemo, useState } from "react";
import { type AppUser } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Card, EmptyState, Input, LinkButton, SectionTitle } from "./ui";

type Props = {
  friends: AppUser[];
  dictionary: Dictionary;
};

export function FriendsList({ friends, dictionary }: Props) {
  const [query, setQuery] = useState("");
  const t = (key: string, params?: Record<string, string | number>) => {
    const value = dictionary[key as keyof Dictionary] as string | undefined;
    return value ? interpolate(value, params ?? {}) : key;
  };

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return friends;
    return friends.filter((friend) =>
      friend.username?.toLowerCase().includes(trimmed),
    );
  }, [friends, query]);

  return (
    <section className="space-y-4">
      <SectionTitle>{dictionary.friends.yourFriends}</SectionTitle>

      {friends.length > 0 ? (
        <div className="max-w-md">
          <Input
            type="search"
            placeholder={dictionary.friends.findFriend}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        query ? (
          <EmptyState>{t("friends.noMatch", { query })}</EmptyState>
        ) : (
          <EmptyState>{dictionary.friends.noneYet}</EmptyState>
        )
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((friend) => (
            <li key={friend.id}>
              <Card className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-base font-bold text-teal-700">
                    {(friend.username?.[0] ?? "?").toUpperCase()}
                  </span>
                  <span className="truncate text-base font-semibold text-zinc-900">
                    @{friend.username}
                  </span>
                </div>
                <LinkButton
                  variant="secondary"
                  href={`/u/${friend.username}`}
                  className="w-full"
                >
                  {dictionary.friends.viewShelf}
                </LinkButton>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function interpolate(value: string, params: Record<string, string | number>): string {
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
