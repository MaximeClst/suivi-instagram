import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { verifierAcces } from "./acces";

export const setMesure = mutation({
  args: {
    token: v.string(),
    semaineId: v.id("semaines"),
    indicateurKey: v.string(),
    valeur: v.union(v.number(), v.null()),
  },
  handler: async (ctx, { token, semaineId, indicateurKey, valeur }) => {
    verifierAcces(token);
    const existante = await ctx.db
      .query("mesures")
      .withIndex("by_semaine_indicateur", (q) => q.eq("semaineId", semaineId).eq("indicateurKey", indicateurKey))
      .unique();
    if (existante) await ctx.db.patch(existante._id, { valeur });
    else await ctx.db.insert("mesures", { semaineId, indicateurKey, valeur });
  },
});

export const updateRegle = mutation({
  args: {
    token: v.string(),
    id: v.id("regles"),
    patch: v.object({ probleme: v.optional(v.string()), action: v.optional(v.string()) }),
  },
  handler: async (ctx, { token, id, patch }) => {
    verifierAcces(token);
    await ctx.db.patch(id, patch);
  },
});
