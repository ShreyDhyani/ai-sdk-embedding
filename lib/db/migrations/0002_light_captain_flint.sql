DO $$ BEGIN
 CREATE TYPE "public"."resource_type" AS ENUM('text', 'pdf', 'web');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS "embeddingIndex";--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "page_number" integer;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "chunk_index" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "section_title" text;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "embedding_model" varchar(100) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "source_type" "resource_type" DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "filename" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "page_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "checksum" varchar(64);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resource_chunk_idx" ON "embeddings" USING btree ("resource_id","chunk_index");