import type { Infer } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { script } from "./schema";

type Script = Infer<typeof script>;

const HASHTAGS = "#artisan974 #laréunion #siteweb974";

/** Scripts de novembre 2026, repris de la stratégie (strategie-instagram/AGENTS.md §2 et §3), par date de publication. */
export const SCRIPTS_NOVEMBRE: Record<string, Script> = {
  "2026-11-02": {
    titre: "Reel 1 · « Qui le client appelle ? »",
    consignes:
      "Semaine 1 : pas de test du samedi. A publié en normal lundi et B en Trial le même jour. Enregistrement d'écran de Google, noms des concurrents floutés.",
    accrocheA: "Ton client fait ça avant de t'appeler.",
    accrocheB: "Plombier à Saint-Denis : t'es où sur Google ?",
    plan: [
      { temps: "0–3 s", ecran: "Tu tapes « plombier saint-denis » dans Google. Texte : accroche A ou B", voix: "« Un client cherche un plombier à Saint-Denis. »" },
      { temps: "3–10 s", ecran: "Défilement des résultats, noms floutés. Texte : « Il appelle les 3 premiers. »", voix: "« Il ne va pas plus loin. Il appelle ceux qu'il voit en premier. »" },
      { temps: "10–17 s", ecran: "Tu continues de défiler. Texte : « Et toi, t'es où ? »", voix: "« Si t'es pas là, il ne saura jamais que t'existes. Même si tu bosses mieux qu'eux. »" },
      { temps: "17–25 s", ecran: "Défilement du site SM Design. Texte : « 1re page offerte »", voix: "« Je te crée la première page de ton site gratuitement. Si elle te plaît pas, tu paies rien. Commente PROJET. »" },
    ],
    couverture: "Qui le client appelle ?",
    legende: `Ton client ne fouille pas Google. Il appelle les 3 premiers qu'il voit. Si tu n'y es pas, tu n'existes pas pour lui, même si tu bosses mieux que tout le monde.
👉 Je te crée la 1re page de ton site gratuitement. Elle te plaît pas ? Tu paies rien.
Commente PROJET et je te montre ce que je ferais pour ton métier 👇
#plombier974 ${HASHTAGS}`,
  },

  "2026-11-04": {
    titre: "Carrousel 1 · « J'ai déjà Facebook, ça suffit »",
    slides: [
      "« J'ai déjà Facebook, ça suffit. » Vrai ou faux ? 👉",
      "Facebook, c'est très bien… pour ceux qui te connaissent déjà.",
      "Le client qui ne te connaît pas, il ne va pas sur Facebook. Il tape « électricien Saint-Paul » sur Google.",
      "Une page Facebook, c'est une seule page. Un site, c'est une page par service et par commune où tu travailles. Plus de chances d'être trouvé.",
      "Ta page Facebook ne t'appartient pas. Compte piraté ou bloqué ? Tu repars de zéro. Ton site, il est à toi.",
      "Le bon combo : Facebook pour garder le contact. Un site pour être trouvé et rassurer.",
      "Ta 1re page de site offerte. Elle te plaît pas ? 0 €. Commente PROJET 👇",
    ],
    consignes: "Nout Web publie déjà des articles « Facebook vs site vitrine » : ce carrousel doit être plus concret et plus visuel que les leurs.",
    legende: `Facebook, garde-le ! Mais il ne fait pas le même travail qu'un site. Facebook entretient ceux qui te connaissent. Le site fait venir ceux qui ne te connaissent pas encore.
Tu veux voir à quoi ressemblerait le tien ? Commente PROJET 👇
#artisan974 #laréunion #siteweb974 #codeceleste`,
  },

  "2026-11-06": {
    titre: "Reel 2 · Avant/après SM Design",
    consignes: "Format écran + voix : captures Google/Facebook, puis défilement du nouveau site.",
    plan: [
      { temps: "0–3 s", ecran: "Capture de Google « SM Design » avant le site (ou sa page Facebook). Texte : « 20 ans de métier. Zéro site. »", voix: "« Vingt ans de métier, toute l'île… et rien sur Google pour le montrer. »" },
      { temps: "3–12 s", ecran: "Défilement du nouveau site : services, réalisations. Texte : « Après »", voix: "« Maintenant, le client voit les services, les chantiers en photo… »" },
      { temps: "12–20 s", ecran: "Zoom sur le bouton devis, clic. Texte : « 1 clic = 1 demande »", voix: "« …et il demande son devis en un clic, même le soir. »" },
      { temps: "20–25 s", ecran: "Ta tête ou le logo. Texte : « Ton tour ? »", voix: "« Ton savoir-faire mérite mieux. Commente PROJET. »" },
    ],
    couverture: "20 ans, zéro site",
    legende: "Reprendre la légende SM Design déjà prête (synthèse du 31/10, §6), sans changement.",
  },

  "2026-11-09": {
    titre: "Reel 3 · « L'appel manqué »",
    consignes: "Face caméra, 15–20 s, tourné dehors ou dans le camion. Trial Reels A et B publiés le samedi 7/11, le gagnant partagé lundi.",
    accrocheA: "Le client qui tombe sur ta messagerie, il ne rappelle pas.",
    accrocheB: "Électricien : combien d'appels t'as ratés cette semaine ?",
    plan: [
      { temps: "0–3 s", ecran: "Face caméra, texte = accroche", voix: "Accroche A ou B" },
      { temps: "3–10 s", ecran: "Face caméra. Texte : « Il appelle le suivant. »", voix: "« T'étais sur un chantier, les mains dans le tableau. Le client ne laisse pas de message : il appelle le suivant sur Google. »" },
      { temps: "10–16 s", ecran: "Enregistrement d'écran : formulaire de demande d'un site client. Texte : « Même quand tu ne décroches pas »", voix: "« Avec un site, il te laisse sa demande. Tu le rappelles le soir. Le chantier reste chez toi. »" },
      { temps: "16–20 s", ecran: "Face caméra. Texte : « Commente PROJET »", voix: "« Je te montre ce que ça donnerait pour toi. Commente PROJET. »" },
    ],
    couverture: "L'appel que t'as raté",
    legende: `T'es sur un chantier. Ton téléphone sonne. Tu ne peux pas décrocher. Le client ne laisse pas de message : il appelle le suivant.
Un site, c'est un endroit où il peut te laisser sa demande même quand t'as les mains prises.
Commente PROJET 👇
#electricien974 ${HASHTAGS}`,
  },

  "2026-11-11": {
    titre: "Reel 4 · « Mes 3 questions »",
    consignes: "Face caméra, 25–30 s. Un texte à l'écran par question.",
    plan: [
      { temps: "0–3 s", ecran: "Face caméra. Texte : « Avant de faire ton site, je te pose 3 questions »", voix: "« Avant de toucher à ton site, je te pose trois questions. »" },
      { temps: "3–10 s", ecran: "Texte : « 1. Quel chantier tu veux plus ? »", voix: "« Un : quel type de chantier tu veux faire plus. C'est lui qu'on met en avant. »" },
      { temps: "10–17 s", ecran: "Texte : « 2. Tu bosses où ? »", voix: "« Deux : dans quelles communes tu travailles. Ton client cherche par commune. »" },
      { temps: "17–25 s", ecran: "Texte : « 3. Qu'est-ce qu'on te demande au téléphone ? »", voix: "« Trois : ce que les clients te demandent tout le temps. Les réponses vont sur le site, ils appellent déjà convaincus. »" },
      { temps: "25–30 s", ecran: "Texte : « Commente PROJET »", voix: "« Tu veux que je te les pose ? Commente PROJET. »" },
    ],
    couverture: "Mes 3 questions",
    legende: `Un site d'artisan qui marche, ça ne commence pas par les couleurs. Ça commence par ces 3 questions 👆
T'as tes réponses ? Commente PROJET et on regarde ensemble 👇
#artisan974 #laréunion #codeceleste`,
  },

  "2026-11-13": {
    titre: "Carrousel 2 · Étude de cas SCMOI",
    consignes:
      "Validé le 03/11 (SCMOI à la place de Smart Power System). Fichiers prêts : production-contenu/sortie/2026-11-13-etude-de-cas-scmoi/ (7 slides + legende.txt). Partage Facebook activé.",
    avantDePublier:
      "Rien à demander à Fabrice : tout vient de ce qui se voit sur scmoi.re. En cas de doute, un message rapide : « je montre ton site en exemple vendredi, ça te va ? ». Texte alternatif slide 1 : « Étude de cas : le site de SCMOI, climaticien à Saint-Paul. »",
    slides: [
      "Couverture · Artisan du 974 : Un site qui bosse pour lui. SCMOI, climaticien à Saint-Paul. Ce qu'on a fait → (accueil dans un iPhone)",
      "Le défi · 3 métiers. 1 seul site. Clim · Chauffage · Électricité. Comment tout montrer, sans perdre le client en route ?",
      "Ce qu'on a construit (fond blanc) · Ses 3 métiers expliqués · Ses vrais chantiers en photo, classés par type · Devis, appel ou WhatsApp en 1 clic",
      "L'accueil · Clair dès la 1re seconde. Bouton devis entouré · Devis gratuit en 1 clic",
      "Les réalisations · Ses chantiers parlent pour lui. · Ça rassure avant l'appel",
      "Le contact · Appeler ? Écrire ? Il choisit. · Formulaire, appel, WhatsApp",
      "CTA · Et pour ton métier ? Commente PROJET 👇 · Je te montre ce que je ferais pour toi.",
    ],
    legende: `Artisan du 974 ?
Clim, chauffage, électricité : 3 métiers, un seul site, pensé pour le téléphone. Voilà ce que j'ai construit pour SCMOI, à Saint-Paul.
Ton métier, ta commune, ton site ? Commente PROJET 👇
#artisan974 #climatisation974 #laréunion #codeceleste`,
  },

  "2026-11-16": {
    titre: "Reel 5 · « 32 °C »",
    consignes: "Écran Google. Trial Reels A et B publiés le samedi 14/11, le gagnant partagé lundi.",
    accrocheA: "32 °C, clim en panne : le client appelle qui ?",
    accrocheB: "Clim : ton client te compare à 2 autres en 10 secondes.",
    plan: [
      { temps: "0–3 s", ecran: "Tu tapes « dépannage clim saint-pierre ». Texte = accroche", voix: "Accroche A ou B" },
      { temps: "3–10 s", ecran: "Résultats, noms floutés. Texte : « Il ouvre 3 noms »", voix: "« Il ouvre trois noms. Il a chaud, il est pressé. »" },
      { temps: "10–18 s", ecran: "Un résultat sans site / un résultat avec site et photos (flouté). Texte : « Lequel tu appelles ? »", voix: "« Un qui n'a rien à montrer. Un qui montre ses interventions et ses tarifs de déplacement. Toi, t'appelles lequel ? »" },
      { temps: "18–25 s", ecran: "Défilement d'un de tes sites. Texte : « 1re page offerte »", voix: "« Je te fais la première page gratuitement. Commente PROJET. »" },
    ],
    couverture: "Clim en panne, il appelle qui ?",
    legende: `Quand la clim lâche, le client ne compare pas longtemps. Il appelle celui qui le rassure le plus vite.
Ton site, c'est ce qui fait la différence en 10 secondes. 👉 1re page offerte. Elle te plaît pas ? 0 €.
Commente PROJET 👇
#climatisation974 ${HASHTAGS}`,
  },

  "2026-11-18": {
    titre: "Carrousel 3 · Le prix",
    consignes: "Ne nommer aucun concurrent : on parle à l'artisan, pas au marché. Aucun chiffre tant que la fourchette de prix n'est pas validée.",
    slides: [
      "Un site d'artisan à La Réunion, ça coûte combien vraiment ? 👉",
      "Tu vas voir de tout : quelques centaines d'euros, plusieurs milliers. Normal, ce n'est pas le même produit.",
      "Ce qui fait varier le prix : le nombre de pages, qui écrit les textes, les photos, le travail pour Google, la maintenance.",
      "La seule question qui compte : combien te rapporte UN chantier ? Si un chantier te rapporte [X €], ton site est remboursé dès le [n]e client.",
      "Chez Code Celeste : ton site est construit pour ton métier. Devis gratuit, facilités de paiement, 3 mois de maintenance offerts.",
      "Et tu vois la 1re page avant de payer quoi que ce soit. Elle te plaît pas ? 0 €.",
      "Commente PROJET et je te dis ce que coûterait le tien 👇",
    ],
    legende: `Pas de grille toute faite : ton site est construit pour ton métier, ton devis aussi. Tu vois la 1re page avant de sortir un euro, avec des facilités de paiement.
Tu veux un chiffre précis pour ton métier ? Commente PROJET 👇
#artisan974 #laréunion #siteweb974 #codeceleste`,
  },

  "2026-11-20": {
    titre: "Reel 6 · « Ce que je refuse »",
    consignes: "Face caméra, 20–25 s, dehors ou dans le camion. Aucun client à filmer. Un texte à l'écran par point.",
    avantDePublier: "Valider que les 3 refus sont bien les tiens ; sinon les remplacer avant le tournage.",
    plan: [
      { temps: "0–3 s", ecran: "Face caméra. Texte : « 3 choses que je refuse sur le site d'un artisan »", voix: "« Y a trois choses que je refuse de mettre sur le site d'un artisan. »" },
      { temps: "3–9 s", ecran: "Texte : « 1. Un numéro qu'on peut pas cliquer »", voix: "« Un : un numéro qu'on peut pas cliquer. Ton client est sur son téléphone : s'il doit le recopier, il appelle le suivant. »" },
      { temps: "9–15 s", ecran: "Texte : « 2. Des photos de banque d'images »", voix: "« Deux : des photos de banque d'images. Ton client veut voir tes chantiers, pas ceux d'un autre. »" },
      { temps: "15–21 s", ecran: "Texte : « 3. Un texte copié d'un autre site »", voix: "« Trois : un texte copié-collé. Ton site parle de ton métier, de tes communes, avec tes mots. »" },
      { temps: "21–25 s", ecran: "Texte : « Commente PROJET »", voix: "« Ton site, c'est tes chantiers. Commente PROJET. »" },
    ],
    couverture: "Ce que je refuse",
    legende: `Un site d'artisan, c'est pas une vitrine pour faire joli. Chaque élément doit donner envie de t'appeler.
Ces 3 trucs-là, je les mets jamais 👆 T'en as un sur ton site ? Commente PROJET 👇
#artisan974 #laréunion #siteweb974 #codeceleste`,
  },

  "2026-11-23": {
    titre: "Reel 7 · « Tape ton nom »",
    consignes: "Écran Google. Trial Reels A et B publiés le samedi 21/11, le gagnant partagé lundi.",
    accrocheA: "Fais ce test : tape le nom de ta boîte sur Google.",
    accrocheB: "Peintre : ton client vérifie ton nom avant de t'appeler.",
    plan: [
      { temps: "0–3 s", ecran: "Tu tapes un nom d'entreprise de peinture (inventé ou client d'avant, flouté). Texte = accroche", voix: "Accroche A ou B" },
      { temps: "3–10 s", ecran: "Résultat : une page Facebook pas à jour, ou rien. Texte : « Voilà ce qu'il voit »", voix: "« On lui a donné ton nom. Il vérifie. Voilà ce qu'il trouve. »" },
      { temps: "10–17 s", ecran: "Texte : « Il hésite »", voix: "« Pas de photos, pas d'avis, rien de récent. Il hésite… et il demande un autre devis. »" },
      { temps: "17–25 s", ecran: "Défilement d'un de tes sites de peintre ou BTP. Texte : « 1re page offerte »", voix: "« Je te crée la première page de ton site gratuitement. Commente PROJET. »" },
    ],
    couverture: "Fais le test",
    legende: `Même quand on te recommande, le client tape ton nom sur Google avant d'appeler. S'il ne trouve rien de sérieux, le bouche-à-oreille s'arrête là.
Fais le test maintenant. Pas content du résultat ? Commente PROJET 👇
#peintre974 ${HASHTAGS}`,
  },

  "2026-11-25": {
    titre: "Carrousel 4 · Avant/après",
    avantDePublier:
      "Choisir le client dont l'« avant » est le plus pauvre (pas de site, ou vieille page Facebook). Lui demander son accord.",
    slides: [
      "Même artisan. Avant / après. Tu appelles lequel ?",
      "Avant : capture Google ou Facebook de l'époque",
      "Après : la page d'accueil du site sur téléphone",
      "Après : la page réalisations",
      "Après : le bouton d'appel ou de devis, entouré",
      "Commente PROJET et je te montre ton « après » 👇",
    ],
    legende: `[Prénom], [métier] à [commune] 🇷🇪 Même savoir-faire. Mais maintenant, ça se voit avant le premier appel.
Ton avant/après ? Commente PROJET 👇
#artisan974 #[métier]974 #laréunion #codeceleste`,
  },

  "2026-11-27": {
    titre: "Carrousel 5 · « Ce qu'on m'a dit »",
    consignes: "Une capture d'avis client par slide (message WhatsApp, SMS ou avis Google), texte non retouché. Au moins 3 avis reçus le 20/11.",
    avantDePublier:
      "Accord écrit de chaque client montré (accord: oui). Masquer numéros et noms de famille. Envoyer le carrousel final à chaque client et attendre son « OK » écrit.",
    slides: [
      "« Ce que mes clients artisans m'ont écrit après la mise en ligne de leur site » 👉",
      "Capture de l'avis n°1 · [Prénom ou entreprise], [métier] à [commune]",
      "Capture de l'avis n°2 · [Prénom ou entreprise], [métier] à [commune]",
      "Capture de l'avis n°3 · [Prénom ou entreprise], [métier] à [commune]",
      "(Si reçu) Capture de l'avis n°4 · [Prénom ou entreprise], [métier] à [commune]",
      "« Artisans du 974 · Leurs sites bossent déjà. »",
      "« Le prochain message, c'est le tien ? Commente PROJET 👇 »",
    ],
    planB: "Moins de 3 avis le 20/11 : les avis reçus + l'avis d'Alexandre (Smart Power System) + une slide mosaïque de sites clients avec accord.",
    legende: `Je leur ai rien soufflé : c'est ce que mes clients m'ont écrit après la mise en ligne de leur site 🙏
Ton métier, ta commune, ton site ? Commente PROJET 👇
#artisan974 #laréunion #siteweb974 #codeceleste`,
  },
};

/** Ajoute les scripts de novembre aux publications existantes (sans écraser un script déjà présent). */
export const charger = internalMutation({
  args: {},
  handler: async (ctx) => {
    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", "2026-11")).collect();
    let n = 0;
    for (const p of publications) {
      const s = SCRIPTS_NOVEMBRE[p.date];
      if (s && !p.script) {
        await ctx.db.patch(p._id, { script: s });
        n++;
      }
    }
    return `${n} scripts ajoutés`;
  },
});

/** Changement du 03/11/2026 : le 20/11 et le 27/11 ne filment plus de client. Remplace ces deux publications (et leur script) et renomme la case « témoignage » du point de contrôle. */
export const changement0311 = internalMutation({
  args: {},
  handler: async (ctx) => {
    const remplacements: Record<string, { format: string; metier: string; accroche: string }> = {
      "2026-11-20": { format: "Reel face caméra", metier: "Tous", accroche: "3 choses que je refuse de mettre sur le site d'un artisan." },
      "2026-11-27": { format: "Carrousel avis clients", metier: "Clients (avec accord)", accroche: "Ce que mes clients artisans m'ont écrit après la mise en ligne" },
    };
    const publications = await ctx.db.query("publications").withIndex("by_mois", (q) => q.eq("mois", "2026-11")).collect();
    let n = 0;
    for (const p of publications) {
      const r = remplacements[p.date];
      if (r) {
        await ctx.db.patch(p._id, { ...r, script: SCRIPTS_NOVEMBRE[p.date] });
        n++;
      }
    }
    let items = 0;
    for (const item of await ctx.db.query("controleItems").collect()) {
      if (item.label.startsWith("Où en sont les 5 demandes de témoignage")) {
        await ctx.db.patch(item._id, { label: "Où en sont les 5 demandes d'avis clients (oui / non / pas de réponse)" });
        items++;
      }
    }
    return `${n} publications et ${items} case(s) mises à jour`;
  },
});

/** Décision du 03/11/2026 : le carrousel du 13/11 montre SCMOI à la place de Smart Power System. */
export const changementScmoi = internalMutation({
  args: {},
  handler: async (ctx) => {
    const p = await ctx.db
      .query("publications")
      .withIndex("by_mois", (q) => q.eq("mois", "2026-11"))
      .filter((q) => q.eq(q.field("date"), "2026-11-13"))
      .first();
    if (!p) return "Publication du 13/11 introuvable";
    await ctx.db.patch(p._id, {
      metier: "SCMOI (clim, Saint-Paul)",
      accroche: "Un site qui bosse pour lui.",
      script: SCRIPTS_NOVEMBRE["2026-11-13"],
    });
    return "Publication du 13/11 mise à jour (SCMOI)";
  },
});
