import Link from "next/link";
import { deleteBookAction } from "@/app/actions/books";
import { STATUS_LABELS, type BookRecord } from "@/lib/types";

type Props = {
  books: BookRecord[];
  editable?: boolean;
};

export function BookList({ books, editable = false }: Props) {
  if (books.length === 0) {
    return <p className="text-sm text-zinc-600">No books here yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {books.map((book) => (
        <li key={book.id} className="rounded border border-zinc-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-medium">{book.title}</h2>
              <p className="text-sm text-zinc-600">{STATUS_LABELS[book.status]}</p>
              {book.formats.length > 0 ? (
                <p className="text-sm text-zinc-600">{book.formats.join(", ")}</p>
              ) : null}
              <p className="mt-1 text-xs text-zinc-500">
                {[
                  book.startedAt && `started ${book.startedAt}`,
                  book.finishedAt && `finished ${book.finishedAt}`,
                  book.abandonedAt && `abandoned ${book.abandonedAt}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {book.note ? <p className="mt-2 whitespace-pre-wrap text-sm">{book.note}</p> : null}
            </div>
            {editable ? (
              <div className="flex gap-2 text-sm">
                <Link href={`/books/${book.id}/edit`} className="underline">
                  Edit
                </Link>
                <form action={deleteBookAction}>
                  <input type="hidden" name="id" value={book.id} />
                  <button type="submit" className="underline">
                    Delete
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
