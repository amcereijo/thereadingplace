## Context

The friend's shelf view (`/u/:username`) uses the same `BookList` component as the owner's shelf, but without the `editable` prop. This means edit/delete buttons are hidden, and there is no way to view full book details or copy books. The `BookList` component is a client component that receives a `BookRecord[]` array.

## Goals / Non-Goals

**Goals:**
- Add a detail view showing all book properties (including metadata) accessible from the friend's shelf
- Add an "Add to my shelf" button with status selection that copies a book to the viewer's shelf
- Keep changes minimal and consistent with existing patterns

**Non-Goals:**
- Modifying the owner's shelf view
- Adding real-time sync between copied books and originals
- Supporting bulk copy operations

## Decisions

### Detail view: modal overlay vs. inline expansion vs. separate page
**Decision:** Use a modal/dialog overlay triggered by a "Details" button on each book card.

**Rationale:** A modal keeps the user in context (they stay on the friend's shelf) and avoids extra navigation. Inline expansion would clutter the card layout. A separate page adds URL complexity for a transient view.

**Alternative considered:** Inline accordion expansion - rejected because metadata can be large and would push other cards down unpredictably.

### Add-to-shelf: dropdown selector vs. dedicated page
**Decision:** Use an inline dropdown/popover with the four status options, appearing when the "Add to my shelf" button is clicked.

**Rationale:** The status selection is a single choice from four options. A dropdown is lightweight, keeps the user on the friend's shelf, and matches the existing sort dropdown pattern. No form submission or redirect needed - the action is a single server call.

**Alternative considered:** Redirect to `/books/new` pre-filled with the friend's book data - rejected because it breaks browsing flow and requires URL state management.

### Server action for copy
**Decision:** Add a `copyBookFromFriendAction` server action in `app/actions/books.ts`.

**Rationale:** Follows the existing pattern for book mutations. The action takes `bookId` (the friend's book) and `status` (the viewer's chosen status), verifies the viewer can read the friend's shelf, copies the relevant fields, and revalidates.

### What gets copied
**Decision:** Copy title, formats, and note. Do NOT copy dates, metadata, or id.

**Rationale:** Dates reflect the original reader's experience (when they started/finished). Metadata may contain personal or contextual data. The copy is a new book entry on the viewer's shelf with fresh timestamps.

### Component structure
**Decision:** Add `BookDetailModal` and `AddToShelfButton` components. Pass a `friendView` prop to `BookList` instead of overloading `editable`.

**Rationale:** The `editable` prop controls edit/delete. A separate `friendView` boolean keeps the logic clean and avoids ternary soup. `BookDetailModal` is a self-contained component that receives a `BookRecord` and renders all fields. `AddToShelfButton` manages its own dropdown state and calls the server action.

## Risks / Trade-offs

- **Duplicate books**: A viewer can copy the same book multiple times. This is allowed per spec - it matches how physical book collections work (two copies of the same title).
- **Stale copies**: Copies are snapshots; changes to the original don't propagate. This is intentional and documented.
- **Modal accessibility**: Must handle focus trapping, escape-to-close, and backdrop click. Use standard dialog patterns.
