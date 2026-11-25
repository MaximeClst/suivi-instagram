import { describe, expect, it } from "vitest";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { groupBySemaine } from "./semaines";

const semaine = (code: string, debut: string, fin: string) =>
  ({ _id: code as Id<"semaines">, code, debut, fin }) as Doc<"semaines">;
const publication = (date: string) => ({ _id: date as Id<"publications">, date }) as Doc<"publications">;
const reel = (date: string) => ({ _id: date as Id<"reelsEssai">, date }) as Doc<"reelsEssai">;

describe("calendrier chronologique", () => {
  const semaines = [semaine("S2", "2026-11-09", "2026-11-15"), semaine("S3", "2026-11-16", "2026-11-22")];

  it("mêle publications et Reels d'essai dans l'ordre des dates", () => {
    const groupes = groupBySemaine(
      semaines,
      [publication("2026-11-13"), publication("2026-11-09"), publication("2026-11-11"), publication("2026-11-16")],
      [reel("2026-11-12"), reel("2026-11-17")],
    );
    expect(groupes.map((g) => g.elements.map((e) => `${e.type[0]}${e.date.slice(8)}`))).toEqual([
      ["p09", "p11", "r12", "p13"],
      ["p16", "r17"],
    ]);
  });

  it("n'affiche pas les Reels d'essai d'un autre mois", () => {
    const groupes = groupBySemaine(semaines, [publication("2026-11-09")], [reel("2026-12-03")]);
    expect(groupes.flatMap((g) => g.elements).map((e) => e.type)).toEqual(["publication"]);
  });
});
