## Context

The Reading Place currently requires manual entry of book data. Users migrating from Goodreads have existing reading history in CSV export format. The Goodreads CSV contains standardized columns (Book Id, Title, Author, ISBN, My Rating, Date Read, Bookshelves, My Review, etc.) that need to be mapped to the application's book schema.

## Goals / Non-Goals

**Goals:**
- Parse Goodreads CSV export files accurately
- Map CSV fields to internal book schema
- Handle edge cases (missing fields, encoding issues)
- Provide clear import feedback

**Non-Goals:**
- Import from other platforms (LibraryThing, Amazon, etc.)
- Real-time sync with Goodreads
- Import of book covers or external images
- Batch import from multiple files simultaneously

## Decisions

### Decision: CSV Parsing Library
**Choice**: PapaParse
**Rationale**: Lightweight, browser-compatible, handles edge cases (quoted fields, line breaks in data, UTF-8 encoding). Well-maintained with 32k+ GitHub stars.
**Alternatives considered**: 
- Manual parsing: Error-prone with real-world CSV data
- SheetJS: Heavier, more features than needed

### Decision: Import Flow Architecture
**Choice**: Client-side parsing with server-side persistence
**Rationale**: Reduces server load, provides instant feedback, no temporary file storage needed.
**Alternatives considered**:
- Server-only parsing: Adds latency, requires temp file handling

### Decision: Duplicate Detection Strategy
**Choice**: ISBN-first matching with title+author fallback
**Rationale**: ISBN is the most reliable identifier when present. Goodreads data often has valid ISBNs.
**Alternatives considered**:
- Title+author only: Prone to false positives with different editions

## Risks / Trade-offs

**Risk**: CSV format variations across Goodreads exports
→ Mitigation: Test with multiple export versions, document supported format

**Risk**: Large CSV files (1000+ books) may cause browser performance issues
→ Mitigation: Implement chunked processing with progress updates

**Risk**: Character encoding issues with non-Latin characters
→ Mitigation: PapaParse handles UTF-8 natively, test with multilingual data