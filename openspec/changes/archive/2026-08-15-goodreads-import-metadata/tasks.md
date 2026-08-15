## 1. Database Schema Updates

- [x] 1.1 Add `metadata` JSON column to books table in schema.ts
- [x] 1.2 Add `dateAdded` text column to books table in schema.ts
- [x] 1.3 Generate migration with drizzle-kit

## 2. Type Updates

- [x] 2.1 Add `metadata` and `dateAdded` to BookRecord type in types.ts
- [x] 2.2 Update book parsing functions to handle new fields

## 3. Import Logic Updates

- [x] 3.1 Update goodreads-import.ts to store extra fields in metadata
- [x] 3.2 Map "Date Added" to dateAdded field
- [x] 3.3 Verify finishedAt correctly maps from "Date Read"
- [x] 3.4 Remove redundant data from note field

## 4. Books CRUD Updates

- [x] 4.1 Update createBook to accept metadata and dateAdded
- [x] 4.2 Update updateBook to handle metadata and dateAdded
- [x] 4.3 Update toBook function to include new fields