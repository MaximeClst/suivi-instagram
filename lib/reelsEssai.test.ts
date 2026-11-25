import { describe, expect, it } from "vitest";
import type { Id } from "@/convex/_generated/dataModel";
import { classer, publieA, rappels, type ReelEssai } from "./reelsEssai";

const reel = (numero: number, date: string, patch: Partial<ReelEssai> = {}): ReelEssai => ({
  _id: String(numero) as Id<"reelsEssai">,
  _creationTime: 0,
  numero,
  nom: `Reel ${numero}`,
  date,
  heure: "18:30",
  fichier: "",
  couverture: "",
  legende: "",
  musique: "",
  statut: "a-preparer",
  abonnes: null,
  visitesProfil: null,
  vues48h: null,
  comparaisonFaite: false,
  ...patch,
});

describe("classement des Reels d'essai", () => {
  it("trie par abonnés, puis visites du profil, et ignore les Reels non diffusés ou sans chiffre", () => {
    const reels = [
      reel(1, "2026-11-12", { statut: "publie", abonnes: 4, visitesProfil: 30 }),
      reel(2, "2026-11-17", { statut: "partage", abonnes: 9 }),
      reel(3, "2026-11-19", { statut: "publie", abonnes: 4, visitesProfil: 50 }),
      reel(4, "2026-11-24", { statut: "a-preparer", abonnes: 20 }),
      reel(5, "2026-11-26", { statut: "publie" }),
    ];
    expect(classer(reels).map((r) => r.numero)).toEqual([2, 3, 1]);
  });
});

describe("rappel des 48 h", () => {
  const r1 = reel(1, "2026-11-12", { statut: "publie" });

  it("publication à 18 h 30 heure de La Réunion = 14 h 30 UTC", () => {
    expect(new Date(publieA(r1)).toISOString()).toBe("2026-11-12T14:30:00.000Z");
  });

  it("apparaît 48 h après la publication, pas avant", () => {
    expect(rappels([r1], Date.parse("2026-11-14T14:29:00Z"))).toHaveLength(0);
    expect(rappels([r1], Date.parse("2026-11-14T14:30:00Z"))).toHaveLength(1);
  });

  it("disparaît une fois la comparaison faite ou le Reel partagé à tous", () => {
    const apres = Date.parse("2026-11-20T00:00:00Z");
    expect(rappels([{ ...r1, comparaisonFaite: true }], apres)).toHaveLength(0);
    expect(rappels([{ ...r1, statut: "partage" }], apres)).toHaveLength(0);
  });
});
