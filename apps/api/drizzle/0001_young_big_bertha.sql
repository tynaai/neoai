CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"brand" text,
	"category_code" text,
	"price_current" integer,
	"price_original" integer,
	"product_url" text,
	"thumbnail_url" text,
	"specs" jsonb,
	"promotions" text[],
	"embedding_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
