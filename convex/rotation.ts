import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifierAcces } from "./acces";

/** Tous les contenus qui ont un « Client montré » (publications de tous les mois, stories), et les accords cochés. */
export const liste = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    verifierAcces(token);
    const [publications, stories, accords] = await Promise.all([
      ctx.db.query("publications").collect(),
      ctx.db.query("stories").collect(),
      ctx.db.query("accordsClients").collect(),
    ]);
    return {
      publications: publications
        .filter((p) => p.clientMontre)
        .map((p) => ({ date: p.date, contenu: p.format, texte: p.clientMontre as string })),
      stories: stories
        .filter((s) => s.client)
        .map((s) => ({ date: s.date, contenu: `Story · ${s.theme}`, texte: s.client as string })),
      accords: Object.fromEntries(accords.map((a) => [a.cle, a.accord])),
    };
  },
});

export const setAccord = mutation({
  args: { token: v.string(), cle: v.string(), accord: v.boolean() },
  handler: async (ctx, { token, cle, accord }) => {
    verifierAcces(token);
    const existant = await ctx.db.query("accordsClients").withIndex("by_cle", (q) => q.eq("cle", cle)).first();
    if (existant) await ctx.db.patch(existant._id, { accord });
    else await ctx.db.insert("accordsClients", { cle, accord });
  },
});
