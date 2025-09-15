import { sql } from "drizzle-orm";
import {
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { nanoid } from "@/lib/utils";

// Enum for resource type
export const resourceTypeEnum = pgEnum("resource_type", ["text", "pdf", "web"]);

export const resources = pgTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // The main body of extracted content
  content: text("content").notNull(),

  // Type of resource: text, pdf, or web
  sourceType: resourceTypeEnum("source_type").notNull().default("text"),

  // For web resources
  url: text("url"),

  // For uploaded files (PDFs, etc.)
  filename: text("filename"),

  // A title or extracted heading
  title: text("title"),

  // Language of the resource
  language: varchar("language", { length: 10 }).notNull().default("en"),

  // For PDFs specifically
  pageCount: integer("page_count").default(0),

  // Optional checksum to avoid duplicate ingestion
  checksum: varchar("checksum", { length: 64 }),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = createInsertSchema(resources)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for resources - used to type API request params and within Components
export type NewResourceParams = typeof insertResourceSchema._type;
