import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifierAcces } from "./acces";

const NOMS_MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOUR = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const jjmm = (d: string) => `${Number(d.slice(8, 10))}/${Number(d.slice(5, 7))}`;

export const liste = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    verifierAcces(token);
    const mois = await ctx.db.query("mois").collect();
    return mois.sort((a, b) => a.key.localeCompare(b.key)).map(({ key, label }) => ({ key, label }));
  },
});

/** Tout ce qu'il faut pour afficher un mois : publications, semaines, mesures, règles, points de contrôle. */
export const get = query({
  args: { token: v.string(), mois: v.string() },
  handler: async (ctx, { token, mois }) => {
    verifierAcces(token);
    const moisDoc = await ctx.db.query("mois").withIndex("by_key", (q) => q.eq("key", mois)).unique();
    if (!moisDoc) return null;

    const [publications, semaines, tousIndicateurs, toutesRegles, controles] = await Promise.all([
      ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", mois)).collect(),
      ctx.db.query("semaines").withIndex("by_mois", (q) => q.eq("mois", mois)).collect(),
      ctx.db.query("indicateurs").withIndex("by_ordre").collect(),
      ctx.db.query("regles").withIndex("by_ordre").collect(),
      ctx.db.query("controles").withIndex("by_mois", (q) => q.eq("mois", mois)).collect(),
    ]);

    // Un mois avec sa propre liste l'utilise, sinon la liste commune (novembre)
    const duMois = <T extends { mois?: string }>(liste: T[]) =>
      liste.some((x) => x.mois === mois) ? liste.filter((x) => x.mois === mois) : liste.filter((x) => !x.mois);
    const indicateurs = duMois(tousIndicateurs);
    const regles = duMois(toutesRegles);

    const mesures = (
      await Promise.all(
        semaines.map((s) =>
          ctx.db.query("mesures").withIndex("by_semaine_indicateur", (q) => q.eq("semaineId", s._id)).collect(),
        ),
      )
    ).flat();

    const controlesAvecItems = await Promise.all(
      controles.map(async (c) => ({
        ...c,
        items: await ctx.db.query("controleItems").withIndex("by_controle", (q) => q.eq("controleId", c._id)).collect(),
      })),
    );

    // La série de Reels d'essai est suivie en entier (classement) sur chaque mois où l'un d'eux est publié
    const tousReels = await ctx.db.query("reelsEssai").withIndex("by_date").collect();
    const reelsEssai = tousReels.some((r) => r.date.startsWith(mois)) ? tousReels : [];

    // Stories des semaines du mois (S0 peut commencer le mois précédent) et jusqu'au dernier jour du mois
    const [annee, m] = mois.split("-").map(Number);
    const dernierJour = iso(Date.UTC(annee, m, 0));
    const debut = semaines[0]?.debut ?? `${mois}-01`;
    const finSemaines = semaines.at(-1)?.fin ?? dernierJour;
    const fin = finSemaines > dernierJour ? finSemaines : dernierJour;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_date", (q) => q.gte("date", debut).lte("date", fin))
      .collect();

    const miniAudits = await ctx.db
      .query("miniAudits")
      .withIndex("by_date", (q) => q.gte("date", debut).lte("date", fin))
      .collect();

    return {
      mois: moisDoc,
      miniAudits,
      publications,
      semaines,
      indicateurs,
      mesures,
      regles,
      controles: controlesAvecItems,
      reelsEssai,
      stories,
    };
  },
});

/**
 * Crée un nouveau mois : semaines S0 à S4+ (S0 = semaine de référence juste avant),
 * et deux points de contrôle (fin S2, fin de mois) repris du mois précédent.
 * Les publications s'ajoutent ensuite depuis le calendrier.
 */
export const creer = mutation({
  args: { token: v.string(), key: v.string() },
  handler: async (ctx, { token, key }) => {
    verifierAcces(token);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) throw new ConvexError("Format attendu : AAAA-MM");
    const existant = await ctx.db.query("mois").withIndex("by_key", (q) => q.eq("key", key)).unique();
    if (existant) throw new ConvexError("Ce mois existe déjà");

    const [annee, m] = key.split("-").map(Number);
    await ctx.db.insert("mois", { key, label: `${NOMS_MOIS[m - 1]} ${annee}` });

    // S0 démarre le lendemain de la dernière semaine connue, sinon le lundi précédant le 1er lundi du mois
    const tousMois = (await ctx.db.query("mois").collect()).map((x) => x.key).filter((k) => k < key).sort();
    const precedent = tousMois.at(-1);
    const semainesPrec = precedent
      ? await ctx.db.query("semaines").withIndex("by_mois", (q) => q.eq("mois", precedent)).collect()
      : [];
    const premier = Date.UTC(annee, m - 1, 1);
    const finMois = Date.UTC(annee, m, 0);
    const premierLundi = premier + ((8 - new Date(premier).getUTCDay()) % 7) * JOUR;
    let debut = semainesPrec.length
      ? Date.parse(semainesPrec[semainesPrec.length - 1].fin) + JOUR
      : premierLundi - 7 * JOUR;

    const semaines: { code: string; debut: string; fin: string }[] = [];
    for (let n = 0; debut <= finMois; n++, debut += 7 * JOUR) {
      semaines.push({ code: `S${n}`, debut: iso(debut), fin: iso(debut + 6 * JOUR) });
    }
    for (const [ordre, s] of semaines.entries()) {
      await ctx.db.insert("semaines", { ...s, mois: key, ordre });
    }

    // Points de contrôle : mêmes checklists que le mois précédent, décochées
    const controlesPrec = precedent
      ? await ctx.db.query("controles").withIndex("by_mois", (q) => q.eq("mois", precedent)).collect()
      : [];
    const cibles = [semaines[Math.min(2, semaines.length - 1)], semaines[semaines.length - 1]];
    for (const [i, cible] of cibles.entries()) {
      const modele = controlesPrec[i];
      const codes = semaines.slice(0, semaines.indexOf(cible) + 1).map((s) => s.code);
      const controleId = await ctx.db.insert("controles", {
        mois: key,
        date: cible.fin,
        titre: `Dimanche ${jjmm(cible.fin)} (fin ${cible.code})`,
        semaines: codes,
        notes: "",
      });
      const items = modele
        ? await ctx.db.query("controleItems").withIndex("by_controle", (q) => q.eq("controleId", modele._id)).collect()
        : [];
      for (const item of items) {
        await ctx.db.insert("controleItems", { controleId, label: item.label, coche: false, ordre: item.ordre });
      }
    }
    return key;
  },
});
