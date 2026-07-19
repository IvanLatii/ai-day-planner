import type { AIProvider } from "./types";

// Fixed example output (not a real parse of the input) so the UI can be
// exercised on every state — priorities, tags, dates, and unparsed — without
// a live API call.
function buildMockFragments(todayISO: string) {
  return [
    {
      title: "подзвонити бухгалтеру",
      priority: "high",
      due_date: todayISO,
      time_estimate_min: 15,
      tags: ["дзвінок"],
      source_text: "терміново подзвонити бухгалтеру до обіду",
    },
    {
      title: "купити молоко",
      priority: "low",
      tags: ["покупки"],
      source_text: "купити молоко",
    },
    {
      title: "записатись до стоматолога",
      priority: "medium",
      tags: [],
      source_text: "десь на тижні записатись до стоматолога",
    },
    {
      title: "хм... та штука з Олею, і ще щось було",
      priority: "medium",
      tags: [],
      source_text: "хм... не знаю, та штука з Олею, і ще щось було",
      unparsed: true,
    },
  ];
}

export const mockProvider: AIProvider = {
  async generate(_text, todayISO) {
    return JSON.stringify(buildMockFragments(todayISO));
  },
};
