import { describe, expect, it } from "vitest";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { deriver, evaluer, stagne, type Valeurs } from "./regles";

const CODES = ["S0", "S1", "S2", "S3", "S4"];

const regle = (condition: Doc<"regles">["condition"], probleme: string): Doc<"regles"> => ({
  _id: probleme as Id<"regles">,
  _creationTime: 0,
  ordre: 0,
  condition,
  conditionLabel: probleme,
  probleme,
  action: "",
});

const REGLES = [
  regle({ type: "stagne", k: "reach_non_followers" }, "accroche"),
  regle({ type: "monte-et-stagne", a: "reach_non_followers", b: "profile_visits" }, "fin-du-reel"),
  regle({ type: "monte-et-zero", a: "link_clicks", b: "projet_total" }, "page-ads"),
  regle({ type: "cumul-zero-apres", k: "projet_organic", apres: "S4" }, "angle"),
  regle({ type: "taux-hausse-apres", num: "ad_mockups", den: "ad_leads", apres: "S2" }, "continuer"),
];

const problemes = (v: Valeurs) => evaluer(REGLES, v, CODES).map((a) => a.regle.probleme);

describe("stagne", () => {
  it("vrai si égal ou en baisse deux semaines de suite", () => {
    expect(stagne({ k: [100, 90, 90] }, "k", 2)).toBe(true);
    expect(stagne({ k: [100, 90, 95] }, "k", 2)).toBe(false);
    expect(stagne({ k: [100, null, 80] }, "k", 2)).toBe(false);
  });
});

describe("moteur de règles", () => {
  it("cas 1 : la portée stagne → les 3 premières secondes", () => {
    expect(problemes({ reach_non_followers: [1200, 1100, 1100] })).toEqual(["accroche"]);
  });

  it("cas 2 : la portée monte, les visites stagnent ; clics en hausse sans PROJET", () => {
    expect(
      problemes({
        reach_non_followers: [800, 1000, 1400],
        profile_visits: [60, 55, 50],
        link_clicks: [3, 4, 9],
        projet_total: [0, 0, 0],
      }),
    ).toEqual(["fin-du-reel", "page-ads"]);
  });

  it("cas 3 : fin de mois sans PROJET organique, taux pub en hausse après S2", () => {
    expect(
      problemes({
        reach_non_followers: [800, 900, 1000, 1100, 1300],
        projet_organic: [0, 0, null, 0, 0],
        ad_leads: [5, 4, 6, 5, 4],
        ad_mockups: [1, 1, 1, 1, 2],
      }),
    ).toEqual(["angle", "continuer"]);
  });

  it("aucune alerte sans données", () => {
    expect(problemes({})).toEqual([]);
  });
});

describe("règles de décembre (jeu de test)", () => {
  const codes = ["S1", "S2", "S3", "S4", "S5"];
  const regle = (condition: Doc<"regles">["condition"]) => ({ _id: condition.type, condition }) as unknown as Doc<"regles">;
  const R = {
    duree: regle({ type: "sous-seuil", k: "reel_watch_time", seuil: 5 }),
    finReel: regle({ type: "seuil-et-stagne", a: "reel_watch_time", seuil: 5, b: "profile_visits" }),
    bio: regle({ type: "monte-et-taux-sous", a: "profile_visits", num: "link_clicks", den: "profile_visits", seuil: 0.1 }),
    stickers: regle({ type: "stagne", k: "sticker_replies" }),
    audit: regle({ type: "cumul-superieur", a: "messages_autres", b: "messages_projet" }),
    zero: regle({ type: "cumul-zero-apres", k: "messages_total", apres: "S4" }),
  };
  const toutes = Object.values(R);
  const declenchees = (v: Valeurs) => evaluer(toutes, v, codes).map((a) => a.regle._id);

  it("durée sous 5 s : l'accroche", () => {
    expect(declenchees({ reel_watch_time: [4, null, null, null, null] })).toEqual(["sous-seuil"]);
  });

  it("durée correcte mais visites qui stagnent : la fin du Reel", () => {
    expect(declenchees({ reel_watch_time: [6, 6, 7, null, null], profile_visits: [80, 70, 70, null, null] })).toEqual([
      "seuil-et-stagne",
    ]);
  });

  it("visites en hausse, clics sous 10 % : la bio", () => {
    expect(declenchees({ profile_visits: [64, 90, null, null, null], link_clicks: [4, 6, null, null, null] })).toEqual([
      "monte-et-taux-sous",
    ]);
    expect(declenchees({ profile_visits: [64, 90, null, null, null], link_clicks: [4, 10, null, null, null] })).toEqual([]);
  });

  it("stickers qui ne montent pas 2 semaines de suite", () => {
    expect(declenchees({ sticker_replies: [5, 4, 4, null, null] })).toEqual(["stagne"]);
  });

  it("cumul supérieur, et 0 message fin décembre", () => {
    expect(declenchees({ messages_projet: [0, 1, null, null, null], messages_autres: [1, 2, null, null, null] })).toEqual([
      "cumul-superieur",
    ]);
    expect(
      declenchees({ messages_projet: [0, 0, 0, 0, null], messages_autres: [0, 0, 0, 0, null] }),
    ).toEqual(["cumul-zero-apres"]);
  });

  it("calcule le total des messages", () => {
    expect(deriver({ messages_projet: [1, null], messages_autres: [2, null] }, 2).messages_total).toEqual([3, null]);
  });
});
