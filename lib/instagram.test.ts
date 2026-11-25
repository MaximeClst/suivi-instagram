import { describe, expect, it } from "vitest";
import {
  cle,
  dateReunion,
  decider,
  fusionner,
  lireStatsCompte,
  lireStatsPost,
  normaliserLien,
  planPublication,
  planReelEssai,
  relier,
  valeurIndicateur,
  type Cible,
  type PostIg,
  type StatsIg,
} from "./instagram";

// Vrais posts de @code_celeste (novembre 2026), légendes raccourcies
const post = (id: string, timestamp: string, produit: string, partageFil: boolean | null, legende = ""): PostIg => ({
  id,
  timestamp,
  produit,
  partageFil,
  legende,
  permalink: `https://www.instagram.com/${produit === "REELS" ? "reel" : "p"}/${id}/`,
});

const POSTS = [
  post("clim-trial", "2026-11-16T15:26:48+0000", "REELS", false, "Quand la clim lâche"),
  post("clim-a", "2026-11-16T15:26:39+0000", "REELS", true, "Quand la clim lâche"),
  post("carrousel-13", "2026-11-13T16:24:16+0000", "FEED", null, "Artisan du 974 ?"),
  post("essai-1", "2026-11-12T14:28:47+0000", "REELS", true, "Tu fais le chantier"),
  post("questions", "2026-11-11T14:12:12+0000", "REELS", true, "Un site d'artisan"),
  post("trial-sans-legende", "2026-11-07T03:20:29+0000", "REELS", false, ""),
  post("plombier-b", "2026-11-02T05:31:08+0000", "REELS", false, "Ton client ne fouille pas Google."),
  post("plombier-a", "2026-11-02T05:28:14+0000", "REELS", true, "Ton client ne fouille pas Google."),
  post("facebook", "2026-11-04T05:21:27+0000", "FEED", null, "Facebook, garde-le !"),
];

const pub = (id: string, date: string, reel: boolean, extra: Partial<Cible> = {}): Cible => ({
  type: "publication",
  id,
  date,
  reel,
  abTest: false,
  reporte: false,
  ...extra,
});

const CIBLES: Cible[] = [
  pub("p02", "2026-11-02", true, { abTest: true }),
  pub("p04", "2026-11-04", false),
  pub("p11", "2026-11-11", true),
  pub("p13", "2026-11-13", false),
  pub("p16", "2026-11-16", true, { abTest: true }),
  { type: "reelEssai", id: "e1", date: "2026-11-12", heure: "18:30", reel: true, abTest: false, reporte: false },
];

const ids = (r: ReturnType<typeof relier>, c: Pick<Cible, "type" | "id">) => {
  const x = r.correspondances.get(cle(c));
  return { a: x?.a?.id, b: x?.b?.id };
};

describe("dateReunion", () => {
  it("passe à l'heure de La Réunion (UTC+4)", () => {
    expect(dateReunion({ timestamp: "2026-11-06T21:30:00+0000" })).toBe("2026-11-07");
    expect(dateReunion({ timestamp: "2026-11-06T17:16:17+0000" })).toBe("2026-11-06");
  });
});

describe("relier : post Instagram ↔ publication", () => {
  const r = relier(CIBLES, POSTS);

  it("relie le Reel partagé en version A et le Trial Reel de même légende en version B", () => {
    expect(ids(r, { type: "publication", id: "p02" })).toEqual({ a: "plombier-a", b: "plombier-b" });
    expect(ids(r, { type: "publication", id: "p16" })).toEqual({ a: "clim-a", b: "clim-trial" });
  });

  it("relie un carrousel au post du fil du même jour, jamais à un Reel", () => {
    expect(ids(r, { type: "publication", id: "p04" }).a).toBe("facebook");
    expect(ids(r, { type: "publication", id: "p13" }).a).toBe("carrousel-13");
  });

  it("relie un Reel d'essai à son post du jour", () => {
    expect(ids(r, { type: "reelEssai", id: "e1" }).a).toBe("essai-1");
  });

  it("laisse de côté les posts sans publication (Trial du samedi sans légende)", () => {
    expect(r.nonRelies.map((p) => p.id)).toEqual(["trial-sans-legende"]);
  });

  it("n'utilise jamais un post pour deux publications", () => {
    const tous = [...r.correspondances.values()].flatMap((c) => [c.a?.id, c.b?.id]).filter(Boolean);
    expect(new Set(tous).size).toBe(tous.length);
  });

  it("ignore une publication reportée", () => {
    const r2 = relier([pub("p11", "2026-11-11", true, { reporte: true })], POSTS);
    expect(r2.correspondances.size).toBe(0);
  });

  it("un lien collé à la main l'emporte, même à une autre date", () => {
    const r2 = relier(
      [pub("p11", "2026-11-11", true, { lien: { permalinkA: "https://www.instagram.com/reel/essai-1/?igsh=abc", manuel: true } })],
      POSTS,
    );
    expect(ids(r2, { type: "publication", id: "p11" }).a).toBe("essai-1");
  });

  it("refait un lien automatique devenu faux après un changement de date", () => {
    const r2 = relier([pub("p11", "2026-11-11", true, { lien: { idA: "essai-1" } })], POSTS);
    expect(ids(r2, { type: "publication", id: "p11" }).a).toBe("questions");
  });

  it("publication et Reel d'essai le même jour : l'heure prévue départage", () => {
    const posts = [
      post("matin", "2026-12-03T05:30:00+0000", "REELS", true, "Électricien"),
      post("soir", "2026-12-03T14:30:00+0000", "REELS", true, "Fierté du 974"),
    ];
    const r2 = relier(
      [
        pub("p", "2026-12-03", true, { heure: "09:30" }),
        { type: "reelEssai", id: "e6", date: "2026-12-03", heure: "18:30", reel: true, abTest: false, reporte: false },
      ],
      posts,
    );
    expect(ids(r2, { type: "publication", id: "p" }).a).toBe("matin");
    expect(ids(r2, { type: "reelEssai", id: "e6" }).a).toBe("soir");
  });
});

describe("normaliserLien", () => {
  it("reconnaît le même post quelle que soit la forme du lien", () => {
    expect(normaliserLien("https://www.instagram.com/reel/DfzrIJFCOuJ/?igsh=xyz")).toBe("DfzrIJFCOuJ");
    expect(normaliserLien("instagram.com/code_celeste/p/Df4-cvejLc6")).toBe("Df4-cvejLc6");
  });
});

describe("decider : une saisie manuelle n'est jamais écrasée", () => {
  it("remplit une case vide", () => {
    expect(decider(null, undefined, 482)).toEqual({ action: "ecrire", valeur: 482 });
  });
  it("met à jour un chiffre que la synchro avait elle-même écrit", () => {
    expect(decider(400, 400, 482)).toEqual({ action: "ecrire", valeur: 482 });
  });
  it("garde le chiffre saisi par Maxime et signale l'écart", () => {
    expect(decider(350, undefined, 482)).toEqual({ action: "conflit", manuel: 350, instagram: 482 });
    expect(decider(350, 400, 482)).toEqual({ action: "conflit", manuel: 350, instagram: 482 });
  });
  it("ne touche à rien quand Instagram ne donne pas le chiffre", () => {
    expect(decider(350, undefined, null)).toEqual({ action: "garder" });
    expect(decider(null, undefined, null)).toEqual({ action: "garder" });
  });
  it("fusionner ne garde en mémoire que ce qui a été écrit", () => {
    const r = fusionner(
      [
        { champ: "A-vues", actuel: null, instagram: 482 },
        { champ: "A-partages", actuel: 9, instagram: 3 },
      ],
      {},
    );
    expect(r.ecrire).toEqual({ "A-vues": 482 });
    expect(r.auto).toEqual({ "A-vues": 482 });
    expect(r.conflits).toEqual([{ champ: "A-partages", manuel: 9, instagram: 3 }]);
  });
});

const STATS: StatsIg = { vues: 482, portee: 299, partages: 3, enregistrements: 5, likes: 6, commentaires: 0, dureeVue: 2.6 };
const RES = { vues: null, nonAbonnes: 70, dureeVue: null, partages: 12, enregistrements: null, messages: 2 };
const MAINTENANT = Date.parse("2026-11-20T12:00:00Z");

describe("planPublication", () => {
  it("décembre : remplit les résultats A et B sans toucher aux messages ni aux saisies", () => {
    const a = { post: post("a", "2026-11-18T10:00:00+0000", "REELS", true), stats: STATS };
    const b = { post: post("b", "2026-11-18T10:01:00+0000", "REELS", false), stats: { ...STATS, vues: 900 } };
    const r = planPublication(
      { date: "2026-11-18", statut: "a-preparer", vues48h: null, resultats: RES, resultatsB: { ...RES, partages: null }, auto: {} },
      a,
      b,
      MAINTENANT,
    );
    expect(r.patch.resultats).toEqual({ ...RES, vues: 482, dureeVue: 2.6, enregistrements: 5 }); // partages 12 gardé
    expect(r.patch.resultatsB).toEqual({ ...RES, vues: 900, dureeVue: 2.6, partages: 3, enregistrements: 5 });
    expect(r.conflits).toEqual([{ champ: "A-partages", manuel: 12, instagram: 3 }]);
    expect(r.patch.statut).toBe("publie");
  });

  it("novembre : relève les vues à 48 h seulement avant 48 h", () => {
    const base = { date: "2026-11-19", statut: "publie", vues48h: null, auto: {} };
    const jeune = { post: post("j", "2026-11-19T05:00:00+0000", "REELS", true), stats: STATS };
    const vieux = { post: post("v", "2026-11-11T05:00:00+0000", "REELS", true), stats: STATS };
    expect(planPublication(base, jeune, undefined, MAINTENANT).patch).toEqual({ vues48h: 482 });
    expect(planPublication(base, vieux, undefined, MAINTENANT).patch).toEqual({});
  });

  it("ne repasse pas en « publié » une publication reportée", () => {
    const a = { post: post("a", "2026-11-18T10:00:00+0000", "FEED", null), stats: STATS };
    const r = planPublication({ date: "2026-11-18", statut: "reporte", vues48h: null, auto: {} }, a, undefined, MAINTENANT);
    expect(r.patch.statut).toBeUndefined();
  });
});

describe("planReelEssai", () => {
  it("passe en « partagé » quand Instagram dit que le Reel est partagé aux abonnés", () => {
    const a = { post: post("e", "2026-11-12T14:28:47+0000", "REELS", true), stats: STATS };
    const r = planReelEssai({ vues48h: 300, statut: "publie", auto: {} }, a, MAINTENANT);
    expect(r.patch).toEqual({ statut: "partage" }); // vues 48 h : post trop vieux, chiffre manuel gardé
  });
});

describe("lecture des réponses Instagram", () => {
  it("convertit la durée de vue des millisecondes en secondes", () => {
    const s = lireStatsPost([
      { name: "views", values: [{ value: 482 }] },
      { name: "ig_reels_avg_watch_time", values: [{ value: 2563 }] },
    ]);
    expect(s.vues).toBe(482);
    expect(s.dureeVue).toBe(2.6);
    expect(s.partages).toBeNull();
  });

  it("indicateurs de la semaine : non-abonnés, visites, clics, partages + enregistrements", () => {
    const compte = lireStatsCompte([
      { name: "profile_views", total_value: { value: 160 } },
      { name: "website_clicks", total_value: { value: 3 } },
      {
        name: "reach",
        total_value: {
          value: 4180,
          breakdowns: [{ results: [{ dimension_values: ["NON_FOLLOWER"], value: 3887 }, { dimension_values: ["FOLLOWER"], value: 279 }] }],
        },
      },
      { name: "views", total_value: { value: 9942, breakdowns: [{ results: [{ dimension_values: ["NON_FOLLOWER"], value: 5990 }] }] } },
    ]);
    const semaine = {
      ...compte,
      posts: [
        { post: POSTS[0], stats: STATS },
        { post: POSTS[2], stats: { ...STATS, dureeVue: null } },
      ],
    };
    expect(valeurIndicateur({ key: "reach_non_followers", label: "Comptes touchés non abonnés" }, semaine)).toBe(3887);
    expect(valeurIndicateur({ key: "reach_non_followers", label: "Vues des non-abonnés" }, semaine)).toBe(5990);
    expect(valeurIndicateur({ key: "profile_visits", label: "" }, semaine)).toBe(160);
    expect(valeurIndicateur({ key: "link_clicks", label: "" }, semaine)).toBe(3);
    expect(valeurIndicateur({ key: "shares_saves", label: "" }, semaine)).toBe(16);
    expect(valeurIndicateur({ key: "reel_watch_time", label: "" }, semaine)).toBe(2.6);
    expect(valeurIndicateur({ key: "mockups", label: "" }, semaine)).toBeNull();
  });
});
