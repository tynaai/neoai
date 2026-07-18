CREATE TABLE "conversation_state" (
	"id" text PRIMARY KEY NOT NULL,
	"search_filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"excluded_ids" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"has_upsold" boolean DEFAULT false NOT NULL,
	"last_category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
