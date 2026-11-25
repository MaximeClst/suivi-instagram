# Site de suivi Instagram/Facebook — Code Celeste

Outil privé pour piloter le mois de contenu : calendrier des publications, suivi hebdomadaire avec moteur de règles, points de contrôle avec export texte. Spécification : [AGENTS.md](AGENTS.md).

## Stack

- Next.js 14 (App Router), TypeScript strict, Tailwind CSS, framer-motion
- Convex (base de données temps réel) lu via TanStack Query (`@convex-dev/react-query`)
- Hébergement : Vercel

## Lancer en local

```bash
pnpm install
pnpm convex   # terminal 1 : synchronise les fonctions Convex (convex/)
pnpm dev      # terminal 2 : http://localhost:3000
```

`.env.local` contient l'URL Convex et `APP_PASSWORD`, le mot de passe d'accès. Le même mot de passe doit être défini côté Convex (`npx convex env set APP_PASSWORD …`).

Tests du moteur de règles : `pnpm test`.

## Accès privé

- `middleware.ts` renvoie vers `/connexion` sans le bon cookie.
- Chaque fonction Convex vérifie aussi le mot de passe (`convex/acces.ts`) : les données ne sont pas lisibles sans lui, même en appelant Convex directement.
- Le site demande aux moteurs de recherche de ne pas l'indexer.

## Données

- Novembre 2026 est chargé par `npx convex run seed:init` (déjà fait, sans effet si relancé).
- Scripts des 12 publications de novembre : `npx convex run scripts:charger`. Reels d'essai « photo + texte » (6 Trial Reels, CTA abonnement, suivis à part des publications et des PROJET) : `npx convex run reelsEssai:charger`. Stories du 12 au 30/11 : `npx convex run stories:charger`. Ajouter `--prod` pour la production. Ces commandes n'ajoutent que ce qui manque et ne touchent pas aux données saisies.
- Les règles de décision sont communes à tous les mois. Leur diagnostic et leur action se modifient sur la page Suivi. Les conditions sont codées dans `lib/regles.ts`.

## Décembre 2026

Chargé par `npx convex run decembre:init` (`--prod` pour la production ; relançable, n'ajoute que ce qui manque) : 11 publications à 18 h 30 (CTA, accroche B des Trial Reels, résultats A/B), 31 stories, semaines S1 à S5 avec tournage le mardi, indicateurs et règles propres au mois (sans la pub), points de contrôle du 13/12 et du 03/01. Novembre garde ses indicateurs et ses règles. Page **Mini-audits** : une ligne par audit, total par semaine.

22/11/2026 : 5 posts et 4 stories par semaine (jeudi à dimanche ; lundi à mercredi seulement pour le concours du 1/12 et du 15/12), 7 Reels courts en plus (19 publications), alerte au point de contrôle du 13/12. Sur des données déjà chargées : `npx convex run decembre:cinqPostsParSemaine` (`--prod` pour la production ; relançable).

Scripts de décembre (`convex/scriptsDecembre.ts`, chargés par le même `decembre:init`) : fiche script de chaque publication (accroches A/B, plan Temps / Image / Voix, slides, légende, boutons « Copier la voix » et « Copier la légende », modifiable depuis le crayon « Modifier le script »), voix des stories conseil du mercredi, bouton **« À tourner cette semaine »** en haut du calendrier (à partir de décembre). Un script déjà modifié sur le site n'est jamais écrasé.

25/11/2026 : `decembre:appliquerV3` (scripts gabarits A/B/C, CTA MAQUETTE, 1 à 3 stories par semaine), `decembre:appliquerV4` (répartition des piliers de novembre, Reels d'essai retirés, vues manuelles retirées), `decembre:appliquerV5` (leviers de croissance : créole, « Je note ta page », tier list, CTA NOTE, collaborations, abonnement). Les données sont passées en argument (`--prod`, relançables). Le diagnostic NOTE n'apparaît pas sur le site (choix de Maxime, 25/11) : il se suit dans la session Claude « Diagnostic NOTE ». Dans le calendrier de décembre, le CTA PROJET s'affiche MAQUETTE et Mini-audit s'affiche NOTE.

## Ajouter un mois suivant

1. Dans le sélecteur de mois (en haut à droite), choisir **« + Ajouter … »**.
2. Le site crée les semaines S0 à S4 (S0 commence le lendemain de la dernière semaine de novembre) et les deux points de contrôle (fin S2, fin de mois), avec les checklists du mois précédent décochées. Les indicateurs et règles sont ceux de novembre tant que le mois n'a pas sa propre liste.
3. Sur la page Calendrier, **« Ajouter une publication »**, puis le crayon de chaque carte pour régler la date, le pilier, le format, le métier et l'accroche.

## Stats Instagram (synchro automatique via Treg)

Les stats de @code_celeste arrivent toutes seules : toutes les 3 heures (`convex/crons.ts`) et au clic sur « Mettre à jour depuis Instagram » (calendrier et suivi hebdo).

- **Comment** : l'action Convex `instagram.synchroniser` appelle Treg (`https://treg.to/call/instagram/...`), qui passe par la connexion Instagram de l'équipe Treg `claudio-insta`. Gratuit (pas de crédit du catalogue). Environ 35 appels par synchro.
- **Jeton** : variable d'environnement Convex `TREG_TOKEN` (clé Treg « suivi-insta », limitée à Instagram, 1 000 appels/jour max). Jamais dans le code ni dans le navigateur.
- **Ce qui se remplit** : vues, durée de vue moyenne, partages, enregistrements par publication (A et B), vues à 48 h (relevées tant que le post a moins de 48 h), statut « Publié » ; par semaine : non-abonnés touchés (ou vues des non-abonnés en décembre), visites du profil, clics sur le lien, partages + enregistrements, durée de vue des Reels.
- **Reste à la main** : PROJET, messages, maquettes, signés, % non-abonnés par post, abonnés gagnés et visites du profil des Reels d'essai (Instagram ne les donne pas par Reel).
- **Correspondance post ↔ publication** : même jour (heure de La Réunion) et même type ; version A = Reel partagé aux abonnés, B = Trial Reel de même légende. Si elle se trompe : crayon de la carte → « Lien Instagram ».
- **Saisies manuelles protégées** : un chiffre tapé à la main n'est jamais écrasé ; l'écart s'affiche en orange avec « Prendre … ». Logique et tests : `lib/instagram.ts`, `lib/instagram.test.ts`.

**Mise en production** (pas encore faite) : créer une clé et la ranger en prod, puis déployer :

```bash
treg org agent-new suivi-insta-prod --tools instagram --cap 1000
npx convex env set TREG_TOKEN <la clé affichée> --prod
npx convex deploy
```

## Production

- Site : https://suivi-instagram.vercel.app (projet Vercel `suivi-instagram`)
- Convex production : `graceful-dotterel-490` (développement : `bold-chihuahua-597`)
- Variables Vercel (production) : `NEXT_PUBLIC_CONVEX_URL` et `APP_PASSWORD`. Côté Convex prod : `APP_PASSWORD`, la même valeur.

Mettre à jour :

- **Fonctions Convex** (dossier `convex/`) : `npx convex deploy`. Vercel ne le fait pas : aucune clé Convex n'est stockée chez Vercel.
- **Pages du site** : `vercel deploy --prod` depuis `site-suivi`.

Changer le mot de passe : le modifier dans `.env.local`, puis `npx convex env set APP_PASSWORD …` (dev), `npx convex env set --prod APP_PASSWORD …` et sur Vercel (Settings → Environment Variables), puis `vercel deploy --prod`.
