import { embed, embedMany } from "ai";
// import { openai } from "@ai-sdk/openai";
import { db } from "../db";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { embeddings } from "../db/schema/embeddings";
import { google } from "@ai-sdk/google";
// import { env } from "@/lib/env.mjs";

const OUTPUT_DIMENSIONALITY = 768;
// const embeddingModel = openai.embedding("text-embedding-ada-002");

// const embeddingModel = google.textEmbedding(
//   env.GOOGLE_GENERATIVE_AI_EMBEDDING_MODEL
// );
const embeddingModel = google.textEmbedding("text-embedding-004");

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  console.log("Generating multiple embedding !");
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
    providerOptions: {
      google: {
        outputDimensionality: OUTPUT_DIMENSIONALITY,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  console.log("Generating single embedding !");

  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
    providerOptions: {
      google: {
        outputDimensionality: OUTPUT_DIMENSIONALITY,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
  });

  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
};
