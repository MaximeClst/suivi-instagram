import { describe, expect, it } from "vitest";
import { CLIENTS_MONTRES_PUBLICATIONS, CLIENTS_MONTRES_STORIES } from "@/convex/scriptsDecembre";
import { nomsClients, CONTENUS_NOVEMBRE, rotation } from "./rotation";

describe("nomsClients", () => {
  it("ignore « Aucun », le plan B et le collage", () => {
    expect(nomsClients("Aucun")).toEqual([]);
    expect(nomsClients("L2KJ Services (plan B : [client 6])")).toEqual(["L2KJ Services"]);
    expect(nomsClients("SM Design, Smart Power System, [client 6], + collage des 5 autres")).toEqual([
      "SM Design",
      "Smart Power System",
      "[client 6]",
    ]);
    expect(nomsClients(undefined)).toEqual([]);
  });
});

describe("rotation", () => {
  it("alerte quand un client revient en moins de 30 jours", () => {
    const r = rotation([
      { date: "2026-12-01", contenu: "Reel", texte: "Alpha" },
      { date: "2026-12-29", contenu: "Story", texte: "alpha" },
      { date: "2026-12-02", contenu: "Reel", texte: "Bêta" },
    ]);
    expect(r[0]).toMatchObject({ client: "Alpha", alerte: true });
    expect(r[0].apparitions.every((a) => a.alerte)).toBe(true);
    expect(r.find((l) => l.client === "Bêta")?.alerte).toBe(false);
  });

  it("pas d'alerte à 30 jours pile ou plus", () => {
    const r = rotation([
      { date: "2026-11-13", contenu: "Carrousel", texte: "SCMOI" },
      { date: "2026-12-13", contenu: "Reel", texte: "SCMOI" },
    ]);
    expect(r[0].alerte).toBe(false);
  });

  it("compte novembre : L2KJ (16/11 et 28/11) revient le 4/12", () => {
    const decembre = [
      ...Object.entries(CLIENTS_MONTRES_PUBLICATIONS).map(([date, texte]) => ({ date, contenu: "Publication", texte })),
      ...Object.entries(CLIENTS_MONTRES_STORIES).map(([date, texte]) => ({ date, contenu: "Story", texte })),
    ];
    const r = rotation([...CONTENUS_NOVEMBRE, ...decembre]);
    const alertes = r.filter((l) => l.alerte).map((l) => l.client);
    expect(alertes).toContain("L2KJ Services");
    expect(alertes).not.toContain("SCMOI");
    expect(alertes).not.toContain("Élagage Péi");
    // L2KJ du 16/11 et du 28/11 : en alerte, puisque le 4/12 est à moins de 30 jours
    expect(r.find((l) => l.client === "L2KJ Services")?.apparitions.map((a) => a.alerte)).toEqual([true, true, true]);
  });

  it("deux apparitions en novembre seulement : pas d'alerte", () => {
    const r = rotation([
      { date: "2026-11-06", contenu: "Reel", texte: "SM Design" },
      { date: "2026-11-14", contenu: "Story", texte: "SM Design" },
      { date: "2026-12-30", contenu: "Carrousel", texte: "SM Design" },
    ]);
    expect(r[0].alerte).toBe(false);
  });
});
