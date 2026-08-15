import { BOOK_FORMATS, BOOK_STATUSES, STATUS_LABELS, type BookRecord } from "@/lib/types";
import { Button, ErrorMessage, Input, Label, Select, TextArea } from "./ui";

type Props = {
  action: React.ComponentProps<"form">["action"];
  book?: BookRecord;
  error?: string | null;
  submitLabel: string;
};

export function BookForm({ action, book, error, submitLabel }: Props) {
  return (
    <form action={action} className="max-w-xl space-y-5">
      {book ? <input type="hidden" name="id" value={book.id} /> : null}
      <ErrorMessage>{error}</ErrorMessage>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={book?.title ?? ""} required />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={book?.status ?? "to-read"}>
          {BOOK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700">Formats</legend>
        <div className="flex flex-wrap gap-3 text-sm text-zinc-700">
          {BOOK_FORMATS.map((format) => (
            <label key={format} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-zinc-200">
              <input
                type="checkbox"
                name="formats"
                value={format}
                defaultChecked={book?.formats.includes(format)}
                className="h-4 w-4 text-teal-700 focus:ring-teal-600"
              />
              {format}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="startedAt">Started</Label>
          <Input id="startedAt" type="date" name="startedAt" defaultValue={book?.startedAt ?? ""} />
        </div>
        <div>
          <Label htmlFor="finishedAt">Finished</Label>
          <Input id="finishedAt" type="date" name="finishedAt" defaultValue={book?.finishedAt ?? ""} />
        </div>
        <div>
          <Label htmlFor="abandonedAt">Abandoned</Label>
          <Input id="abandonedAt" type="date" name="abandonedAt" defaultValue={book?.abandonedAt ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="note">Note</Label>
        <TextArea id="note" name="note" rows={4} defaultValue={book?.note ?? ""} />
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
