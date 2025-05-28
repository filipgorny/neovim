import { ChatOpenAI } from "@langchain/openai";
import { Model } from "./model";

export class OpenAI implements Model {
  private apiKey: string;
  public llm: ChatOpenAI | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.llm) {
      throw new Error("Model not initialized. Call initialize() first.");
    }

    const response = await this.llm.invoke(prompt);
    return response.text;
  }

  async initialize(): Promise<void> {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
      apiKey: this.apiKey,
    });
  }
}
