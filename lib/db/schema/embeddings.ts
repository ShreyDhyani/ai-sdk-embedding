import { nanoid } from "@/lib/utils";
import {
  index,
  pgTable,
  text,
  varchar,
  vector,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { resources } from "./resources";

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),

    resourceId: varchar("resource_id", { length: 191 }).references(
      () => resources.id,
      { onDelete: "cascade" }
    ),

    // Actual chunk content
    content: text("content").notNull(),

    // The embedding vector (adjust dimensions as per your model)
    embedding: vector("embedding", { dimensions: 768 }).notNull(),

    // Metadata
    pageNumber: integer("page_number"), // For PDFs
    chunkIndex: integer("chunk_index").default(0), // Order of chunk in resource
    sectionTitle: text("section_title"), // For PDF/web headings
    embeddingModel: varchar("embedding_model", { length: 100 })
      .notNull()
      .default("default"), // Model used to generate embedding
    language: varchar("language", { length: 10 }).notNull().default("en"),
    source: text("source"), // e.g. url, filename, or description

    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    // Vector similarity index
    embeddingIndex: index("embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),

    // Helpful for resource-scoped retrieval
    resourceChunkIdx: index("resource_chunk_idx").on(
      table.resourceId,
      table.chunkIndex
    ),
  })
);
