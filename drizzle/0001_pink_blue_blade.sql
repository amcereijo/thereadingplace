ALTER TABLE `books` ADD `date_added` text;--> statement-breakpoint
ALTER TABLE `books` ADD `metadata_json` text DEFAULT '{}' NOT NULL;