import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const pilier = v.union(
  v.literal("prise-de-conscience"),
  v.literal("objections"),
  v.literal("preuves"),
  v.literal("personal-brand"),
);

export const statut = v.union(
  v.literal("a-preparer"),
  v.literal("tourne"),
  v.literal("publie"),
  v.literal("reporte"),
);

export const condition = v.union(
  v.object({ type: v.literal("stagne"), k: v.string() }),
  v.object({ type: v.literal("monte-et-stagne"), a: v.string(), b: v.string() }),
  v.object({ type: v.literal("monte-et-zero"), a: v.string(), b: v.string() }),
  v.object({ type: v.literal("positif-et-stagne"), a: v.string(), b: v.string() }),
  v.object({ type: v.literal("cumul-zero-apres"), k: v.string(), apres: v.string() }),
  v.object({ type: v.literal("taux-hausse-apres"), num: v.string(), den: v.string(), apres: v.string() }),
  // Décembre 2026
  v.object({ type: v.literal("sous-seuil"), k: v.string(), seuil: v.number() }),
  v.object({ type: v.literal("seuil-et-stagne"), a: v.string(), seuil: v.number(), b: v.string() }),
  v.object({ type: v.literal("monte-et-taux-sous"), a: v.string(), num: v.string(), den: v.string(), seuil: v.number() }),
  v.object({ type: v.literal("cumul-superieur"), a: v.string(), b: v.string() }),
);

/** Résultats d'une publication (décembre) : Reel ou carrousel. */
export const resultats = v.object({
  vues: v.union(v.number(), v.null()),
  nonAbonnes: v.union(v.number(), v.null()), // %
  dureeVue: v.union(v.number(), v.null()), // secondes, Reels seulement
  partages: v.union(v.number(), v.null()),
  enregistrements: v.union(v.number(), v.null()),
  messages: v.union(v.number(), v.null()),
});

export const cta = v.union(v.literal("PROJET"), v.literal("Mini-audit"));

/** Statistiques d'un post relevées sur Instagram (lecture seule sur le site). */
export const statsIg = v.object({
  vues: v.union(v.number(), v.null()),
  portee: v.union(v.number(), v.null()),
  partages: v.union(v.number(), v.null()),
  enregistrements: v.union(v.number(), v.null()),
  likes: v.union(v.number(), v.null()),
  commentaires: v.union(v.number(), v.null()),
  dureeVue: v.union(v.number(), v.null()), // secondes, Reels seulement
});

/**
 * Lien avec Instagram d'une publication ou d'un Reel d'essai.
 * `auto` : dernière valeur écrite par la synchro, par champ (« vues48h », « A-vues », « B-partages »…).
 * Si la valeur en base diffère, Maxime l'a saisie : elle n'est plus écrasée et l'écart va dans `conflits`.
 */
export const lienInstagram = v.object({
  idA: v.optional(v.string()),
  permalinkA: v.optional(v.string()),
  idB: v.optional(v.string()),
  permalinkB: v.optional(v.string()),
  manuel: v.optional(v.boolean()), // lien collé à la main : la synchro ne le change pas
  statsA: v.optional(statsIg),
  statsB: v.optional(statsIg),
  auto: v.record(v.string(), v.union(v.number(), v.null())),
  conflits: v.array(v.object({ champ: v.string(), manuel: v.number(), instagram: v.number() })),
  syncAt: v.optional(v.number()),
});

export const sourceAudit = v.union(
  v.literal("reel"),
  v.literal("story"),
  v.literal("profil"),
  v.literal("facebook"),
  v.literal("autre"),
);
export const statutAudit = v.union(v.literal("envoye"), v.literal("a-repondu"), v.literal("maquette"), v.literal("signe"));

const nombre = v.union(v.number(), v.null());

export const visuelType = v.union(
  v.literal("photo"),
  v.literal("video"),
  v.literal("fond"),
  v.literal("capture"),
  v.literal("partage"),
);

/** Sticker Instagram : `libelle` = la question posée, `reponses` = les 2 choix d'un sondage. */
export const sticker = v.object({
  type: v.union(
    v.literal("sondage"),
    v.literal("question"),
    v.literal("lien"),
    v.literal("mention"),
    v.literal("compte-a-rebours"),
    v.literal("aucun"),
  ),
  libelle: v.string(),
  reponses: v.array(v.string()),
  lien: v.string(),
});

const nombreOuVide = v.union(v.number(), v.null());

/** Un écran d'une story en plusieurs écrans, avec ses vues. */
export const ecran = v.object({
  visuelType: visuelType,
  visuel: v.string(),
  texte: v.string(),
  sticker: sticker,
  vues: nombreOuVide,
});

/** Script de tournage d'une publication (Reel : plan seconde par seconde ; carrousel : slides). */
export const script = v.object({
  titre: v.string(),
  consignes: v.optional(v.string()),
  accrocheA: v.optional(v.string()),
  accrocheB: v.optional(v.string()),
  plan: v.optional(v.array(v.object({ temps: v.string(), ecran: v.string(), voix: v.string() }))),
  slides: v.optional(v.array(v.string())),
  avantDePublier: v.optional(v.string()),
  planB: v.optional(v.string()),
  couverture: v.optional(v.string()),
  legende: v.optional(v.string()),
  /** Titre du plan principal quand il y a un plan de repli (ex. « Plan A : chez le gagnant »). */
  titrePlan: v.optional(v.string()),
  /** Plan de repli complet (tableau + légende), affiché sous le plan A. */
  planAlternatif: v.optional(
    v.object({
      titre: v.string(),
      plan: v.array(v.object({ temps: v.string(), ecran: v.string(), voix: v.string() })),
      legende: v.optional(v.string()),
    }),
  ),
});

export default defineSchema({
  mois: defineTable({
    key: v.string(), // yyyy-mm
    label: v.string(),
  }).index("by_key", ["key"]),

  publications: defineTable({
    mois: v.string(),
    date: v.string(),
    pilier,
    format: v.string(),
    metier: v.string(),
    accroche: v.string(),
    statut,
    vues48h: nombre,
    projetRecus: nombre,
    script: v.optional(script),
    // À partir de décembre 2026
    heure: v.optional(v.string()),
    cta: v.optional(cta),
    accrocheB: v.optional(v.string()), // version B (Trial Reel)
    resultats: v.optional(resultats),
    resultatsB: v.optional(resultats),
    instagram: v.optional(lienInstagram),
    /** Décembre 2026 et après : le ou les clients montrés (« Aucun » si personne). */
    clientMontre: v.optional(v.string()),
  }).index("by_mois", ["mois", "date"]),

  /** Rotation des clients : « Accord obtenu » pour un client à une date (clé « date|client »). */
  accordsClients: defineTable({
    cle: v.string(),
    accord: v.boolean(),
  }).index("by_cle", ["cle"]),

  /** Mini-audits envoyés (décembre 2026 et après). */
  miniAudits: defineTable({
    date: v.string(),
    prenom: v.string(),
    metier: v.string(),
    commune: v.string(),
    source: sourceAudit,
    statut: statutAudit,
    entrainement: v.boolean(), // audit d'entraînement sur un client actuel
    /** Diagnostic NOTE (décembre 2026) : note sur 10 envoyée à l'artisan. */
    note: v.optional(v.union(v.number(), v.null())),
  }).index("by_date", ["date"]),

  /** Reels d'essai « photo + texte » : Trial Reels avec CTA abonnement, suivis à part des 12 publications. */
  reelsEssai: defineTable({
    numero: v.number(),
    nom: v.string(),
    date: v.string(),
    heure: v.string(), // « 18:30 », heure de La Réunion
    fichier: v.string(),
    couverture: v.string(),
    legende: v.string(),
    musique: v.string(),
    statut: v.union(v.literal("a-preparer"), v.literal("publie"), v.literal("partage")),
    abonnes: nombre,
    visitesProfil: nombre,
    vues48h: nombre,
    comparaisonFaite: v.boolean(), // rappel des 48 h traité
    instagram: v.optional(lienInstagram),
  }).index("by_date", ["date"]),

  /** Une story par jour : ce qu'il faut préparer, le texte, le sticker, la suite, et ce qu'elle a donné. */
  stories: defineTable({
    date: v.string(),
    theme: v.string(),
    visuelType: visuelType,
    visuel: v.string(),
    texte: v.string(),
    sticker: sticker,
    apres: v.string(),
    publiee: v.boolean(),
    vues: nombre,
    reponses: nombre,
    messagesPrives: nombre,
    /** Story en plusieurs écrans (ex. « Site de la semaine ») : remplace visuel, texte et sticker. */
    ecrans: v.optional(v.array(ecran)),
    /** Le client mis en avant a repartagé la story. */
    repartageClient: v.optional(v.union(v.boolean(), v.null())),
    /** Samedi « Site de la semaine » : le client mis en avant. */
    client: v.optional(v.string()),
    /** Story face caméra (conseil du mercredi, décembre) : le texte à dire. */
    voix: v.optional(v.string()),
    /** Plusieurs stories le même jour : 0 avant, 1 (ou absent) la story du jour, 2 après. */
    ordre: v.optional(v.number()),
  }).index("by_date", ["date"]),

  semaines: defineTable({
    mois: v.string(),
    code: v.string(),
    debut: v.string(),
    fin: v.string(),
    ordre: v.number(),
    tournage: v.optional(v.string()), // jour de tournage (sinon le dimanche précédent)
  }).index("by_mois", ["mois", "ordre"]),

  /** Sans `mois` : indicateurs de novembre 2026 (et des mois sans liste propre). */
  indicateurs: defineTable({
    key: v.string(),
    label: v.string(),
    source: v.string(),
    ordre: v.number(),
    mois: v.optional(v.string()),
    depart: v.optional(v.string()),
    objectif: v.optional(v.string()),
  }).index("by_ordre", ["ordre"]),

  mesures: defineTable({
    semaineId: v.id("semaines"),
    indicateurKey: v.string(),
    valeur: nombre,
    /** Dernière valeur écrite par la synchro Instagram (si `valeur` diffère, c'est une saisie manuelle). */
    auto: v.optional(nombre),
    /** Dernière valeur relevée sur Instagram, même si elle n'a pas été écrite. */
    instagram: v.optional(nombre),
  }).index("by_semaine_indicateur", ["semaineId", "indicateurKey"]),

  /** Une ligne par synchro Instagram (la plus récente s'affiche sur le site). */
  synchrosInstagram: defineTable({
    debut: v.number(),
    fin: v.number(),
    origine: v.union(v.literal("bouton"), v.literal("auto")),
    ok: v.boolean(),
    message: v.string(),
    misesAJour: v.number(),
    conflits: v.number(),
    nonRelies: v.array(v.object({ date: v.string(), type: v.string(), permalink: v.string(), legende: v.string() })),
  }).index("by_debut", ["debut"]),

  /** Sans `mois` : règles de novembre 2026 (et des mois sans liste propre). */
  regles: defineTable({
    ordre: v.number(),
    mois: v.optional(v.string()),
    condition,
    conditionLabel: v.string(),
    probleme: v.string(),
    action: v.string(),
  }).index("by_ordre", ["ordre"]),

  controles: defineTable({
    mois: v.string(),
    date: v.string(),
    titre: v.string(),
    semaines: v.array(v.string()),
    notes: v.string(),
    /** Alerte affichée en tête du point de contrôle (décembre 2026 : retour à 3 posts/semaine). */
    alerte: v.optional(v.string()),
  }).index("by_mois", ["mois", "date"]),

  controleItems: defineTable({
    controleId: v.id("controles"),
    label: v.string(),
    coche: v.boolean(),
    ordre: v.number(),
  }).index("by_controle", ["controleId", "ordre"]),
});
