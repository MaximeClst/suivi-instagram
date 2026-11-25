import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
  type ActionCtx,
} from "./_generated/server";
import { verifierAcces } from "./acces";
import { statsIg } from "./schema";
import {
  INDICATEURS_INSTAGRAM,
  cle,
  dateReunion,
  debutJour,
  estReelIg,
  formatAbTest,
  instantPost,
  lendemain,
  lireStatsCompte,
  lireStatsPost,
  normaliserLien,
  planMesure,
  planPublication,
  planReelEssai,
  postsEntre,
  relier,
  valeurIndicateur,
  type Cible,
  type PostIg,
  type StatsIg,
} from "../lib/instagram";

/**
 * Synchro des statistiques Instagram de @code_celeste via Treg (connexion Instagram de l'équipe, gratuite).
 * Le jeton Treg vit uniquement dans la variable d'environnement Convex TREG_TOKEN : jamais dans le code
 * ni dans le navigateur. Le navigateur appelle `synchroniser` avec le mot de passe du site, comme partout.
 */

const TREG = "https://treg.to/call/instagram";
const IG_USER_ID = process.env.INSTAGRAM_USER_ID ?? "17841479002763239"; // @code_celeste (pas un secret)
const JOUR = 86_400_000;
const FENETRE_PUBLICATIONS = 60 * JOUR; // publications des 60 derniers jours
const FENETRE_SEMAINES = 45 * JOUR; // semaines terminées depuis moins de 45 jours

async function treg(chemin: string, params: Record<string, string | number>) {
  const jeton = process.env.TREG_TOKEN;
  if (!jeton) throw new ConvexError("TREG_TOKEN manquant dans les variables d'environnement Convex");
  const url = `${TREG}/${chemin}?${new URLSearchParams(Object.entries(params).map(([k, x]) => [k, String(x)]))}`;
  const res = await fetch(url, { headers: { "X-Treg-Token": jeton } });
  const corps = await res.json().catch(() => null);
  if (!res.ok || corps?.error) {
    const msg = corps?.error?.message ?? corps?.message ?? `HTTP ${res.status}`;
    throw new Error(`Instagram (${chemin.split("?")[0]}) : ${msg}`);
  }
  return corps;
}

type MediaBrut = {
  id: string;
  permalink: string;
  timestamp: string;
  media_product_type?: string;
  is_shared_to_feed?: boolean;
  caption?: string;
};

/** Posts du compte, du plus récent au plus ancien, jusqu'à `depuis` (ms). */
async function listerPosts(depuis: number): Promise<PostIg[]> {
  const posts: PostIg[] = [];
  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const corps = await treg(`${IG_USER_ID}/media`, {
      fields: "id,permalink,timestamp,media_product_type,is_shared_to_feed,caption",
      limit: 50,
      ...(after ? { after } : {}),
    });
    const data: MediaBrut[] = corps.data ?? [];
    for (const m of data) {
      posts.push({
        id: m.id,
        permalink: m.permalink,
        timestamp: m.timestamp,
        produit: m.media_product_type ?? "FEED",
        partageFil: m.is_shared_to_feed ?? null,
        legende: m.caption ?? "",
      });
    }
    after = corps.paging?.cursors?.after;
    const plusVieux = data.at(-1);
    if (!corps.paging?.next || !after || !plusVieux || instantPost(plusVieux) < depuis) break;
  }
  return posts;
}

const METRIQUES_REEL = "views,reach,saved,likes,comments,shares,ig_reels_avg_watch_time";
const METRIQUES_FIL = "views,reach,saved,likes,comments,shares";

async function statsPost(post: PostIg): Promise<StatsIg> {
  try {
    const corps = await treg(`${post.id}/insights`, { metric: estReelIg(post) ? METRIQUES_REEL : METRIQUES_FIL });
    return lireStatsPost(corps.data ?? []);
  } catch {
    // Certains types de posts refusent une métrique : on retente avec l'essentiel
    const corps = await treg(`${post.id}/insights`, { metric: "reach,saved,likes,comments,shares" });
    return lireStatsPost(corps.data ?? []);
  }
}

/** Totaux du compte entre deux dates incluses (heure de La Réunion). */
async function statsCompte(debut: string, fin: string, maintenant: number) {
  const since = Math.floor(debutJour(debut) / 1000);
  const until = Math.floor(Math.min(debutJour(lendemain(fin)), maintenant) / 1000);
  const base = { period: "day", metric_type: "total_value", since, until };
  const [profil, audience] = await Promise.all([
    treg(`${IG_USER_ID}/insights`, { ...base, metric: "profile_views,website_clicks" }),
    treg(`${IG_USER_ID}/insights`, { ...base, metric: "reach,views", breakdown: "follow_type" }),
  ]);
  const a = lireStatsCompte(profil.data ?? []);
  const b = lireStatsCompte(audience.data ?? []);
  return { total: { ...a.total, ...b.total }, nonAbonnes: b.nonAbonnes };
}

/** Exécute `f` sur chaque élément, `n` à la fois (pour ne pas bombarder Instagram). */
async function parPaquets<T, R>(items: T[], n: number, f: (x: T) => Promise<R>) {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += n) out.push(...(await Promise.all(items.slice(i, i + n).map(f))));
  return out;
}

const iso = (ms: number) => new Date(ms + 4 * 3_600_000).toISOString().slice(0, 10);

// ─── Lecture / écriture en base ─────────────────────────────────────────────

export const donnees = internalQuery({
  args: { depuis: v.string(), aujourdhui: v.string(), depuisSemaines: v.string() },
  handler: async (ctx, { depuis, aujourdhui, depuisSemaines }) => {
    const publications = (await ctx.db.query("publications").collect()).filter(
      (p) => p.date >= depuis && p.date <= aujourdhui,
    );
    const reels = await ctx.db
      .query("reelsEssai")
      .withIndex("by_date", (q) => q.gte("date", depuis).lte("date", aujourdhui))
      .collect();
    const semaines = (await ctx.db.query("semaines").collect()).filter(
      (s) => s.debut <= aujourdhui && s.fin >= depuisSemaines,
    );
    const indicateurs = await ctx.db.query("indicateurs").collect();
    return { publications, reels, semaines, indicateurs };
  },
});

const postV = v.object({
  id: v.string(),
  permalink: v.string(),
  timestamp: v.string(),
  produit: v.string(),
  partageFil: v.union(v.boolean(), v.null()),
  legende: v.string(),
});
const versionV = v.optional(v.object({ post: postV, stats: statsIg }));

type LienIg = NonNullable<Doc<"publications">["instagram"]>;
const VIDE: LienIg = { auto: {}, conflits: [] };

export const appliquer = internalMutation({
  args: {
    maintenant: v.number(),
    publications: v.array(v.object({ id: v.id("publications"), a: versionV, b: versionV })),
    reels: v.array(v.object({ id: v.id("reelsEssai"), a: v.object({ post: postV, stats: statsIg }) })),
    mesures: v.array(v.object({ semaineId: v.id("semaines"), key: v.string(), instagram: v.union(v.number(), v.null()) })),
  },
  handler: async (ctx, { maintenant, publications, reels, mesures }) => {
    let misesAJour = 0;
    let conflits = 0;

    for (const { id, a, b } of publications) {
      const pub = await ctx.db.get(id);
      if (!pub) continue;
      const lien: LienIg = pub.instagram ?? VIDE;
      const plan = planPublication({ ...pub, auto: lien.auto }, a, b, maintenant);
      misesAJour += Object.keys(plan.patch).length;
      conflits += plan.conflits.length;
      await ctx.db.patch(id, {
        ...plan.patch,
        instagram: {
          ...lien,
          // Un lien collé à la main reste tel quel ; sinon on mémorise celui trouvé
          idA: a?.post.id ?? (lien.manuel ? lien.idA : undefined),
          permalinkA: a?.post.permalink ?? (lien.manuel ? lien.permalinkA : undefined),
          idB: b?.post.id ?? (lien.manuel ? lien.idB : undefined),
          permalinkB: b?.post.permalink ?? (lien.manuel ? lien.permalinkB : undefined),
          statsA: a?.stats ?? (lien.manuel ? lien.statsA : undefined),
          statsB: b?.stats ?? (lien.manuel ? lien.statsB : undefined),
          auto: plan.auto,
          conflits: plan.conflits,
          syncAt: maintenant,
        },
      });
    }

    for (const { id, a } of reels) {
      const reel = await ctx.db.get(id);
      if (!reel) continue;
      const lien: LienIg = reel.instagram ?? VIDE;
      const plan = planReelEssai({ ...reel, auto: lien.auto }, a, maintenant);
      misesAJour += Object.keys(plan.patch).length;
      conflits += plan.conflits.length;
      await ctx.db.patch(id, {
        ...plan.patch,
        instagram: {
          ...lien,
          idA: a.post.id,
          permalinkA: a.post.permalink,
          statsA: a.stats,
          auto: plan.auto,
          conflits: plan.conflits,
          syncAt: maintenant,
        },
      });
    }

    for (const { semaineId, key, instagram } of mesures) {
      const m = await ctx.db
        .query("mesures")
        .withIndex("by_semaine_indicateur", (q) => q.eq("semaineId", semaineId).eq("indicateurKey", key))
        .unique();
      const d = planMesure(m?.valeur, m?.auto, instagram);
      if (d.action === "conflit") conflits++;
      if (d.action === "ecrire" && m?.valeur !== d.valeur) misesAJour++;
      if (d.action === "ecrire") {
        const ecrit = { valeur: d.valeur, auto: d.valeur, instagram };
        if (m) await ctx.db.patch(m._id, ecrit);
        else await ctx.db.insert("mesures", { semaineId, indicateurKey: key, ...ecrit });
      } else if (m) await ctx.db.patch(m._id, { instagram });
    }
    return { misesAJour, conflits };
  },
});

export const enregistrer = internalMutation({
  args: {
    debut: v.number(),
    origine: v.union(v.literal("bouton"), v.literal("auto")),
    ok: v.boolean(),
    message: v.string(),
    misesAJour: v.number(),
    conflits: v.number(),
    nonRelies: v.array(v.object({ date: v.string(), type: v.string(), permalink: v.string(), legende: v.string() })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("synchrosInstagram", { ...args, fin: Date.now() });
    // On ne garde que les 50 dernières
    const vieilles = await ctx.db.query("synchrosInstagram").withIndex("by_debut").order("desc").collect();
    for (const s of vieilles.slice(50)) await ctx.db.delete(s._id);
  },
});

// ─── La synchro ─────────────────────────────────────────────────────────────

/** Indicateurs d'un mois : sa propre liste s'il en a une, sinon la liste commune (novembre). */
const indicateursDu = (tous: Doc<"indicateurs">[], mois: string) =>
  tous.some((i) => i.mois === mois) ? tous.filter((i) => i.mois === mois) : tous.filter((i) => !i.mois);

type ResultatSynchro = {
  ok: boolean;
  message: string;
  misesAJour: number;
  conflits: number;
  nonRelies: { date: string; type: string; permalink: string; legende: string }[];
};
type DonneesSync = {
  publications: Doc<"publications">[];
  reels: Doc<"reelsEssai">[];
  semaines: Doc<"semaines">[];
  indicateurs: Doc<"indicateurs">[];
};

async function synchroniserTout(ctx: ActionCtx, origine: "bouton" | "auto"): Promise<ResultatSynchro> {
  const debut = Date.now();
  try {
    const aujourdhui = iso(debut);
    const depuis = iso(debut - FENETRE_PUBLICATIONS);
    const depuisSemaines = iso(debut - FENETRE_SEMAINES);
    const { publications, reels, semaines, indicateurs }: DonneesSync = await ctx.runQuery(internal.instagram.donnees, {
      depuis,
      aujourdhui,
      depuisSemaines,
    });

    const plusAncien = [depuis, ...semaines.map((s) => s.debut)].sort()[0];
    const posts = (await listerPosts(debutJour(plusAncien))).filter((p) => dateReunion(p) >= plusAncien);
    const stats = new Map(
      await parPaquets(posts, 4, async (p) => [p.id, await statsPost(p)] as const),
    );
    const avecStats = posts.map((post) => ({ post, stats: stats.get(post.id)! }));

    // Correspondance post ↔ publication
    const cibles: Cible[] = [
      ...publications.map((p) => ({
        type: "publication" as const,
        id: p._id,
        date: p.date,
        heure: p.heure,
        reel: /^reel/i.test(p.format),
        abTest: formatAbTest(p.format, p.accrocheB),
        reporte: p.statut === "reporte",
        lien: p.instagram,
      })),
      ...reels.map((r) => ({
        type: "reelEssai" as const,
        id: r._id,
        date: r.date,
        heure: r.heure,
        reel: true,
        abTest: false,
        reporte: false,
        lien: r.instagram,
      })),
    ];
    const { correspondances, nonRelies } = relier(cibles, posts);
    const version = (p?: PostIg) => (p ? { post: p, stats: stats.get(p.id)! } : undefined);

    const pubsMaj = publications.flatMap((p) => {
      const c = correspondances.get(cle({ type: "publication", id: p._id }));
      return c ? [{ id: p._id, a: version(c.a), b: version(c.b) }] : [];
    });
    const reelsMaj = reels.flatMap((r) => {
      const c = correspondances.get(cle({ type: "reelEssai", id: r._id }));
      const a = version(c?.a ?? c?.b);
      return a ? [{ id: r._id, a }] : [];
    });

    // Indicateurs de chaque semaine
    const mesures: { semaineId: Id<"semaines">; key: string; instagram: number | null }[] = [];
    for (const s of semaines) {
      const aSynchroniser = indicateursDu(indicateurs, s.mois).filter((i) => INDICATEURS_INSTAGRAM.includes(i.key));
      if (!aSynchroniser.length) continue;
      const compte = await statsCompte(s.debut, s.fin, debut);
      const semaine = { ...compte, posts: postsEntre(avecStats, s.debut, s.fin) };
      for (const i of aSynchroniser) mesures.push({ semaineId: s._id, key: i.key, instagram: valeurIndicateur(i, semaine) });
    }

    const { misesAJour, conflits }: { misesAJour: number; conflits: number } = await ctx.runMutation(internal.instagram.appliquer, {
      maintenant: debut,
      publications: pubsMaj,
      reels: reelsMaj,
      mesures,
    });
    const nonReliesRecents = nonRelies
      .filter((p) => dateReunion(p) >= depuis)
      .map((p) => ({
        date: dateReunion(p),
        type: estReelIg(p) ? (p.partageFil === false ? "Trial Reel" : "Reel") : "Post",
        permalink: p.permalink,
        legende: p.legende.slice(0, 80),
      }));
    const resultat = {
      ok: true,
      message: `${posts.length} posts lus, ${pubsMaj.length + reelsMaj.length} reliés, ${mesures.length} indicateurs`,
      misesAJour,
      conflits,
      nonRelies: nonReliesRecents,
    };
    await ctx.runMutation(internal.instagram.enregistrer, { debut, origine, ...resultat });
    return resultat;
  } catch (e) {
    const message = e instanceof ConvexError ? String(e.data) : e instanceof Error ? e.message : String(e);
    await ctx.runMutation(internal.instagram.enregistrer, {
      debut,
      origine,
      ok: false,
      message,
      misesAJour: 0,
      conflits: 0,
      nonRelies: [],
    });
    return { ok: false, message, misesAJour: 0, conflits: 0, nonRelies: [] };
  }
}

/** Bouton « Mettre à jour depuis Instagram ». */
export const synchroniser = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<ResultatSynchro> => {
    verifierAcces(token);
    return synchroniserTout(ctx, "bouton");
  },
});

/** Synchro planifiée (convex/crons.ts). */
export const synchroniserAuto = internalAction({
  args: {},
  handler: async (ctx) => {
    await synchroniserTout(ctx, "auto");
  },
});

// ─── Pour le site ───────────────────────────────────────────────────────────

export const derniere = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    verifierAcces(token);
    const [derniere] = await ctx.db.query("synchrosInstagram").withIndex("by_debut").order("desc").take(1);
    return derniere ?? null;
  },
});

/** « Prendre le chiffre d'Instagram » sur un écart signalé (publication ou Reel d'essai). */
export const accepter = mutation({
  args: {
    token: v.string(),
    publication: v.optional(v.id("publications")),
    reelEssai: v.optional(v.id("reelsEssai")),
    champ: v.string(),
  },
  handler: async (ctx, { token, publication, reelEssai, champ }) => {
    verifierAcces(token);
    const id = publication ?? reelEssai;
    if (!id) return;
    const doc = await ctx.db.get(id);
    const lien = doc?.instagram;
    const c = lien?.conflits.find((x) => x.champ === champ);
    if (!doc || !lien || !c) return;
    const instagram = { ...lien, auto: { ...lien.auto, [champ]: c.instagram }, conflits: lien.conflits.filter((x) => x !== c) };
    if (champ === "vues48h") return ctx.db.patch(id, { vues48h: c.instagram, instagram });
    const [version, k] = champ.split("-") as ["A" | "B", string];
    const cleRes = version === "A" ? "resultats" : "resultatsB";
    if (!("resultats" in doc)) return;
    const res = doc[cleRes];
    if (!res) return;
    await ctx.db.patch(id as Id<"publications">, { [cleRes]: { ...res, [k]: c.instagram }, instagram });
  },
});

/** « Prendre le chiffre d'Instagram » pour un indicateur de la semaine. */
export const accepterMesure = mutation({
  args: { token: v.string(), id: v.id("mesures") },
  handler: async (ctx, { token, id }) => {
    verifierAcces(token);
    const m = await ctx.db.get(id);
    if (!m || m.instagram === undefined || m.instagram === null) return;
    await ctx.db.patch(id, { valeur: m.instagram, auto: m.instagram });
  },
});

/** Relier une publication à son post en collant le lien Instagram (vide = revenir à l'automatique). */
export const lier = mutation({
  args: {
    token: v.string(),
    id: v.id("publications"),
    permalinkA: v.string(),
    permalinkB: v.string(),
  },
  handler: async (ctx, { token, id, permalinkA, permalinkB }) => {
    verifierAcces(token);
    const pub = await ctx.db.get(id);
    if (!pub) return;
    const a = permalinkA.trim();
    const b = permalinkB.trim();
    for (const l of [a, b]) if (l && !/instagram\.com\//.test(l)) throw new ConvexError("Colle un lien instagram.com");
    const lien: LienIg = pub.instagram ?? VIDE;
    await ctx.db.patch(id, {
      instagram: {
        ...lien,
        manuel: !!(a || b),
        idA: a && normaliserLien(a) === normaliserLien(lien.permalinkA ?? "") ? lien.idA : undefined,
        permalinkA: a || undefined,
        idB: b && normaliserLien(b) === normaliserLien(lien.permalinkB ?? "") ? lien.idB : undefined,
        permalinkB: b || undefined,
      },
    });
  },
});
