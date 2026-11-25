import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { verifierAcces } from "./acces";

export const toggleItem = mutation({
  args: { token: v.string(), id: v.id("controleItems"), coche: v.boolean() },
  handler: async (ctx, { token, id, coche }) => {
    verifierAcces(token);
    await ctx.db.patch(id, { coche });
  },
});

export const setNotes = mutation({
  args: { token: v.string(), id: v.id("controles"), notes: v.string() },
  handler: async (ctx, { token, id, notes }) => {
    verifierAcces(token);
    await ctx.db.patch(id, { notes });
  },
});
