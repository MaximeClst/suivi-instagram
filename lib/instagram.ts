/**
 * Synchro Instagram : logique pure (sans réseau ni base), testée dans instagram.test.ts.
 *
 * 1. `relier` : quel post Instagram correspond à quelle publication (ou Reel d'essai) du site.
 * 2. `decider` : un chiffre saisi à la main n'est jamais écrasé ; la différence est signalée.
 * 3. `planPublication`, `planReelEssai`, `planMesure` : ce qu'il faut écrire en base.
 */

const REUNION_MS = 4 * 3_600_000; // La Réunion : UTC+4, sans heure d'été
const JOUR = 86_400_000;
export const DELAI_48H = 48 * 3_600_000;

// ─── Données Instagram ──────────────────────────────────────────────────────

export type PostIg = {
  id: string;
  permalink: string;
  timestamp: string; // ISO renvoyé par Instagram, ex. 2026-11-16T15:26:48+0000
  produit: string; // media_product_type : REELS, FEED…
  partageFil: boolean | null; // is_shared_to_feed : false = Trial Reel pas (encore) partagé aux abonnés
  legende: string;
};

/** Statistiques d'un post, telles qu'Instagram les donne (durée de vue en secondes). */
export type StatsIg = {
  vues: number | null;
  portee: number | null;
  partages: number | null;
  enregistrements: number | null;
  likes: number | null;
  commentaires: number | null;
  dureeVue: number | null;
};

/** Instagram renvoie les dates avec « +0000 » : Date.parse le comprend mieux avec « +00:00 ». */
export const instantPost = (p: Pick<PostIg, "timestamp">) =>
  Date.parse(p.timestamp.replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));

/** Date (AAAA-MM-JJ) du post à l'heure de La Réunion. */
export const dateReunion = (p: Pick<PostIg, "timestamp">) =>
  new Date(instantPost(p) + REUNION_MS).toISOString().slice(0, 10);

export const estReelIg = (p: Pick<PostIg, "produit">) => p.produit === "REELS";

/** Début d'une journée de La Réunion, en millisecondes. */
export const debutJour = (date: string) => Date.parse(`${date}T00:00:00+04:00`);
export const lendemain = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) + JOUR).toISOString().slice(0, 10);

type MetriqueIg = { name: string; values?: { value: number }[]; total_value?: TotalIg };
type TotalIg = {
  value: number;
  breakdowns?: { results: { dimension_values: string[]; value: number }[] }[];
};

/** Réponse de GET /{media}/insights → StatsIg. La durée de vue arrive en millisecondes. */
export function lireStatsPost(data: MetriqueIg[]): StatsIg {
  const m = (nom: string) => {
    const x = data.find((d) => d.name === nom);
    const v = x?.values?.[0]?.value ?? x?.total_value?.value;
    return typeof v === "number" ? v : null;
  };
  const ms = m("ig_reels_avg_watch_time");
  return {
    vues: m("views"),
    portee: m("reach"),
    partages: m("shares"),
    enregistrements: m("saved"),
    likes: m("likes"),
    commentaires: m("comments"),
    dureeVue: ms === null ? null : Math.round(ms / 100) / 10,
  };
}

/** Réponse de GET /{compte}/insights (total_value) → { metrique: valeur }, et part des non-abonnés. */
export function lireStatsCompte(data: MetriqueIg[]) {
  const total: Record<string, number> = {};
  const nonAbonnes: Record<string, number> = {};
  for (const d of data) {
    if (!d.total_value) continue;
    total[d.name] = d.total_value.value;
    const res = d.total_value.breakdowns?.[0]?.results;
    const non = res?.find((r) => r.dimension_values[0] === "NON_FOLLOWER");
    if (res) nonAbonnes[d.name] = non?.value ?? 0;
  }
  return { total, nonAbonnes };
}

// ─── 1. Correspondance post ↔ publication ───────────────────────────────────

export type Lien = { idA?: string; permalinkA?: string; idB?: string; permalinkB?: string; manuel?: boolean };

export type Cible = {
  type: "publication" | "reelEssai";
  id: string;
  date: string;
  heure?: string; // « 18:30 », heure de La Réunion
  reel: boolean;
  /** Reel avec une version B en Trial Reel (accroche B, ou « Trial »/« A/B » dans le format). */
  abTest: boolean;
  reporte: boolean;
  lien?: Lien;
};

export type Correspondance = { a?: PostIg; b?: PostIg };

/** Un lien Instagram collé à la main peut contenir « ?igsh=… » ou un « / » final. */
export const normaliserLien = (l: string) => {
  const m = l.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[2] : l.trim();
};

const memeLien = (post: PostIg, lien: string | undefined) => !!lien && normaliserLien(post.permalink) === normaliserLien(lien);

/**
 * Relie chaque cible du site à ses posts Instagram.
 * - Un lien collé à la main l'emporte toujours.
 * - Un lien trouvé automatiquement reste tant que le post a la même date que la publication.
 * - Sinon : même jour (heure de La Réunion) et même type (Reel ↔ Reel, carrousel ↔ post du fil).
 *   Version A = le Reel partagé aux abonnés ; version B = le Trial Reel avec la même légende.
 *   Les publications passent avant les Reels d'essai ; à égalité, l'heure prévue la plus proche gagne.
 */
export function relier(cibles: Cible[], posts: PostIg[]) {
  const libres = new Map(posts.map((p) => [p.id, p]));
  const resultat = new Map<string, Correspondance>();
  const prendre = (p: PostIg | undefined) => {
    if (p) libres.delete(p.id);
    return p;
  };
  const get = (c: Cible) => {
    const k = cle(c);
    if (!resultat.has(k)) resultat.set(k, {});
    return resultat.get(k)!;
  };
  const actives = cibles.filter((c) => !c.reporte);

  // 1. Liens enregistrés
  for (const c of actives) {
    const l = c.lien;
    if (!l) continue;
    const trouver = (id?: string, permalink?: string) =>
      [...libres.values()].find(
        (p) => (id && p.id === id) || memeLien(p, permalink),
      );
    let a = trouver(l.idA, l.permalinkA);
    let b = trouver(l.idB, l.permalinkB);
    // Lien automatique devenu faux (la date de la publication a changé) : on le refait
    if (!l.manuel) {
      if (a && dateReunion(a) !== c.date) a = undefined;
      if (b && dateReunion(b) !== c.date) b = undefined;
    }
    const r = get(c);
    if (a) r.a = prendre(a);
    if (b) r.b = prendre(b);
  }

  const compatibles = (c: Cible) =>
    [...libres.values()]
      .filter((p) => dateReunion(p) === c.date && estReelIg(p) === c.reel)
      .sort((x, y) => ecart(c, x) - ecart(c, y) || instantPost(x) - instantPost(y));

  const publications = actives.filter((c) => c.type === "publication");
  const essais = actives.filter((c) => c.type === "reelEssai");

  // 2. Publications : version A (de préférence le Reel partagé aux abonnés)
  for (const c of publications) {
    const r = get(c);
    if (r.a || (c.lien?.manuel && c.lien.permalinkA)) continue;
    const cands = compatibles(c);
    r.a = prendre(cands.find((p) => p.partageFil !== false) ?? (c.abTest ? undefined : cands[0]));
  }
  // 3. Publications avec test A/B : version B = Trial Reel du même jour, même légende que A
  for (const c of publications) {
    const r = get(c);
    if (!c.abTest || r.b) continue;
    const trials = compatibles(c).filter((p) => p.partageFil === false);
    r.b = prendre(r.a ? trials.find((p) => p.legende.trim() === r.a!.legende.trim()) : undefined);
  }
  // 4. Reels d'essai
  for (const c of essais) {
    const r = get(c);
    if (!r.a) r.a = prendre(compatibles(c)[0]);
  }
  // 5. Dernière chance : un Trial Reel restant le même jour devient la version B (ou A s'il n'y a qu'elle)
  for (const c of publications) {
    const r = get(c);
    if (!c.abTest) continue;
    const trials = compatibles(c).filter((p) => p.partageFil === false);
    if (!r.b && r.a) r.b = prendre(trials[0]);
    if (!r.a && !r.b) r.b = prendre(trials[0]);
  }

  for (const [k, r] of resultat) if (!r.a && !r.b) resultat.delete(k);
  return { correspondances: resultat, nonRelies: [...libres.values()] };
}

export const cle = (c: Pick<Cible, "type" | "id">) => `${c.type}:${c.id}`;

/** Écart (ms) entre l'heure du post et l'heure prévue ; sans heure prévue, tout se vaut. */
function ecart(c: Cible, p: PostIg) {
  if (!c.heure) return 0;
  return Math.abs(instantPost(p) - Date.parse(`${c.date}T${c.heure}:00+04:00`));
}

/** Format du site qui annonce un test A/B (novembre) ou accroche B (décembre). */
export const formatAbTest = (format: string, accrocheB?: string) =>
  accrocheB !== undefined || /trial|a\/b/i.test(format);

// ─── 2. Ne jamais écraser une saisie manuelle ───────────────────────────────

export type Decision =
  | { action: "ecrire"; valeur: number }
  | { action: "garder" }
  | { action: "conflit"; manuel: number; instagram: number };

/**
 * `actuel` : la valeur en base. `dernierAuto` : la dernière valeur écrite par la synchro (undefined si jamais).
 * - Instagram ne donne rien → on garde.
 * - Case vide, ou valeur encore égale à ce que la synchro avait écrit → on écrit.
 * - Sinon, Maxime a saisi autre chose : on garde son chiffre et on signale l'écart.
 */
export function decider(actuel: number | null | undefined, dernierAuto: number | null | undefined, instagram: number | null): Decision {
  if (instagram === null) return { action: "garder" };
  if (actuel === null || actuel === undefined) return { action: "ecrire", valeur: instagram };
  if (actuel === instagram) return { action: "ecrire", valeur: instagram }; // déjà juste : la synchro en reprend la main
  if (dernierAuto !== undefined && dernierAuto !== null && actuel === dernierAuto) return { action: "ecrire", valeur: instagram };
  return { action: "conflit", manuel: actuel, instagram };
}

export type Conflit = { champ: string; manuel: number; instagram: number };

/** Applique `decider` à une liste de champs. `auto` = valeurs écrites par la synchro, par champ. */
export function fusionner(
  champs: { champ: string; actuel: number | null | undefined; instagram: number | null }[],
  auto: Record<string, number | null>,
) {
  const ecrire: Record<string, number> = {};
  const conflits: Conflit[] = [];
  const nouvelAuto = { ...auto };
  for (const { champ, actuel, instagram } of champs) {
    const d = decider(actuel, auto[champ], instagram);
    if (d.action === "ecrire") {
      ecrire[champ] = d.valeur;
      nouvelAuto[champ] = d.valeur;
    } else if (d.action === "conflit") conflits.push({ champ, manuel: d.manuel, instagram: d.instagram });
  }
  return { ecrire, conflits, auto: nouvelAuto };
}

// ─── 3. Ce que la synchro écrit ─────────────────────────────────────────────

type Resultats = {
  vues: number | null;
  nonAbonnes: number | null;
  dureeVue: number | null;
  partages: number | null;
  enregistrements: number | null;
  messages: number | null;
};

export type PublicationSync = {
  date: string;
  statut: string;
  vues48h: number | null;
  resultats?: Resultats;
  resultatsB?: Resultats;
  auto: Record<string, number | null>;
};

/**
 * Vues à 48 h : Instagram ne donne que le total du jour. La synchro le relève tant que le post a moins
 * de 48 h ; ensuite le dernier relevé reste. Un post déjà plus vieux ne remplit pas ce champ.
 */
export const vues48hDispo = (post: PostIg, stats: StatsIg, maintenant: number) =>
  maintenant - instantPost(post) <= DELAI_48H ? stats.vues : null;

/** Champs remplis depuis Instagram. Restent manuels : messages, PROJET, % non-abonnés (pas donné par post). */
const CHAMPS_RESULTATS = ["vues", "dureeVue", "partages", "enregistrements"] as const;

export function planPublication(
  pub: PublicationSync,
  a: { post: PostIg; stats: StatsIg } | undefined,
  b: { post: PostIg; stats: StatsIg } | undefined,
  maintenant: number,
) {
  const champs: { champ: string; actuel: number | null | undefined; instagram: number | null }[] = [];
  if (pub.resultats) {
    for (const [cleV, versionPost, res] of [
      ["A", a, pub.resultats],
      ["B", b, pub.resultatsB],
    ] as const) {
      if (!versionPost || !res) continue;
      for (const k of CHAMPS_RESULTATS) {
        if (k === "dureeVue" && !estReelIg(versionPost.post)) continue;
        champs.push({ champ: `${cleV}-${k}`, actuel: res[k], instagram: versionPost.stats[k] });
      }
    }
  } else if (a) {
    champs.push({ champ: "vues48h", actuel: pub.vues48h, instagram: vues48hDispo(a.post, a.stats, maintenant) });
  }

  const { ecrire, conflits, auto } = fusionner(champs, pub.auto);
  const patch: { vues48h?: number; resultats?: Resultats; resultatsB?: Resultats; statut?: "publie" } = {};
  if ("vues48h" in ecrire) patch.vues48h = ecrire.vues48h;
  for (const [v, champ] of [
    ["A", "resultats"],
    ["B", "resultatsB"],
  ] as const) {
    const base = pub[champ];
    const maj = Object.entries(ecrire).filter(([k]) => k.startsWith(`${v}-`));
    if (base && maj.length) patch[champ] = { ...base, ...Object.fromEntries(maj.map(([k, x]) => [k.slice(2), x])) };
  }
  // Un post trouvé sur Instagram = la publication est en ligne
  if ((a || b) && (pub.statut === "a-preparer" || pub.statut === "tourne")) patch.statut = "publie";
  return { patch, conflits, auto };
}

export function planReelEssai(
  reel: { vues48h: number | null; statut: string; auto: Record<string, number | null> },
  a: { post: PostIg; stats: StatsIg },
  maintenant: number,
) {
  const { ecrire, conflits, auto } = fusionner(
    [{ champ: "vues48h", actuel: reel.vues48h, instagram: vues48hDispo(a.post, a.stats, maintenant) }],
    reel.auto,
  );
  const patch: { vues48h?: number; statut?: "publie" | "partage" } = {};
  if ("vues48h" in ecrire) patch.vues48h = ecrire.vues48h;
  if (reel.statut === "a-preparer") patch.statut = a.post.partageFil ? "partage" : "publie";
  else if (reel.statut === "publie" && a.post.partageFil) patch.statut = "partage";
  return { patch, conflits, auto };
}

// ─── Indicateurs de la semaine ──────────────────────────────────────────────

export type StatsSemaine = {
  /** Totaux du compte sur la semaine (profile_views, website_clicks, reach, views…). */
  total: Record<string, number>;
  /** Part non-abonnés (reach, views). */
  nonAbonnes: Record<string, number>;
  /** Posts publiés dans la semaine, avec leurs stats. */
  posts: { post: PostIg; stats: StatsIg }[];
};

/**
 * Valeur Instagram d'un indicateur de la semaine, ou null s'il reste manuel.
 * « Vues des non-abonnés » (décembre) = vues ; « Comptes touchés non abonnés » (novembre) = comptes touchés.
 */
export function valeurIndicateur(ind: { key: string; label: string }, s: StatsSemaine): number | null {
  const somme = (f: (x: StatsIg) => number | null) =>
    s.posts.length ? s.posts.reduce((t, p) => t + (f(p.stats) ?? 0), 0) : null;
  switch (ind.key) {
    case "reach_non_followers":
      return (/^vues/i.test(ind.label) ? s.nonAbonnes.views : s.nonAbonnes.reach) ?? null;
    case "profile_visits":
      return s.total.profile_views ?? null;
    case "link_clicks":
      return s.total.website_clicks ?? null;
    case "shares_saves":
      return somme((x) => (x.partages ?? 0) + (x.enregistrements ?? 0));
    case "reel_watch_time": {
      const durees = s.posts.map((p) => p.stats.dureeVue).filter((d): d is number => d !== null);
      return durees.length ? Math.round((durees.reduce((t, d) => t + d, 0) / durees.length) * 10) / 10 : null;
    }
    default:
      return null;
  }
}

export const INDICATEURS_INSTAGRAM = ["reach_non_followers", "profile_visits", "link_clicks", "shares_saves", "reel_watch_time"];

/** Mesure d'une semaine : même règle que les publications (auto = dernière valeur écrite par la synchro). */
export function planMesure(actuel: number | null | undefined, auto: number | null | undefined, instagram: number | null) {
  return decider(actuel, auto, instagram);
}

/** Posts publiés entre deux dates incluses (heure de La Réunion). */
export const postsEntre = <T extends { post: PostIg }>(posts: T[], debut: string, fin: string) =>
  posts.filter((p) => {
    const d = dateReunion(p.post);
    return d >= debut && d <= fin;
  });
