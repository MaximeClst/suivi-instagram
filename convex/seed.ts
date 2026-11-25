import { internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { SCRIPTS_NOVEMBRE } from "./scripts";

type Pub = Pick<Doc<"publications">, "date" | "pilier" | "format" | "metier" | "accroche">;

const PUBLICATIONS: Pub[] = [
  { date: "2026-11-02", pilier: "prise-de-conscience", format: "Reel (A normal + B Trial)", metier: "Plombier", accroche: "Ton client fait ça avant de t'appeler." },
  { date: "2026-11-04", pilier: "objections", format: "Carrousel", metier: "Tous", accroche: "« J'ai déjà Facebook, ça suffit. » Vrai ou faux ?" },
  { date: "2026-11-06", pilier: "preuves", format: "Reel avant/après", metier: "BTP (SM Design)", accroche: "20 ans de métier. Zéro site." },
  { date: "2026-11-09", pilier: "prise-de-conscience", format: "Reel face caméra (Trial A/B sam 7/11)", metier: "Électricien", accroche: "Le client qui tombe sur ta messagerie, il ne rappelle pas." },
  { date: "2026-11-11", pilier: "personal-brand", format: "Reel face caméra", metier: "Tous", accroche: "Les 3 questions que je pose à un artisan avant de faire son site" },
  { date: "2026-11-13", pilier: "preuves", format: "Carrousel étude de cas", metier: "SCMOI (clim, Saint-Paul)", accroche: "Un site qui bosse pour lui." },
  { date: "2026-11-16", pilier: "prise-de-conscience", format: "Reel écran Google (Trial A/B sam 14/11)", metier: "Clim", accroche: "32 °C, clim en panne : le client appelle qui ?" },
  { date: "2026-11-18", pilier: "objections", format: "Carrousel prix (sur mesure)", metier: "Tous", accroche: "Un site d'artisan à La Réunion, ça coûte combien vraiment ?" },
  { date: "2026-11-20", pilier: "personal-brand", format: "Reel face caméra", metier: "Tous", accroche: "3 choses que je refuse de mettre sur le site d'un artisan." },
  { date: "2026-11-23", pilier: "prise-de-conscience", format: "Reel écran Google (Trial A/B sam 21/11)", metier: "Peintre", accroche: "Fais ce test : tape le nom de ta boîte sur Google." },
  { date: "2026-11-25", pilier: "preuves", format: "Carrousel avant/après", metier: "[artisan client]", accroche: "Même artisan. Avant / après. Tu appelles lequel ?" },
  { date: "2026-11-27", pilier: "preuves", format: "Carrousel avis clients", metier: "Clients (avec accord)", accroche: "Ce que mes clients artisans m'ont écrit après la mise en ligne" },
];

const SEMAINES = [
  { code: "S0", debut: "2026-10-25", fin: "2026-11-01" },
  { code: "S1", debut: "2026-11-02", fin: "2026-11-08" },
  { code: "S2", debut: "2026-11-09", fin: "2026-11-15" },
  { code: "S3", debut: "2026-11-16", fin: "2026-11-22" },
  { code: "S4", debut: "2026-11-23", fin: "2026-11-29" },
];

const INDICATEURS = [
  { key: "reach_non_followers", label: "Comptes touchés non abonnés", source: "Tableau de bord pro" },
  { key: "profile_visits", label: "Visites du profil", source: "Tableau de bord pro" },
  { key: "link_clicks", label: "Clics sur le lien", source: "Tableau de bord pro" },
  { key: "shares_saves", label: "Partages + enregistrements (total des posts)", source: "Statistiques de chaque post" },
  { key: "projet_total", label: "Commentaires PROJET + DM (Insta + Facebook)", source: "Manuel" },
  { key: "projet_organic", label: "… dont « organique »", source: "Manuel (réponse à « tu m'as découvert comment ? »)" },
  { key: "mockups", label: "Maquettes faites", source: "Manuel" },
  { key: "signed", label: "Clients signés", source: "Manuel" },
  { key: "ad_cost_per_lead", label: "Coût par prospect pub (€)", source: "Gestionnaire de publicités" },
  { key: "ad_leads", label: "Prospects pub", source: "Manuel" },
  { key: "ad_mockups", label: "Maquettes issues de prospects pub", source: "Manuel" },
  { key: "ad_signed", label: "Signés issus de prospects pub", source: "Manuel" },
];

const REGLES: Omit<Doc<"regles">, "_id" | "_creationTime" | "ordre">[] = [
  {
    condition: { type: "stagne", k: "reach_non_followers" },
    conditionLabel: "Comptes non abonnés touchés stagnent",
    probleme: "Les 3 premières secondes",
    action: "Nouvelles accroches en Trial Reel, plus directes, avec un chiffre ou une question",
  },
  {
    condition: { type: "monte-et-stagne", a: "reach_non_followers", b: "profile_visits" },
    conditionLabel: "Comptes touchés montent, visites du profil stagnent",
    probleme: "Le Reel plaît mais ne donne pas envie d'en savoir plus",
    action: "Ajouter « Le reste sur mon profil » à l'écran, parler plus clairement de l'offre à la fin",
  },
  {
    condition: { type: "monte-et-stagne", a: "profile_visits", b: "link_clicks" },
    conditionLabel: "Visites du profil montent, clics lien stagnent",
    probleme: "La bio ou les épinglés",
    action: "Revoir la ligne 1 de la bio et l'épinglé n°1",
  },
  {
    condition: { type: "monte-et-zero", a: "link_clicks", b: "projet_total" },
    conditionLabel: "Clics lien montent, 0 PROJET",
    probleme: "La page /ads",
    action: "Vérifier la page sur téléphone, l'offre, le bouton de contact",
  },
  {
    condition: { type: "positif-et-stagne", a: "projet_total", b: "mockups" },
    conditionLabel: "PROJET reçus, maquettes stagnent",
    probleme: "Les DM",
    action: "Répondre plus vite, proposer l'appel plus tôt",
  },
  {
    condition: { type: "positif-et-stagne", a: "mockups", b: "signed" },
    conditionLabel: "Maquettes faites, signés stagnent",
    probleme: "L'offre",
    action: "Pas un problème Instagram : à traiter au point de contrôle S4",
  },
  {
    condition: { type: "cumul-zero-apres", k: "projet_organic", apres: "S4" },
    conditionLabel: "0 PROJET organique cumulé après S4",
    probleme: "L'accroche ou l'offre",
    action: "Changer d'angle : un seul métier, un seul message",
  },
  {
    condition: { type: "taux-hausse-apres", num: "ad_mockups", den: "ad_leads", apres: "S2" },
    conditionLabel: "Taux pub → maquette en hausse après S2",
    probleme: "Rien : l'image aide à convertir",
    action: "Continuer",
  },
];

export const CONTROLES = [
  {
    date: "2026-11-15",
    titre: "Dimanche 15/11 (fin S2)",
    semaines: ["S0", "S1", "S2"],
    items: [
      "Capture du tableau de bord pro sur 14 jours (comptes touchés, abonnés / non-abonnés, visites, clics lien)",
      "Capture des statistiques de chaque Reel publié : vues, durée de visionnage moyenne, partages, enregistrements",
      "Pour chaque test A/B : les statistiques des deux Trial Reels côte à côte",
      "Le tableau de suivi (S0, S1, S2) rempli",
      "Combien de PROJET reçus, dont combien sur Facebook, et la source de chacun",
      "Où en sont les 5 demandes d'avis clients (oui / non / pas de réponse)",
      "La décision sur la fourchette de prix",
    ],
  },
  {
    date: "2026-11-29",
    titre: "Dimanche 29/11 (fin S4)",
    semaines: ["S0", "S1", "S2", "S3", "S4"],
    items: [
      "Les mêmes captures, sur 30 jours",
      "Le tableau de suivi complet (S0 à S4)",
      "Côté pub : coût par prospect du mois et prospects pub → maquettes → signés, comparés à octobre",
      "Les 3 publications qui ont le mieux marché et les 3 pires",
      "Ce qui n'a pas été tenu (rythme, stories, tournage)",
    ],
  },
];

/** Charge les données initiales de novembre 2026. Sans effet si déjà fait. */
export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existant = await ctx.db.query("mois").withIndex("by_key", (q) => q.eq("key", "2026-11")).unique();
    if (existant) return "déjà chargé";

    await ctx.db.insert("mois", { key: "2026-11", label: "Novembre 2026" });

    for (const p of PUBLICATIONS) {
      await ctx.db.insert("publications", {
        ...p,
        mois: "2026-11",
        statut: "a-preparer",
        vues48h: null,
        projetRecus: null,
        script: SCRIPTS_NOVEMBRE[p.date],
      });
    }
    for (const [ordre, s] of SEMAINES.entries()) {
      await ctx.db.insert("semaines", { ...s, mois: "2026-11", ordre });
    }
    if ((await ctx.db.query("indicateurs").first()) === null) {
      for (const [ordre, i] of INDICATEURS.entries()) await ctx.db.insert("indicateurs", { ...i, ordre });
    }
    if ((await ctx.db.query("regles").first()) === null) {
      for (const [ordre, r] of REGLES.entries()) await ctx.db.insert("regles", { ...r, ordre });
    }
    for (const c of CONTROLES) {
      const controleId = await ctx.db.insert("controles", {
        mois: "2026-11",
        date: c.date,
        titre: c.titre,
        semaines: c.semaines,
        notes: "",
      });
      for (const [ordre, label] of c.items.entries()) {
        await ctx.db.insert("controleItems", { controleId, label, coche: false, ordre });
      }
    }
    return "chargé";
  },
});
