import type { AIProvider } from "./types";
import { geminiProvider } from "./gemini";
import { mockProvider } from "./mock";

// Swapping providers (Gemini ↔ mock ↔ future Anthropic) is a one-line env
// change — nothing downstream (route, UI) needs to know which is active.
export function getAIProvider(): AIProvider {
  return process.env.AI_PROVIDER === "mock" ? mockProvider : geminiProvider;
}

export { AIProviderError } from "./types";
