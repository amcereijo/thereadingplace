## Why

The friend's shelf view currently shows only basic book information (title, status, formats, dates, notes). Users browsing a friend's shelf cannot see full book details like metadata, and there is no way to add a book from a friend's shelf to their own. This limits the social discovery value of the friends feature.

## What Changes

- Add a "View details" button on each book card in the friend's shelf view that opens a detail view showing all book properties including metadata
- Add an "Add to my shelf" button on the friend's shelf view that copies a book to the viewer's own shelf with a status selector

## Capabilities

### New Capabilities
- `friend-shelf-actions`: Copying a book from a friend's shelf to the viewer's own shelf with status selection

### Modified Capabilities
- `friendships`: Enhancing the friend shelf views requirement to support viewing full book details (metadata, all fields)

## Impact

- `app/components/book-list.tsx`: Add detail view and add-to-shelf buttons for non-editable (friend) mode
- `app/actions/books.ts`: New server action to copy a book from a friend's shelf
- `app/u/[username]/page.tsx` and `app/u/[username]/[status]/page.tsx`: Pass additional context for the new actions
- `lib/books.ts`: New function to copy a book between users
- New component for the book detail view/modal
- New component for the add-to-shelf status selector
