import { notFound } from "next/navigation";
import { EditBookForm } from "@/app/components/edit-book-form";
import { PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { getBook } from "@/lib/books";
import { listAcceptedFriends } from "@/lib/friendships";
import { BackButton } from "@/app/components/back-button";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAppUser();
  const { id } = await params;
  const [book, friends] = await Promise.all([getBook(id), listAcceptedFriends(user.id)]);
  const { dictionary, t } = await getDictionaryForLocale();
  if (!book || book.ownerId !== user.id) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <BackButton />
        <PageTitle>{t("editBook.title")}</PageTitle>
      </div>
      <EditBookForm book={book} dictionary={dictionary} recommendFriends={friends} />
    </div>
  );
}
