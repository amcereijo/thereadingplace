"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { type AppUser } from "@/lib/types";
import { createT, type Dictionary } from "@/lib/i18n/dictionaries";
import { EmptyState, IconLinkButton, Input } from "./ui";

type Props = {
  friends: AppUser[];
  dictionary: Dictionary;
};

export function FriendsList({ friends, dictionary }: Props) {
  const [query, setQuery] = useState("");
  const t = createT(dictionary);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return friends;
    return friends.filter((friend) =>
      friend.username?.toLowerCase().includes(trimmed),
    );
  }, [friends, query]);

  return (
    <div className="space-y-3">
      {friends.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("friends.friendsCount", { count: filtered.length })}
          </p>
          <div className="sm:max-w-xs sm:flex-1">
            <Input
              type="search"
              placeholder={dictionary.friends.findFriend}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        query ? (
          <EmptyState>{t("friends.noMatch", { query })}</EmptyState>
        ) : (
          <EmptyState>{dictionary.friends.noneYet}</EmptyState>
        )
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  {dictionary.friends.friendsTableHeaderName}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  <span className="sr-only">
                    {dictionary.friends.friendsTableHeaderAction}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.map((friend) => (
                <tr key={friend.id}>
                  <td className="px-3 py-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                        {(friend.username?.[0] ?? "?").toUpperCase()}
                      </span>
                      <span className="truncate font-medium text-zinc-900">
                        @{friend.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <IconLinkButton
                      variant="secondary"
                      href={`/u/${friend.username}`}
                      aria-label={t("friends.viewShelfAria", { username: friend.username ?? "" })}
                      title={dictionary.friends.viewShelf}
                      icon={<Eye className="h-4 w-4" />}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
