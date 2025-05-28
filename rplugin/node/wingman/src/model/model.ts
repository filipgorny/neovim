import { LLM } from "@langchain/core/language_models/llms";

export interface Model {
  generate(prompt: string): Promise<string>;

  initialize(): Promise<void>;

  get llm(): LLM;
}
