import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { verifierAcces } from "./acces";
import { sourceAudit, statutAudit } from "./schema";

export const create = mutation({
  args: { token: v.string(), date: v.string() },
  handler: async (ctx, { token, date }) => {
    verifierAcces(token);
    return ctx.db.insert("miniAudits", {
      date,
      prenom: "",
      metier: "",
      commune: "",
      source: "reel",
      statut: "envoye",
      entrainement: false,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("miniAudits"),
    patch: v.object({
      date: v.optional(v.string()),
      prenom: v.optional(v.string()),
      metier: v.optional(v.string()),
      commune: v.optional(v.string()),
      source: v.optional(sourceAudit),
      statut: v.optional(statutAudit),
      entrainement: v.optional(v.boolean()),
      note: v.optional(v.union(v.number(), v.null())),
    }),
  },
  handler: async (ctx, { token, id, patch }) => {
    verifierAcces(token);
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("miniAudits") },
  handler: async (ctx, { token, id }) => {
    verifierAcces(token);
    await ctx.db.delete(id);
  },
});
