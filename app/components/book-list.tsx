import { deleteBookAction } from "@/app/actions/books";
import { type BookRecord } from "@/lib/types";
import { Button, Card, EmptyState, LinkButton, StatusBadge } from "./ui";

type Props = {
  books: BookRecord[];
  editable?: boolean;
};

export function BookList({ books, editable = false }: Props) {
  if (books.length === 0) {
    return <EmptyState>No books here yet.</EmptyState>;
  }

  return (
    <ul className="space-y-3">
      {books.map((book) => (
        <li key={book.id}>
          <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-900">{book.title}</h2>
                <StatusBadge status={book.status} />
              </div>
              {book.formats.length > 0 ? (
                <p className="mt-1 text-sm text-zinc-500">{book.formats.join(" · ")}</p>
              ) : null}
              <p className="mt-1 text-xs text-zinc-400">
                {[
                  book.startedAt && `started ${book.startedAt}`,
                  book.finishedAt && `finished ${book.finishedAt}`,
                  book.abandonedAt && `abandoned ${book.abandonedAt}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {book.note ? (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                  {book.note}
                </p>
              ) : null}
            </div>
            {editable ? (
              <div className="flex items-center gap-2">
                <LinkButton variant="secondary" href={`/books/${book.id}/edit`}>
                  Edit
                </LinkButton>
                <form action={deleteBookAction}>
                  <input type="hidden" name="id" value={book.id} />
                  <Button type="submit" variant="danger">
                    Delete
                  </Button>
                </form>
              </div>
            ) : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}
