## ADDED Requirements

### Requirement: Recommendation row shows a cover thumbnail
Each `RecommendationRow` on `/recommendations` SHALL display a cover thumbnail resolved from the linked `books` row's `metadata.coverUrl` (per the `book-covers` capability). When no cover is resolvable, the row SHALL display the localized cover placeholder in the same slot.

#### Scenario: Recommendation linked to a book with a cover
- **WHEN** a recommendation row references a `bookId` whose `books` row has `metadata.coverUrl`
- **THEN** the row displays that cover thumbnail before the title

#### Scenario: Recommendation without a resolvable cover
- **WHEN** a recommendation row references no `bookId`, or the linked book has no `metadata.coverUrl`
- **THEN** the row displays the localized placeholder before the title
