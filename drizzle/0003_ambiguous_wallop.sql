CREATE TABLE `recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`book_id` text,
	`title` text NOT NULL,
	`author` text,
	`formats_json` text DEFAULT '[]' NOT NULL,
	`note` text,
	`message` text,
	`status` text NOT NULL,
	`sent_at` text NOT NULL,
	`seen_at` text,
	`accepted_at` text,
	`dismissed_at` text,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE set null
);
