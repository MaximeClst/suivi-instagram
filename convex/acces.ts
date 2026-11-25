import { ConvexError } from "convex/values";

/**
 * Outil privé : chaque fonction exige le mot de passe d'accès (APP_PASSWORD),
 * transmis par le site après connexion. Sans lui, aucune donnée n'est lisible.
 */
export function verifierAcces(token: string) {
  const attendu = process.env.APP_PASSWORD;
  if (!attendu || token !== attendu) {
    throw new ConvexError("Accès refusé");
  }
}
