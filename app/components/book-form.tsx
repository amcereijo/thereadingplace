import { BOOK_FORMATS, BOOK_STATUSES, STATUS_LABELS, type BookRecord } from "@/lib/types";

const field = "mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm";
const label = "block text-sm font-medium";

type Props = {
  action: React.ComponentProps<"form">["action"];
  book?: BookRecord;
  error?: string | null;
  submitLabel: string;
};

export function BookForm({ action, book, error, submitLabel }: Props) {
  return (
    <form action={action} className="space-y-4">
      {book ? <input type="hidden" name="id" value={book.id} /> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <label className={label}>
        Title
        <input className={field} name="title" defaultValue={book?.title ?? ""} required />
      </label>
      <label className={label}>
        Status
        <select className={field} name="status" defaultValue={book?.status ?? "to-read"}>
          {BOOK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className={label}>Formats</legend>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {BOOK_FORMATS.map((format) => (
            <label key={format} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="formats"
                value={format}
                defaultChecked={book?.formats.includes(format)}
              />
              {format}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          Started
          <input className={field} type="date" name="startedAt" defaultValue={book?.startedAt ?? ""} />
        </label>
        <label className={label}>
          Finished
          <input className={field} type="date" name="finishedAt" defaultValue={book?.finishedAt ?? ""} />
        </label>
        <label className={label}>
          Abandoned
          <input className={field} type="date" name="abandonedAt" defaultValue={book?.abandonedAt ?? ""} />
        </label>
      </div>
      <label className={label}>
        Note
        <textarea className={field} name="note" rows={4} defaultValue={book?.note ?? ""} />
      </label>
      <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-sm text-white">
        {submitLabel}
      </button>
    </form>
  );
}
