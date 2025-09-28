import { Model } from "./model";
import {GoogleGenAI} from '@google/genai';
import * as dotenv from "dotenv";

dotenv.config();

export class Gemini implements Model {
  ai: GoogleGenAI;

  constructor() {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async prompt(message: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: message,
    });

    return response.text || "";
  }
}
