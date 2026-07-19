export class AIProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderError";
  }
}

// A provider only has to turn text into a raw model response string.
// JSON parsing/repair happens once, centrally, in validate.ts — providers
// don't each reimplement that.
export interface AIProvider {
  generate(text: string, todayISO: string): Promise<string>;
}
