import { describe, expect, it } from "vitest";
import type { Id } from "@/convex/_generated/dataModel";
import { enRetard, statsSemaine, storyDuJour, type Story } from "./stories";

const story = (date: string, patch: Partial<Story> = {}): Story => ({
  _id: date as Id<"stories">,
  _creationTime: 0,
  date,
  theme: "",
  visuelType: "fond",
  visuel: "",
  texte: "",
  sticker: { type: "aucun", libelle: "", reponses: [], lien: "" },
  apres: "",
  publiee: false,
  vues: null,
  reponses: null,
  messagesPrives: null,
  ...patch,
});

describe("stories", () => {
  it("une story passée non publiée est en retard, pas celle du jour ni une publiée", () => {
    expect(enRetard(story("2026-11-12"), "2026-11-13")).toBe(true);
    expect(enRetard(story("2026-11-13"), "2026-11-13")).toBe(false);
    expect(enRetard(story("2026-11-12", { publiee: true }), "2026-11-13")).toBe(false);
  });

  it("trouve la story du jour", () => {
    const stories = [story("2026-11-12"), story("2026-11-13")];
    expect(storyDuJour(stories, "2026-11-13")?.date).toBe("2026-11-13");
    expect(storyDuJour(stories, "2026-11-14")).toBeNull();
  });

  it("compte les stories publiées et les messages privés de la semaine", () => {
    const stories = [
      story("2026-11-08", { publiee: true, messagesPrives: 9 }), // semaine précédente
      story("2026-11-12", { publiee: true, messagesPrives: 2 }),
      story("2026-11-13", { publiee: false, messagesPrives: 1 }),
      story("2026-11-15", { publiee: true }),
    ];
    expect(statsSemaine(stories, { debut: "2026-11-09", fin: "2026-11-15" })).toEqual({ publiees: 2, total: 3, messages: 3 });
    expect(statsSemaine(stories, { debut: "2026-11-30", fin: "2026-12-06" })).toBeNull();
  });
});
