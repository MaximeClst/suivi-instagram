import { describe, expect, it } from "vitest";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { storiesDecembre } from "@/convex/decembre";
import { CONCOURS_AJOUT, CONSEILS_MERCREDI, PUBLICATIONS_REELS_COURTS, PUBLICATIONS_V2, SCRIPTS_DECEMBRE, SCRIPTS_REELS_COURTS } from "@/convex/scriptsDecembre";
import { aTourner, legendeACopier, morceauxGras, semaineATourner, voixACopier, voixStoryACopier } from "./scripts";

describe("légende", () => {
  it("a de vrais retours à la ligne, sans « / », et garde avant/après", () => {
    const l = legendeACopier(SCRIPTS_DECEMBRE["2026-12-04"].legende!);
    expect(l).toBe(
      "[Prénom], climaticien à La Possession 🇷🇪\nMême savoir-faire. Mais maintenant, ça se voit avant le premier appel.\nTon avant/après ? Tu vois ta page d'accueil avant de t'engager.\nEnvoie-moi PROJET en message 👇\n#artisan974 #climatisation974 #laréunion",
    );
    for (const s of Object.values(SCRIPTS_DECEMBRE)) {
      expect(legendeACopier(s.legende!)).not.toContain(" / ");
      if (s.planAlternatif?.legende) expect(legendeACopier(s.planAlternatif.legende)).not.toContain(" / ");
    }
  });
});

describe("voix", () => {
  it("met la voix dans l'ordre, sans guillemets, avec l'accroche à la place de « Accroche A ou B »", () => {
    expect(voixACopier(SCRIPTS_DECEMBRE["2026-12-03"])).toBe(
      "Électricien du 974 ? Ton client te cherche sur Google.\n(ou B : Saint-Denis, Saint-Pierre, Saint-Paul : électricien, t'es où sur Google ?)\nIl appelle les 3 premiers. Les autres, il les voit même pas.\nJe te prépare une maquette gratuite de ton site. Envoie-moi PROJET.",
    );
    expect(voixACopier(SCRIPTS_DECEMBRE["2026-12-06"])).toBe(
      "Artisan à La Réunion ? Tu vois ta page d'accueil avant de t'engager.\nOn s'appelle 15 minutes. Je te montre ta maquette en visio. Elle te plaît : 1 000 € en 3 fois, ou 169 € par mois sans rien avancer. Sinon, 0 €.\nEnvoie-moi PROJET en message.",
    );
  });

  it("fonctionne sur les 8 Reels, le plan B du 18/12 et les stories", () => {
    const reels = Object.values(SCRIPTS_DECEMBRE).filter((s) => s.plan);
    expect(reels).toHaveLength(8);
    for (const s of reels) expect(voixACopier(s)).not.toMatch(/[«»]|Accroche A ou B/);
    const r18 = SCRIPTS_DECEMBRE["2026-12-18"];
    expect(voixACopier({ ...r18, plan: r18.planAlternatif!.plan })).toBe(
      "Avant de créer ton site, je viens chez toi.\nTes vrais chantiers, tes vraies photos. Pas d'images de banque.\nLe prochain, c'est toi ? Envoie-moi PROJET.",
    );
    expect(voixStoryACopier("« Tu fermes ? Oui. »")).toBe("Tu fermes ? Oui.");
  });
});

describe("données de décembre", () => {
  it("accroche B pour les Reels du 3, 10, 17 et 27/12 seulement", () => {
    const avecB = Object.entries(SCRIPTS_DECEMBRE).filter(([, s]) => s.accrocheB).map(([d]) => d);
    expect(avecB).toEqual(["2026-12-03", "2026-12-10", "2026-12-17", "2026-12-27"]);
  });
  it("12 publications ont un script, dont l'annonce du 15/12", () => {
    expect(Object.keys(SCRIPTS_DECEMBRE)).toHaveLength(12);
    expect(SCRIPTS_DECEMBRE["2026-12-15"].titre).toContain("gagnant");
  });
  it("plus aucun « 1re page » ni « maquette en cours » en décembre", () => {
    const tout = JSON.stringify({ SCRIPTS_DECEMBRE, PUBLICATIONS_V2, stories: storiesDecembre(), CONCOURS_AJOUT }).toLowerCase();
    expect(tout).not.toContain("1re page");
    expect(tout).not.toContain("maquette en cours");
  });
  it("plus de mini-audit, et les clients choisis le 21/11 sont en place", () => {
    const tout = JSON.stringify({ SCRIPTS_DECEMBRE, PUBLICATIONS_V2, stories: storiesDecembre(), CONCOURS_AJOUT, SCRIPTS_REELS_COURTS });
    expect(tout.toLowerCase()).not.toContain("mini-audit");
    expect(tout).not.toContain("[client");
    expect(PUBLICATIONS_V2.every((p) => p.cta === "PROJET")).toBe(true);
    expect(SCRIPTS_DECEMBRE["2026-12-30"].slides![0]).toContain("10 artisans");
    expect(tout).not.toContain("Smart Power System");
    expect(storiesDecembre().find((s) => s.date === "2026-12-19")?.client).toBe("O Milles Déco");
  });
});

it("découpe le gras des slides", () => {
  expect(morceauxGras("**Envoie-moi PROJET.**")).toEqual([{ texte: "Envoie-moi PROJET.", gras: true }]);
  expect(morceauxGras("Avant : capture")).toEqual([{ texte: "Avant : capture", gras: false }]);
});

describe("à tourner cette semaine", () => {
  const semaines = [
    { debut: "2026-11-30", fin: "2026-12-06" },
    { debut: "2026-12-07", fin: "2026-12-13" },
  ];
  it("prend la semaine en cours, sinon la prochaine", () => {
    expect(semaineATourner(semaines, "2026-12-08")).toEqual({ semaine: semaines[1], aVenir: false });
    expect(semaineATourner(semaines, "2026-11-20")).toEqual({ semaine: semaines[0], aVenir: true });
    expect(semaineATourner(semaines, "2026-12-20")).toBeNull();
  });
  it("garde seulement les éléments « À tourner » de la semaine", () => {
    const pub = (date: string, statut: Doc<"publications">["statut"]) =>
      ({ _id: date as Id<"publications">, date, statut }) as Doc<"publications">;
    const story = (date: string, patch: Partial<Doc<"stories">>) => ({ _id: date as Id<"stories">, date, publiee: false, ...patch }) as Doc<"stories">;
    const r = aTourner(
      semaines[1],
      [pub("2026-12-10", "a-preparer"), pub("2026-12-11", "tourne"), pub("2026-12-04", "a-preparer")],
      [story("2026-12-09", { voix: "x" }), story("2026-12-08", {}), story("2026-12-02", { voix: "x" })],
    );
    expect(r.publications.map((p) => p.date)).toEqual(["2026-12-10"]);
    expect(r.stories.map((s) => s.date)).toEqual(["2026-12-09"]);
  });
});

describe("5 posts et 4 stories par semaine (22/11)", () => {
  const jour = (d: string) => new Date(d).getUTCDay();
  it("plus de story le lundi, mardi ou mercredi, sauf le concours du 1/12 et du 15/12", () => {
    const lmm = storiesDecembre().filter((st) => [1, 2, 3].includes(jour(st.date))).map((st) => st.date);
    expect(lmm).toEqual(["2026-12-01", "2026-12-15"]);
  });
  it("dimanche : sticker « regarde ta page » et réponse en message ; le 27/12 reprend « Le test avant 2027 »", () => {
    const dimanches = storiesDecembre().filter((st) => jour(st.date) === 0);
    expect(dimanches.map((d) => d.date)).toEqual(["2026-12-06", "2026-12-13", "2026-12-20", "2026-12-27"]);
    for (const d of dimanches) {
      expect(d.sticker).toMatchObject({ type: "question", libelle: "Tu veux que je regarde ta page ? Envoie-moi son nom" });
      expect(d.apres).toBe("Réponse en message dans la journée.");
    }
    expect(dimanches[3]).toMatchObject({ texte: "Le test avant 2027", voix: CONSEILS_MERCREDI["2026-12-30"].voix });
  });
  it("7 Reels courts avec script, légende en vraies lignes et bandeau « sans avancer un euro »", () => {
    expect(PUBLICATIONS_REELS_COURTS.map((p) => p.date)).toEqual([
      "2026-12-02", "2026-12-08", "2026-12-09", "2026-12-16", "2026-12-22", "2026-12-23", "2026-12-29",
    ]);
    expect(PUBLICATIONS_V2.length + PUBLICATIONS_REELS_COURTS.length).toBe(19);
    for (const p of PUBLICATIONS_REELS_COURTS) {
      expect(p).toMatchObject({ format: "Reel court", cta: "PROJET" });
      expect(p.accroche.startsWith("Artisan du 974 : ")).toBe(true);
      const s = SCRIPTS_REELS_COURTS[p.date];
      expect(s.plan?.[0].ecran).toContain("« Ton site sans avancer un euro »");
      const lignes = legendeACopier(s.legende!).split("\n");
      expect(lignes[0]).toBe("Artisan du 974 ?");
      expect(lignes.slice(3)).toEqual([
        "Ton site sans avancer un euro, et tu vois ta page d'accueil avant de t'engager.",
        "Envoie-moi PROJET en message 👇",
        "#artisan974 #laréunion #siteweb974",
      ]);
      expect(voixACopier(s)).not.toMatch(/[«»]/);
    }
    // Même voix que la story conseil
    expect(SCRIPTS_REELS_COURTS["2026-12-02"].plan?.[0].voix).toBe(CONSEILS_MERCREDI["2026-12-02"].voix);
  });
});
