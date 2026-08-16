## 1. Server Action for Copy

- [x] 1.1 Add `copyBookFromFriendAction` in `app/actions/books.ts` that accepts `bookId` and `status`, verifies the viewer can read the friend's shelf, copies title/formats/note, sets `dateAdded` to today, and revalidates shelves
- [x] 1.2 Add `copyBook` function in `lib/books.ts` that creates a book from a source book's fields (title, formats, note) with a new owner and status

## 2. BookDetailModal Component

- [x] 2.1 Create `app/components/book-detail-modal.tsx` that renders all book properties (title, status, formats, dates, note, metadata) in a dialog overlay with backdrop and escape-to-close
- [x] 2.2 Add focus trapping and proper accessibility attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`)

## 3. AddToShelfButton Component

- [x] 3.1 Create `app/components/add-to-shelf-button.tsx` with a dropdown showing the four status options (`to-read`, `reading`, `read`, `abandoned`)
- [x] 3.2 Wire the dropdown to call `copyBookFromFriendAction` on selection and show a success/error message

## 4. Update BookList for Friend View

- [x] 4.1 Add `friendView` prop to `BookList` component in `app/components/book-list.tsx`
- [x] 4.2 Render "Details" button on each book card when `friendView` is true, opening `BookDetailModal`
- [x] 4.3 Render "Add to my shelf" button on each book card when `friendView` is true, using `AddToShelfButton`

## 5. Wire Up Friend Shelf Pages

- [x] 5.1 Update `app/u/[username]/page.tsx` to pass `friendView` prop to `BookList`
- [x] 5.2 Update `app/u/[username]/[status]/page.tsx` to pass `friendView` prop to `BookList`

## 6. Verify

- [x] 6.1 Test the detail modal opens and displays all book properties including metadata
- [x] 6.2 Test the add-to-shelf flow: status selection, book creation on viewer's shelf, revalidation
- [x] 6.3 Test that non-friends cannot see the detail or add-to-shelf buttons
