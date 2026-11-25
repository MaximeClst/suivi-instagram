import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { verifierAcces } from "./acces";
import { cta, pilier, resultats, script, statut } from "./schema";

const nombre = v.union(v.number(), v.null());

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("publications"),
    patch: v.object({
      date: v.optional(v.string()),
      pilier: v.optional(pilier),
      format: v.optional(v.string()),
      metier: v.optional(v.string()),
      accroche: v.optional(v.string()),
      statut: v.optional(statut),
      vues48h: v.optional(nombre),
      projetRecus: v.optional(nombre),
      heure: v.optional(v.string()),
      cta: v.optional(cta),
      accrocheB: v.optional(v.string()),
      resultats: v.optional(resultats),
      resultatsB: v.optional(resultats),
      clientMontre: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { token, id, patch }) => {
    verifierAcces(token);
    await ctx.db.patch(id, patch);
  },
});

export const create = mutation({
  args: { token: v.string(), mois: v.string(), date: v.string() },
  handler: async (ctx, { token, mois, date }) => {
    verifierAcces(token);
    return ctx.db.insert("publications", {
      mois,
      date,
      pilier: "prise-de-conscience",
      format: "Reel",
      metier: "Tous",
      accroche: "Nouvelle accroche",
      statut: "a-preparer",
      vues48h: null,
      projetRecus: null,
    });
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("publications") },
  handler: async (ctx, { token, id }) => {
    verifierAcces(token);
    await ctx.db.delete(id);
  },
});

/** Remplace le script d'une publication (modifié depuis la fiche script). */
export const setScript = mutation({
  args: { token: v.string(), id: v.id("publications"), script },
  handler: async (ctx, { token, id, script }) => {
    verifierAcces(token);
    await ctx.db.patch(id, { script });
  },
});
