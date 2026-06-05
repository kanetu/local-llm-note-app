import {
  env,
  pipeline,
  type FeatureExtractionPipeline,
} from "@xenova/transformers";

type EmbeddingTensor = {
  data: Float32Array;
};

// Force fully local model loading.
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = "/models";

let embeddingPipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

function getEmbeddingPipeline(): Promise<FeatureExtractionPipeline> {
  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }

  return embeddingPipelinePromise;
}

export async function warmupLocalEmbedding(): Promise<void> {
  await getEmbeddingPipeline();
}

export async function getEmbeddingFromText(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = (await pipe(text, {
    pooling: "mean",
    normalize: true,
  })) as EmbeddingTensor;

  return Array.from(output.data);
}
