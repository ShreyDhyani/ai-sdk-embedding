-- 0002_update_embedding_dim.sql
DROP INDEX IF EXISTS "embeddingIndex";

ALTER TABLE "embeddings"
  DROP COLUMN IF EXISTS "embedding";

ALTER TABLE "embeddings"
  ADD COLUMN "embedding" vector(768);

CREATE INDEX IF NOT EXISTS "embeddingIndex"
  ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);