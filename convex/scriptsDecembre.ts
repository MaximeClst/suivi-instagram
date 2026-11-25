import type { Infer } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { script, sticker, visuelType } from "./schema";

type Script = Infer<typeof script>;
type Sticker = Infer<typeof sticker>;

/**
 * Décembre 2026, v2 du 21/11/2026 (prompt « Scripts de décembre dans le site de suivi (v2) »).
 * Remplace entièrement la v1 du 20/11. Textes recopiés à l'identique.
 * Dans les légendes, « / » marque un retour à la ligne : ils sont stockés en vrais retours.
 */

const legende = (texte: string) => texte.split(" / ").join("\n");

/** Les 12 publications de la v2 de décembre (8 Reels, 4 carrousels) ; + 7 Reels courts (PUBLICATIONS_REELS_COURTS) = 19. */
export const PUBLICATIONS_V2: (Pick<Doc<"publications">, "date" | "pilier" | "format" | "metier" | "accroche" | "cta"> & {
  accrocheB?: string;
})[] = [
  { date: "2026-12-03", pilier: "prise-de-conscience", format: "Reel", metier: "Électricien", accroche: "Électricien du 974 ? Ton client te cherche sur Google.", cta: "PROJET", accrocheB: "Saint-Denis, Saint-Pierre, Saint-Paul : électricien, t'es où sur Google ?" },
  { date: "2026-12-04", pilier: "preuves", format: "Carrousel avant/après", metier: "L2KJ Services (climaticien, La Possession)", accroche: "Même artisan. Avant / après. Tu appelles lequel ?", cta: "PROJET" },
  { date: "2026-12-06", pilier: "objections", format: "Reel face caméra (objections & offre)", metier: "Tous", accroche: "Artisan à La Réunion ? Tu vois ta page d'accueil avant de t'engager.", cta: "PROJET" },
  // 21/11, Maxime : on garde « Le camion » le 10/12 (script : production-contenu/sortie/2026-12-10-le-camion/script.md), pas le Reel Clim de la v2.
  { date: "2026-12-10", pilier: "prise-de-conscience", format: "Reel face caméra (A normal + B Trial, même jour) · Le camion", metier: "Électricien", accroche: "Ton camion, il a ton nom et ton numéro dessus. Sur Google, il y a quoi ?", cta: "PROJET", accrocheB: "Tu roulerais avec un camion sans ton nom dessus ? Non. Alors pourquoi t'es pas sur Google ?" },
  { date: "2026-12-11", pilier: "objections", format: "Carrousel", metier: "Tous", accroche: "« J'ai assez de bouche-à-oreille. » Vrai ou faux ?", cta: "PROJET" },
  { date: "2026-12-13", pilier: "preuves", format: "Reel face caméra · site client", metier: "SCMOI (climaticien, Saint-Paul)", accroche: "Climaticien à Saint-Paul ? Regarde ce que ses clients voient maintenant.", cta: "PROJET" },
  // Pilier « Personal brand · concours »
  { date: "2026-12-15", pilier: "personal-brand", format: "Reel face caméra", metier: "Gagnant du concours", accroche: "Le site de Noël, je l'offre à [Prénom], [métier] à [commune] !", cta: "PROJET" },
  { date: "2026-12-17", pilier: "prise-de-conscience", format: "Reel", metier: "Peintre / BTP", accroche: "Peintre à La Réunion ? On te recommande… puis on tape ton nom.", cta: "PROJET", accrocheB: "Artisan du 974 : fais ce test, tape le nom de ta boîte sur Google." },
  { date: "2026-12-18", pilier: "personal-brand", format: "Reel coulisses chez le gagnant (plan B : client du moment)", metier: "Gagnant du concours", accroche: "Artisan du 974 : avant de créer le site de [prénom], je viens chez lui.", cta: "PROJET" },
  { date: "2026-12-20", pilier: "objections", format: "Carrousel (objections & offre)", metier: "Tous", accroche: "Pas le temps pour un site ? Voilà tout ce que tu as à faire.", cta: "PROJET" },
  { date: "2026-12-27", pilier: "prise-de-conscience", format: "Reel face caméra (+ offre)", metier: "Tous", accroche: "Artisan du 974 : en janvier tout le monde reprend. Ton site sera prêt ?", cta: "PROJET", accrocheB: "Ta bonne résolution d'artisan pour 2027 tient en 7 jours." },
  { date: "2026-12-30", pilier: "preuves", format: "Carrousel bilan", metier: "Clients (avec accord)", accroche: "2026 : 10 artisans du 974 en ligne.", cta: "PROJET" },
];

export const SCRIPTS_DECEMBRE: Record<string, Script> = {
  "2026-12-03": {
    titre: "Reel 1 · Électricien · « Il te trouve ? »",
    consignes: "Après le relais du Reel en story, ajouter la story de rappel du concours (section 2).",
    accrocheA: "Électricien du 974 ? Ton client te cherche sur Google.",
    accrocheB: "Saint-Denis, Saint-Pierre, Saint-Paul : électricien, t'es où sur Google ?",
    plan: [
      { temps: "0–5 s", ecran: "Visage. Haut : « Électricien du 974 ? » Bas : « Maquette gratuite avant de payer »", voix: "Accroche A ou B" },
      { temps: "5–10 s", ecran: "Écran : recherche « électricien saint-denis », noms floutés", voix: "« Il appelle les 3 premiers. Les autres, il les voit même pas. »" },
      { temps: "10–15 s", ecran: "Visage. « Envoie-moi PROJET en message »", voix: "« Je te prépare une maquette gratuite de ton site. Envoie-moi PROJET. »" },
    ],
    legende: legende(
      "Électricien à La Réunion ? 🇷🇪 / Ton client cherche sur Google avant d'appeler. S'il te trouve pas, il appelle un autre. / Tu vois ta page d'accueil avant de t'engager : maquette gratuite, 0 € si elle te plaît pas. / Envoie-moi PROJET en message 👇 / 🎄 Concours de Noël : nomme un pro du 974 sous le Reel épinglé, jusqu'au 6/12. / #electricien974 #artisan974 #laréunion",
    ),
  },

  "2026-12-04": {
    titre: "Carrousel 1 · Avant / après",
    consignes:
      "Client : L2KJ Services (voir la rotation), avec son accord, site déjà livré.",
    slides: [
      "**Artisan du 974 : même métier, avant / après. Tu appelles lequel ?**",
      "Avant : capture Google ou Facebook de l'époque",
      "Après : la page d'accueil sur téléphone",
      "Après : les réalisations en photos",
      "Après : le bouton d'appel, entouré",
      "« [phrase du client] » · [Prénom], climaticien à La Possession",
      "**Ton « après » ? Maquette gratuite de ta page d'accueil. Envoie-moi PROJET en message.**",
    ],
    legende: legende(
      "[Prénom], climaticien à La Possession 🇷🇪 / Même savoir-faire. Mais maintenant, ça se voit avant le premier appel. / Ton avant/après ? Tu vois ta page d'accueil avant de t'engager. / Envoie-moi PROJET en message 👇 / #artisan974 #climatisation974 #laréunion",
    ),
  },

  "2026-12-06": {
    titre: "Reel 2 · Tous · « Tu vois ta page avant de t'engager »",
    consignes:
      "Pas de version B, c'est l'offre expliquée. C'est le dernier jour du concours : la story « dernier jour » passe le matin, ce Reel le soir.",
    plan: [
      { temps: "0–3 s", ecran: "Visage. Haut : « Artisan à La Réunion ? »", voix: "« Artisan à La Réunion ? Tu vois ta page d'accueil avant de t'engager. »" },
      {
        temps: "3–12 s",
        ecran:
          "Visage. Texte : « 1. Appel de 15 min · 2. Maquette gratuite en visio · 3. Tu décides », puis « 1 000 € en 3 fois ou 169 €/mois sans rien avancer »",
        voix: "« On s'appelle 15 minutes. Je te montre ta maquette en visio. Elle te plaît : 1 000 € en 3 fois, ou 169 € par mois sans rien avancer. Sinon, 0 €. »",
      },
      { temps: "12–15 s", ecran: "Visage. « Envoie-moi PROJET en message »", voix: "« Envoie-moi PROJET en message. »" },
    ],
    legende: legende(
      "Artisan du 974 ? / Tu vois ta page d'accueil avant de t'engager : maquette gratuite, présentée en visio. Elle te plaît pas ? 0 €. / Elle te plaît : en ligne en 7 jours dès que j'ai tes photos et infos, 1 000 € en 3 fois ou 169 €/mois sans rien avancer. / Pas de demande de devis en 90 jours ? Tu ne paies plus rien jusqu'à la première (6 mois max). / Conditions complètes : code-celeste.com/ads / Envoie-moi PROJET en message 👇 / #artisan974 #laréunion #siteweb974",
    ),
  },

  "2026-12-10": {
    titre: "Reel · Électricien · « Le camion »",
    consignes:
      "Le camion : le tien, ou celui d'un client qui est d'accord. On doit lire le nom et le numéro derrière toi. Si le nom d'un client est visible sans accord, je le floute.\n" +
      "Cadrage : téléphone à la verticale, à hauteur de poitrine, à 1,2 à 1,5 m de toi. On voit ta tête entière, avec un peu d'espace au-dessus.\n" +
      "Lumière : face à toi, jamais dans ton dos.\n" +
      "Regard : dans l'objectif, du premier au dernier mot. Reste encore 1 s en regardant la caméra après « en message ».\n" +
      "Prises : une phrase à la fois, avec 1 s de silence entre chaque. Tourne les deux accroches (A et B).\n" +
      "Son : endroit calme, sans vent. Voix seule, aucune musique au montage.\n" +
      "Dépose le rush dans rushes/ et dis-moi lequel c'est.\n" +
      "Publication : jeu 10/12 à 18 h 30. A en normal + B en Trial Reel, le même jour.",
    accrocheA: "Ton camion, il a ton nom et ton numéro dessus. Sur Google, il y a quoi ?",
    accrocheB: "Tu roulerais avec un camion sans ton nom dessus ? Non. Alors pourquoi t'es pas sur Google ?",
    plan: [
      {
        temps: "0–3 s",
        ecran:
          "Ton visage, le camion derrière toi, le nom bien visible. Texte : en haut, en gros : ÉLECTRICIEN 974 · en bas, de 0 à 5 s : bandeau Maquette gratuite avant de payer",
        voix: "Accroche A ou B",
      },
      {
        temps: "3–7 s",
        ecran: "Capture Google floutée (assets/google-electricien-saint-paul-floute.png). Texte : Il appelle le suivant.",
        voix: "« Avant de t'appeler, ton client te cherche. S'il trouve rien, il appelle le suivant. »",
      },
      { temps: "7–10 s", ecran: "Ton visage. Texte : Même si tu bosses mieux.", voix: "« Même si tu bosses mieux que lui. »" },
      {
        temps: "10–15 s",
        ecran: "Défilement d'un site client (avec accord) : nom, chantiers, bouton d'appel. Texte : Ton camion, en ligne.",
        voix: "« Un site, c'est ton camion sur Google : ton nom, tes chantiers, ton numéro. »",
      },
      {
        temps: "15–18 s",
        ecran: "Ton visage. Texte : Envoie-moi PROJET en message + @code_celeste (2 dernières secondes)",
        voix: "« Ta maquette est gratuite. Elle te plaît pas ? 0 €. Envoie-moi PROJET en message. »",
      },
    ],
    couverture: "Ton visage devant le camion + « Ton camion. Et sur Google ? »",
    legende: legende(
      "Ton camion porte ton nom dans toute l'île. Sur Google, ton client trouve quoi ? / S'il ne trouve rien, il appelle le suivant. Même si tu bosses mieux que lui. / Maquette gratuite de ta page d'accueil, 0 € si elle te plaît pas. En ligne en 7 jours dès réception de tes photos et infos. / Envoie-moi PROJET en message 👇 / #electricien974 #artisan974 #lareunion #siteweb974",
    ),
  },

  "2026-12-11": {
    titre: "Carrousel 2 · « J'ai assez de bouche-à-oreille »",
    slides: [
      "**Artisan du 974, tu dis : « J'ai assez de bouche-à-oreille. » Vrai ou faux ?**",
      "Le bouche-à-oreille, c'est ce qui marche le mieux. Garde-le.",
      "Mais quand on te recommande, le client tape ton nom sur Google avant d'appeler.",
      "Il trouve rien, ou une page Facebook pas à jour ? Il hésite.",
      "Et il demande un deuxième devis, à quelqu'un qui a l'air plus sérieux.",
      "Un site ne remplace pas le bouche-à-oreille : il le confirme.",
      "**Tu vois ta page d'accueil avant de t'engager. Envoie-moi PROJET en message.**",
    ],
    legende: legende(
      "Le bouche-à-oreille te ramène des clients. Un site les empêche de partir chez un autre au moment de vérifier. / Maquette gratuite de ta page d'accueil, 0 € si elle te plaît pas. / Envoie-moi PROJET en message 👇 / #artisan974 #laréunion #siteweb974",
    ),
  },

  "2026-12-13": {
    titre: "Reel 4 · Site client de la semaine (face caméra)",
    consignes:
      "Client : SCMOI (voir la rotation), avec son accord, site déjà livré. Je présente moi-même son site, jamais un site en cours. Pas de version B.\nAvant de tourner, vérifier sur son site que les 3 éléments cités existent (photos de chantiers, communes, bouton d'appel). S'il en manque un, citer ce qu'il a vraiment.",
    plan: [
      {
        temps: "0–3 s",
        ecran: "Visage. Haut : « Climaticien à Saint-Paul » Bas : « Maquette gratuite avant de payer »",
        voix: "« Climaticien à Saint-Paul ? Regarde ce que ses clients voient maintenant. »",
      },
      {
        temps: "3–11 s",
        ecran: "Écran : son site qui défile sur ton téléphone (accueil → réalisations → bouton d'appel entouré)",
        voix: "« Les vrais chantiers de Fabrice, les communes où il travaille, et un bouton pour l'appeler direct. Le client sait en 5 secondes s'il appelle. »",
      },
      {
        temps: "11–15 s",
        ecran: "Visage. « Envoie-moi PROJET en message »",
        voix: "« T'es artisan toi aussi ? Ta maquette est gratuite. Envoie-moi PROJET. »",
      },
    ],
    legende: legende(
      "Climaticien à Saint-Paul 🇷🇪 / Voilà ce que ses clients trouvent maintenant quand ils le cherchent : ses chantiers, ses communes, son numéro en un clic. / Ton tour ? Tu vois ta page d'accueil avant de t'engager. / Envoie-moi PROJET en message 👇 / #artisan974 #climatisation974 #laréunion",
    ),
  },

  "2026-12-15": {
    titre: "Reel 5 · Annonce du gagnant du concours",
    consignes:
      "Le gagnant a déjà accepté le lot. Cite la personne qui l'a nommé, sauf si elle refuse. Identifie le gagnant s'il a un compte.\nAucun site montré : le sien n'existe pas encore. Pour le montrer lui à l'image, il faut un accord séparé (article 9 du règlement).\nException à la règle « premier mot = la cible » : c'est une annonce pour ceux qui ont suivi le concours.",
    plan: [
      { temps: "0–3 s", ecran: "Visage. Haut : « 🎄 Le gagnant du concours »", voix: "« Le site de Noël, je l'offre à [Prénom], [métier] à [commune] ! »" },
      {
        temps: "3–10 s",
        ecran: "Écran : capture de la nomination (le pseudo de son auteur visible seulement s'il est d'accord)",
        voix: "« Nommé par @[compte] : [la raison, en une phrase, reprise de la nomination]. »",
      },
      {
        temps: "10–15 s",
        ecran: "Visage. Bas : « Ton site sans avancer un euro »",
        voix: "« Merci pour toutes vos nominations. Son site arrive en janvier. Et toi, envoie-moi PROJET. »",
      },
    ],
    legende: legende(
      "🎄 Le gagnant du concours de Noël Code Celeste, c'est… [Prénom], [métier] à [commune] ! / Nommé par @[compte] : « [extrait de la nomination] » / Son site sera en ligne en janvier, je vous montre les coulisses. Merci pour toutes vos nominations 🙏 / Ton pro préféré n'a pas gagné ? Son site peut se faire sans avancer un euro : envoie-moi PROJET en message 👇 / #artisan974 #laréunion #[métier]974",
    ),
  },

  "2026-12-17": {
    titre: "Reel 6 · Peintre / BTP · « On tape ton nom »",
    accrocheA: "Peintre à La Réunion ? On te recommande… puis on tape ton nom.",
    accrocheB: "Artisan du 974 : fais ce test, tape le nom de ta boîte sur Google.",
    plan: [
      { temps: "0–5 s", ecran: "Visage. Haut : « Peintre 974 ? » Bas : « Ce que Google montre de toi »", voix: "Accroche A ou B" },
      { temps: "5–10 s", ecran: "Écran : un nom d'entreprise fictif, une vieille page Facebook", voix: "« Pas de photos, pas d'avis. Il demande un autre devis. »" },
      { temps: "10–15 s", ecran: "Visage. « Envoie-moi PROJET en message »", voix: "« Je te prépare une maquette gratuite de ton site. Envoie-moi PROJET. »" },
    ],
    legende: legende(
      "Peintre à La Réunion ? / Même recommandé, ton client tape ton nom avant d'appeler. / Maquette gratuite de ta page d'accueil, 0 € si elle te plaît pas. / Envoie-moi PROJET en message 👇 / #peintre974 #artisan974 #laréunion",
    ),
  },

  "2026-12-18": {
    titre: "Reel 7 · Coulisses chez le gagnant",
    consignes:
      "Premier rendez-vous ou séance photo chez le gagnant. Il faut son accord séparé pour être filmé (article 9 du règlement).\nOn montre le chantier, l'atelier, la prise de photos. Jamais de maquette ni de site en cours.\nPlan B si le gagnant n'est pas disponible ou refuse d'être filmé : un client du moment, avec son accord.",
    titrePlan: "Plan A : chez le gagnant",
    plan: [
      {
        temps: "0–3 s",
        ecran: "Toi devant l'atelier ou le chantier. Haut : « Artisan du 974 ? » Bas : « Chez le gagnant du concours 🎄 »",
        voix: "« Artisan du 974 : avant de créer le site de [prénom], je viens chez lui. »",
      },
      { temps: "3–11 s", ecran: "Plans : chantier, l'artisan au travail, toi qui prends les photos", voix: "« Ses vrais chantiers, ses vraies photos. Pas d'images de banque. »" },
      { temps: "11–15 s", ecran: "Toi. « Envoie-moi PROJET en message »", voix: "« Le prochain, c'est toi ? Envoie-moi PROJET. »" },
    ],
    legende: legende(
      "Premier rendez-vous chez [prénom], [métier] à [commune], gagnant de notre concours de Noël 🎄📸 / Un site d'artisan, ça se fait avec ses vrais chantiers. / Le prochain, c'est toi ? Envoie-moi PROJET en message 👇 / #artisan974 #[métier]974 #laréunion",
    ),
    planAlternatif: {
      titre: "Plan B : chez un client du moment",
      plan: [
        { temps: "0–3 s", ecran: "Toi devant l'atelier ou le chantier. Haut : « Artisan du 974 ? »", voix: "« Avant de créer ton site, je viens chez toi. »" },
        { temps: "3–11 s", ecran: "Plans : chantier, l'artisan au travail, toi qui prends les photos", voix: "« Tes vrais chantiers, tes vraies photos. Pas d'images de banque. »" },
        { temps: "11–15 s", ecran: "Toi. « Envoie-moi PROJET en message »", voix: "« Le prochain, c'est toi ? Envoie-moi PROJET. »" },
      ],
      legende: legende(
        "Ce matin chez [prénom], [métier] à [commune] 📸 / Un site d'artisan, ça se fait avec tes vrais chantiers. / Le prochain, c'est toi ? Envoie-moi PROJET en message 👇 / #artisan974 #[métier]974 #laréunion",
      ),
    },
  },

  "2026-12-20": {
    titre: "Carrousel 3 · « Pas le temps »",
    consignes: "Jour férié (Fèt Kaf), ton léger : on rassure, on ne pousse pas.",
    slides: [
      "**Artisan du 974 : pas le temps pour un site ? Voilà tout ce que tu as à faire.**",
      "1 · Tu m'envoies PROJET en message.",
      "2 · On s'appelle 15 minutes : ton métier, tes communes, tes chantiers préférés.",
      "3 · Tu m'envoies tes photos de chantiers.",
      "Le reste, c'est moi : textes, design, mise en ligne. Tu vois ta page d'accueil avant de t'engager.",
      "En ligne en 7 jours dès que j'ai tout. Sans rien avancer : 169 €/mois, ou 1 000 € en 3 fois.",
      "**Envoie-moi PROJET en message.**",
    ],
    legende: legende(
      "Tu bosses sur les chantiers, pas sur ton site. Ton seul travail : un appel de 15 minutes et tes photos. / Conditions : code-celeste.com/ads / Envoie-moi PROJET en message 👇 / #artisan974 #laréunion #siteweb974",
    ),
  },

  "2026-12-27": {
    titre: "Reel 8 · Tous · « En janvier, tout le monde reprend »",
    accrocheA: "Artisan du 974 : en janvier tout le monde reprend. Ton site sera prêt ?",
    accrocheB: "Ta bonne résolution d'artisan pour 2027 tient en 7 jours.",
    plan: [
      { temps: "0–5 s", ecran: "Visage. Haut : « Artisan du 974 ? » Bas : « Ton site sans avancer un euro »", voix: "Accroche A ou B" },
      { temps: "5–11 s", ecran: "Visage", voix: "« Je prends 5 sites par mois, pas plus. Ton site est en ligne 7 jours après tes photos. »" },
      { temps: "11–15 s", ecran: "Visage. « Envoie-moi PROJET en message »", voix: "« Envoie-moi PROJET, on attaque 2027 ensemble. »" },
    ],
    legende: legende(
      "Artisan à La Réunion ? / Commence 2027 avec un site : maquette gratuite de ta page d'accueil, en ligne en 7 jours dès réception de tes photos et infos. / Sans rien avancer (169 €/mois) ou 1 000 € en 3 fois. 5 nouveaux sites par mois maximum. / Conditions : code-celeste.com/ads / Envoie-moi PROJET en message 👇 / #artisan974 #laréunion #siteweb974",
    ),
  },

  "2026-12-30": {
    titre: "Carrousel 4 · Bilan 2026",
    consignes:
      "Uniquement des sites livrés, de clients qui ont donné leur accord. Le site du gagnant n'est pas montré (on cite seulement son nom).",
    slides: [
      "**2026 : 10 artisans du 974 en ligne.**",
      "SM Design : capture + BTP au Tampon",
      "[nouveau client] : capture + [métier] à [commune]",
      "PAP LD : capture + peintre à Bras-Panon",
      "Collage des 5 sites montrés en décembre : L2KJ Services, Élagage Péi, SCMOI, O Milles Déco, Chandelle Émeraude",
      "Et en janvier : le site de [Prénom], [métier] à [commune], gagnant du concours de Noël 🎄",
      "Merci à eux pour leur confiance 🙏",
      "**En 2027, le prochain, c'est toi ? Envoie-moi PROJET en message.**",
    ],
    legende: legende(
      "10 artisans du 974 nous ont fait confiance en 2026, et [Prénom] les rejoint en janvier 🎄 Merci 🙏 / Le prochain, c'est toi ? Ton site sans avancer un euro. / Envoie-moi PROJET en message 👇 / #artisan974 #laréunion #codeceleste",
    ),
  },
};

// ——— Reels courts (22/11/2026, Maxime : 5 posts par semaine) ———

const BANDEAU_COURT = "Ton site sans avancer un euro";

/**
 * 7 Reels courts (10–15 s) : même voix que les stories FAQ/conseil. Pilier : FAQ → objections, conseil → personal brand.
 * La « réponse en une phrase » de la légende reprend les mots de la voix.
 */
const REELS_COURTS: { date: string; type: "Conseil" | "FAQ"; titre: string; haut: string; voix: string; reponse: string }[] = [
  {
    date: "2026-12-02",
    type: "Conseil",
    titre: "Ton numéro est cliquable ?",
    haut: "Artisan du 974 : ton numéro est cliquable ?",
    voix: "« Artisan du 974, petit test : ouvre ta page Facebook sur ton téléphone et appuie sur ton numéro. Ça appelle direct ? Sinon, ajoute le bouton Appeler sur ta page. Ton client va pas recopier ton numéro. »",
    reponse: "Ton client va pas recopier ton numéro : ajoute le bouton Appeler sur ta page.",
  },
  {
    date: "2026-12-08",
    type: "FAQ",
    titre: "Je dois fournir quoi ?",
    haut: "Artisan du 974 : pour ton site, tu fournis quoi ?",
    voix: "« Pour ton site, tu me donnes tes photos de chantiers, ton logo si t'en as un, et tes infos. Les textes, c'est moi qui les écris. »",
    reponse: "Tes photos de chantiers, ton logo si t'en as un, et tes infos : les textes, c'est moi qui les écris.",
  },
  {
    date: "2026-12-09",
    type: "Conseil",
    titre: "Tes vraies photos de chantier",
    haut: "Artisan du 974 : tes vraies photos de chantier",
    voix: "« Artisan, ton client veut voir TON travail, pas des images trouvées sur internet. À la fin de chaque chantier, prends 3 photos en plein jour. Et mets-les sur ta fiche Google et ta page Facebook. »",
    reponse: "À la fin de chaque chantier, prends 3 photos en plein jour.",
  },
  {
    date: "2026-12-16",
    type: "Conseil",
    titre: "Fermé pour les fêtes ?",
    haut: "Artisan du 974 : fermé pour les fêtes ?",
    voix: "« Tu fermes entre Noël et le jour de l'an ? Mets des horaires exceptionnels sur ta fiche Google. Sinon ton client se déplace ou appelle pour rien, et il s'en souvient. »",
    reponse: "Mets des horaires exceptionnels sur ta fiche Google.",
  },
  {
    date: "2026-12-22",
    type: "FAQ",
    titre: "Ça prend combien de temps ?",
    haut: "Artisan du 974 : un site, ça prend combien de temps ?",
    voix: "« 7 jours. Dès que j'ai tes photos et tes infos, ton site est en ligne en 7 jours. Et avant de payer, tu vois ta maquette. »",
    reponse: "Dès que j'ai tes photos et tes infos, ton site est en ligne en 7 jours.",
  },
  {
    date: "2026-12-23",
    type: "Conseil",
    titre: "Demande ton avis Google",
    haut: "Artisan du 974 : demande ton avis Google",
    voix: "« Chantier fini, client content ? Demande-lui un avis Google tout de suite, pas une semaine après. Envoie-lui le lien de ta fiche par WhatsApp : ça lui prend une minute. »",
    reponse: "Chantier fini, client content : demande-lui un avis Google tout de suite, pas une semaine après.",
  },
  {
    date: "2026-12-29",
    type: "FAQ",
    titre: "Et si personne m'appelle ?",
    haut: "Artisan du 974 : et si personne m'appelle ?",
    voix: "« Je peux pas te promettre un nombre d'appels. Mais si tu reçois aucune demande de devis en 90 jours, tu paies plus rien jusqu'à la première, 6 mois max. »",
    reponse: "Si tu reçois aucune demande de devis en 90 jours, tu paies plus rien jusqu'à la première, 6 mois max.",
  },
];

export const PUBLICATIONS_REELS_COURTS: (Pick<Doc<"publications">, "date" | "pilier" | "format" | "metier" | "accroche" | "cta">)[] =
  REELS_COURTS.map((r) => ({
    date: r.date,
    pilier: r.type === "FAQ" ? "objections" : "personal-brand",
    format: "Reel court",
    metier: "Tous",
    accroche: r.haut,
    cta: "PROJET",
  }));

export const SCRIPTS_REELS_COURTS: Record<string, Script> = Object.fromEntries(
  REELS_COURTS.map((r) => [
    r.date,
    {
      titre: `Reel court · ${r.type} « ${r.titre} »`,
      consignes: "10–15 s, face caméra, visage en gros plan, sous-titres incrustés. Même voix que la story " + (r.type === "FAQ" ? "FAQ" : "conseil") + ".",
      plan: [
        {
          temps: "0–15 s",
          ecran: `Visage. Haut, dès 0 s : « ${r.haut} » · Bas, de 0 à 5 s : « ${BANDEAU_COURT} »`,
          voix: r.voix,
        },
      ],
      legende: legende(
        `Artisan du 974 ? / ${r.titre} / ${r.reponse} / Ton site sans avancer un euro, et tu vois ta page d'accueil avant de t'engager. / Envoie-moi PROJET en message 👇 / #artisan974 #laréunion #siteweb974`,
      ),
    },
  ]),
);

// ——— Stories ———

export type StoryV2 = {
  theme: string;
  visuelType: Infer<typeof visuelType>;
  visuel: string;
  texte: string;
  sticker: Sticker;
  apres: string;
  voix?: string;
};

const question = (libelle: string): Sticker => ({ type: "question", libelle, reponses: [], lien: "" });
const compteARebours = (libelle: string): Sticker => ({ type: "compte-a-rebours", libelle, reponses: [], lien: "" });

/** Stories FAQ du mardi (face caméra, 10–15 s). Les mardis 1/12 et 15/12 sont des stories du concours. */
const FAQ: Record<string, { texte: string; voix: string }> = {
  "2026-12-08": {
    texte: "Je dois fournir quoi ?",
    voix: "« Pour ton site, tu me donnes tes photos de chantiers, ton logo si t'en as un, et tes infos. Les textes, c'est moi qui les écris. »",
  },
  "2026-12-22": {
    texte: "Ça prend combien de temps ?",
    voix: "« 7 jours. Dès que j'ai tes photos et tes infos, ton site est en ligne en 7 jours. Et avant de payer, tu vois ta maquette. »",
  },
  "2026-12-29": {
    texte: "Et si personne m'appelle ?",
    voix: "« Je peux pas te promettre un nombre d'appels. Mais si tu reçois aucune demande de devis en 90 jours, tu paies plus rien jusqu'à la première, 6 mois max. »",
  },
};

/** Stories conseil du mercredi (face caméra, 15 s). */
export const CONSEILS_MERCREDI: Record<string, { texte: string; voix: string }> = {
  "2026-12-02": {
    texte: "Ton numéro est cliquable ?",
    voix: "« Artisan du 974, petit test : ouvre ta page Facebook sur ton téléphone et appuie sur ton numéro. Ça appelle direct ? Sinon, ajoute le bouton Appeler sur ta page. Ton client va pas recopier ton numéro. »",
  },
  "2026-12-09": {
    texte: "Tes vraies photos de chantier",
    voix: "« Artisan, ton client veut voir TON travail, pas des images trouvées sur internet. À la fin de chaque chantier, prends 3 photos en plein jour. Et mets-les sur ta fiche Google et ta page Facebook. »",
  },
  "2026-12-16": {
    texte: "Fermé pour les fêtes ?",
    voix: "« Tu fermes entre Noël et le jour de l'an ? Mets des horaires exceptionnels sur ta fiche Google. Sinon ton client se déplace ou appelle pour rien, et il s'en souvient. »",
  },
  "2026-12-23": {
    texte: "Demande ton avis Google",
    voix: "« Chantier fini, client content ? Demande-lui un avis Google tout de suite, pas une semaine après. Envoie-lui le lien de ta fiche par WhatsApp : ça lui prend une minute. »",
  },
  "2026-12-30": {
    texte: "Le test avant 2027",
    voix: "« Avant 2027, fais ce test : tape le nom de ta boîte et ta commune sur Google. Ce que tu vois, c'est ce que voit ton client. Envoie-moi PROJET en message. »",
  },
};

const FACE_CAMERA = "Face caméra, visage en gros plan, sous-titres incrustés.";

export const faq = (date: string): StoryV2 | null =>
  FAQ[date]
    ? {
        theme: "FAQ en 10 s",
        visuelType: "video",
        visuel: FACE_CAMERA,
        texte: FAQ[date].texte,
        voix: FAQ[date].voix,
        sticker: question("Pose-moi ta question sur les sites"),
        apres: "Réponse en message dans la journée.",
      }
    : null;

export const conseil = (date: string): StoryV2 | null =>
  CONSEILS_MERCREDI[date]
    ? {
        theme: "Conseil 15 s",
        visuelType: "video",
        visuel: FACE_CAMERA,
        texte: CONSEILS_MERCREDI[date].texte,
        voix: CONSEILS_MERCREDI[date].voix,
        sticker: question("Pose-moi ta question sur les sites"),
        apres: "Réponse en message dans la journée.",
      }
    : null;

/** Stories du concours qui remplacent la story prévue ce jour-là. */
export const CONCOURS_REMPLACE: Record<string, StoryV2> = {
  "2026-12-01": {
    theme: "Concours de Noël",
    visuelType: "capture",
    visuel: "Captures de 2 ou 3 nominations touchantes (avec l'accord de leurs auteurs)",
    texte: "🎄 Plus que 5 jours pour nommer ton pro du 974 !",
    sticker: compteARebours("Jusqu'au 6/12 23 h 59 + partage du Reel du concours"),
    apres: "",
  },
  "2026-12-12": {
    theme: "Concours de Noël",
    visuelType: "capture",
    visuel: "Captures des plus belles nominations (avec accord), aucun site en cours",
    texte: "Les plus belles nominations 🎄 Résultat mardi !",
    sticker: compteARebours("Jusqu'au 15/12 18 h 30"),
    apres: "Entre le 7 et le 14/12, rien en public sur le choix du gagnant.",
  },
  "2026-12-15": {
    theme: "Concours de Noël · gagnant",
    visuelType: "partage",
    visuel: "Partage du Reel d'annonce + mention du gagnant",
    texte: "🎄 On a un gagnant !",
    sticker: { type: "mention", libelle: "@[compte] du gagnant (s'il a un compte)", reponses: [], lien: "" },
    apres: "",
  },
};

/** Stories du concours ajoutées en plus de celle du jour : `ordre` 0 = avant, 2 = après la story du jour (1). */
export const CONCOURS_AJOUT: { date: string; ordre: number; story: StoryV2 }[] = [
  {
    date: "2026-12-03",
    ordre: 2,
    story: {
      theme: "Concours de Noël · rappel (après le relais du Reel)",
      visuelType: "partage",
      visuel: "Partage du Reel du concours",
      texte: "T'as nommé ton pro ? C'est jusqu'à dimanche 👇",
      sticker: compteARebours("Jusqu'au 6/12 23 h 59"),
      apres: "",
    },
  },
  {
    date: "2026-12-06",
    ordre: 0,
    story: {
      theme: "Concours de Noël · dernier jour (le matin, avant le relais du Reel)",
      visuelType: "partage",
      visuel: "Partage du Reel du concours",
      texte: "Dernier jour ! Nominations jusqu'à 23 h 59 ce soir 🎄",
      sticker: compteARebours("Jusqu'à 23 h 59"),
      apres: "",
    },
  },
];

/** Texte d'offre du vendredi (relais + offre). */
export const TEXTE_VENDREDI = "Ton site sans avancer un euro. Pas de demande de devis en 90 jours ? Tu ne paies plus rien jusqu'à la première.";

/** Samedi « site de la semaine », écran 2. */
export const SAMEDI_ECRAN_2 = "Tu veux le tien ? Maquette gratuite de ta page d'accueil 👇\nou envoie-moi PROJET en message";
export const SAMEDI_SITE_LIVRE = "Le site montré doit être déjà livré, jamais un site en cours.";

/**
 * Rotation des clients montrés en décembre (prompt du 21/11/2026) : chaque contenu qui montre un client en montre un différent.
 * Choix de Maxime du 21/11 : PAP LD (plan B du 4/12 et 30/12), O Milles Déco (19/12), Chandelle Émeraude (26/12).
 * Smart Power System retiré du 30/12 : un des 2 nouveaux clients le remplacera ([nouveau client]).
 */
export const CLIENTS_MONTRES_PUBLICATIONS: Record<string, string> = {
  "2026-12-04": "L2KJ Services (plan B : PAP LD)",
  "2026-12-11": "Aucun",
  "2026-12-13": "SCMOI",
  "2026-12-20": "Aucun",
  "2026-12-30": "SM Design, [nouveau client], PAP LD, + collage des 5 autres",
};

export const CLIENTS_MONTRES_STORIES: Record<string, string> = {
  "2026-12-05": "Élagage Péi",
  "2026-12-12": "Aucun",
  "2026-12-19": "O Milles Déco",
  "2026-12-26": "Chandelle Émeraude",
};

/** Samedis « site de la semaine » de décembre : client, métier et commune (sites relus le 21/11). */
export const SAMEDIS_DECEMBRE: Record<string, { client: string; metierCommune: string; site: string }> = {
  "2026-12-05": { client: "Élagage Péi", metierCommune: "élagueur à Saint-Denis", site: "www.elagage-pei.re" },
  "2026-12-19": { client: "O Milles Déco", metierCommune: "décoration d'événements à Saint-Benoît", site: "www.o-milles-deco.re" },
  "2026-12-26": { client: "Chandelle Émeraude", metierCommune: "locations de vacances à Sainte-Rose", site: "www.chandelle-emeraude.fr" },
};
