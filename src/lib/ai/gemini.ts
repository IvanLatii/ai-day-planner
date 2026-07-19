import { GoogleGenAI, Type } from "@google/genai";
import type { AIProvider } from "./types";
import { AIProviderError } from "./types";
import { buildPrompt } from "./prompt";

const MODEL = "gemini-3.5-flash";
const TIMEOUT_MS = 15000;

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
      due_date: { type: Type.STRING, nullable: true },
      time_estimate_min: { type: Type.NUMBER, nullable: true },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      source_text: { type: Type.STRING },
      unparsed: { type: Type.BOOLEAN, nullable: true },
    },
    required: ["title", "priority", "tags", "source_text"],
  },
};

export const geminiProvider: AIProvider = {
  async generate(text, todayISO) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError("missing_api_key");
    }

    const ai = new GoogleGenAI({ apiKey });

    let response;
    try {
      response = await ai.models.generateContent({
        model: MODEL,
        contents: buildPrompt(text, todayISO),
        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
          httpOptions: { timeout: TIMEOUT_MS },
        },
      });
    } catch (err) {
      throw new AIProviderError(
        err instanceof Error ? err.message : "network_error"
      );
    }

    const raw = response.text;
    if (!raw || raw.trim().length === 0) {
      throw new AIProviderError("empty_response");
    }
    return raw;
  },
};
