# Site de suivi Instagram/Facebook — Code Celeste

> v2 — contenu et fonctionnalités. La stratégie du mois (calendrier, indicateurs, règles, points de contrôle) est dans [`../AGENTS.md`](../AGENTS.md) ; les données initiales ci-dessous en sont tirées.

## Stack, design, déploiement

Décidé le 01/11/2026 : Next.js 14 (App Router), TypeScript strict, Tailwind CSS, framer-motion, **Convex** (base de données) lu via **TanStack Query**, déploiement **Vercel**. Accès privé par mot de passe unique (`APP_PASSWORD`), vérifié par le middleware et par chaque fonction Convex. Mise en page desktop d'abord, responsive jusqu'au téléphone. Détails et procédures : [README.md](README.md).

---

## 1. Objectif

Un site de suivi pour piloter le mois de contenu Instagram/Facebook (novembre 2026). Maxime doit pouvoir, depuis son téléphone :

1. suivre les 12 publications du mois (statut, vues, demandes PROJET) ;
2. saisir chaque dimanche les indicateurs de la semaine et voir automatiquement quelle règle de décision s'applique ;
3. cocher les éléments à préparer pour les deux points de contrôle (15/11 et 29/11).

## 2. Exigences fonctionnelles

- Usage principal sur **téléphone**
- Interface en **français**
- Outil **privé** : les chiffres ne doivent pas être visibles publiquement
- Toute modification (statut, chiffre, case cochée, note) est **sauvegardée** et retrouvée après rechargement
- Saisie des chiffres **à la main** (pas de connexion à Instagram/Facebook)
- Réutilisable pour les mois suivants (ajouter un mois, ses publications et ses semaines)

## 3. Pages

### Page 1 — Calendrier (`/`)

Liste des 12 publications, regroupées par semaine. Chaque carte affiche : date, pilier (badge de couleur), format, métier, accroche, et trois champs modifiables :
- **Statut** : À préparer / Tourné / Publié / Reporté
- **Vues à 48 h** (nombre)
- **PROJET reçus** (nombre)

En haut de page : compteur « X / 12 publiées » et rappel « Avis clients à recevoir avant le 20/11 » tant que la publication du 27/11 (carrousel avis clients) n'est pas au statut Tourné.

Données initiales (seed) :

| Date | Pilier | Format | Métier | Accroche |
| --- | --- | --- | --- | --- |
| 2026-11-02 | Prise de conscience | Reel (A normal + B Trial) | Plombier | « Ton client fait ça avant de t'appeler. » |
| 2026-11-04 | Objections | Carrousel | Tous | « J'ai déjà Facebook, ça suffit. » Vrai ou faux ? |
| 2026-11-06 | Preuves | Reel avant/après | BTP (SM Design) | « 20 ans de métier. Zéro site. » |
| 2026-11-09 | Prise de conscience | Reel face caméra (Trial A/B sam 7/11) | Électricien | « Le client qui tombe sur ta messagerie, il ne rappelle pas. » |
| 2026-11-11 | Personal brand | Reel face caméra | Tous | « Les 3 questions que je pose à un artisan avant de faire son site » |
| 2026-11-13 | Preuves | Carrousel étude de cas | Smart Power System | « Une quinzaine de demandes depuis la mise en ligne. » |
| 2026-11-16 | Prise de conscience | Reel écran Google (Trial A/B sam 14/11) | Clim | « 32 °C, clim en panne : le client appelle qui ? » |
| 2026-11-18 | Objections | Carrousel prix (sur mesure) | Tous | « Un site d'artisan à La Réunion, ça coûte combien vraiment ? » |
| 2026-11-20 | Personal brand | Reel face caméra | Tous | « 3 choses que je refuse de mettre sur le site d'un artisan. » |
| 2026-11-23 | Prise de conscience | Reel écran Google (Trial A/B sam 21/11) | Peintre | « Fais ce test : tape le nom de ta boîte sur Google. » |
| 2026-11-25 | Preuves | Carrousel avant/après | [artisan client] | « Même artisan. Avant / après. Tu appelles lequel ? » |
| 2026-11-27 | Preuves | Carrousel avis clients | Clients (avec accord) | « Ce que mes clients artisans m'ont écrit après la mise en ligne » |

Les dates, métiers et accroches doivent rester modifiables.

### Page 2 — Suivi hebdomadaire (`/suivi`)

Tableau indicateurs × semaines (S0 = 25/10–1/11, S1 à S4 = les 4 semaines de novembre). Sur mobile : une carte par semaine, avec un formulaire de saisie, plus une vue tableau en mode paysage.

Indicateurs (seed) :

| Clé | Indicateur | Où le trouver |
| --- | --- | --- |
| `reach_non_followers` | Comptes touchés non abonnés | Tableau de bord pro |
| `profile_visits` | Visites du profil | Tableau de bord pro |
| `link_clicks` | Clics sur le lien | Tableau de bord pro |
| `shares_saves` | Partages + enregistrements (total des posts) | Statistiques de chaque post |
| `projet_total` | Commentaires PROJET + DM (Insta + Facebook) | Manuel |
| `projet_organic` | … dont « organique » | Manuel (réponse à « tu m'as découvert comment ? ») |
| `mockups` | Maquettes faites | Manuel |
| `signed` | Clients signés | Manuel |
| `ad_cost_per_lead` | Coût par prospect pub (€) | Gestionnaire de publicités |
| `ad_leads` | Prospects pub | Manuel |
| `ad_mockups` | Maquettes issues de prospects pub | Manuel |
| `ad_signed` | Signés issus de prospects pub | Manuel |

Calculs automatiques à afficher :
- taux prospects pub → maquettes (`ad_mockups / ad_leads`) et maquettes → signés (`ad_signed / ad_mockups`), par semaine ;
- flèche ↑ ↓ → par indicateur par rapport à la semaine précédente ;
- objectif « 1 PROJET organique / semaine » : vert si atteint, rouge sinon.

**Moteur de règles.** Un indicateur « stagne » s'il ne monte pas (égal ou en baisse) **deux semaines de suite**. Quand une condition est vraie, afficher une alerte avec le diagnostic et l'action. Règles (seed, modifiables) :

| Condition | Problème | Action |
| --- | --- | --- |
| `reach_non_followers` stagne | Les 3 premières secondes | Nouvelles accroches en Trial Reel, plus directes, avec un chiffre ou une question |
| `reach_non_followers` monte et `profile_visits` stagne | Le Reel plaît mais ne donne pas envie d'en savoir plus | Ajouter « Le reste sur mon profil » à l'écran, parler plus clairement de l'offre à la fin |
| `profile_visits` monte et `link_clicks` stagne | La bio ou les épinglés | Revoir la ligne 1 de la bio et l'épinglé n°1 |
| `link_clicks` monte et `projet_total` = 0 | La page /ads | Vérifier la page sur téléphone, l'offre, le bouton de contact |
| `projet_total` > 0 et `mockups` stagne | Les DM | Répondre plus vite, proposer l'appel plus tôt |
| `mockups` > 0 et `signed` stagne | L'offre | Pas un problème Instagram : à traiter au point de contrôle S4 |
| `projet_organic` = 0 cumulé après S4 | L'accroche ou l'offre | Changer d'angle : un seul métier, un seul message |
| taux pub → maquette en hausse après S2 | Rien : l'image aide à convertir | Continuer |

Afficher sous les alertes : « Une seule chose à changer à la fois. Moins de 10 prospects pub par mois = écart non significatif, ne pas conclure. »

### Page 3 — Points de contrôle (`/controles`)

Deux checklists avec cases à cocher persistées et une zone de notes libre par point de contrôle.

**Dimanche 15/11 (fin S2)**
- Capture du tableau de bord pro sur 14 jours (comptes touchés, abonnés / non-abonnés, visites, clics lien)
- Capture des statistiques de chaque Reel publié : vues, durée de visionnage moyenne, partages, enregistrements
- Pour chaque test A/B : les statistiques des deux Trial Reels côte à côte
- Le tableau de suivi (S0, S1, S2) rempli
- Combien de PROJET reçus, dont combien sur Facebook, et la source de chacun
- Où en sont les 5 demandes d'avis clients (oui / non / pas de réponse)
- La décision sur la fourchette de prix

**Dimanche 29/11 (fin S4)**
- Les mêmes captures, sur 30 jours
- Le tableau de suivi complet (S0 à S4)
- Côté pub : coût par prospect du mois et prospects pub → maquettes → signés, comparés à octobre
- Les 3 publications qui ont le mieux marché et les 3 pires
- Ce qui n'a pas été tenu (rythme, stories, tournage)

Bouton **« Exporter le point de contrôle »** : génère un texte récapitulatif (indicateurs de la période + alertes actives + checklist + notes) à copier-coller dans la conversation Claude.

## 4. Critères de fin

- [ ] Accès privé : personne d'autre que Maxime ne voit les données
- [ ] Les 3 pages fonctionnent sur téléphone
- [ ] Toutes les données initiales ci-dessus sont chargées
- [ ] Une modification (statut, chiffre, case cochée, note) est sauvegardée et visible après rechargement
- [ ] Le moteur de règles affiche la bonne alerte sur un jeu de test (2–3 cas)
- [ ] L'export texte du point de contrôle fonctionne

Terminer par un rapport court : où trouver le site, ce qui marche, ce qui reste à faire, comment ajouter le mois de décembre.
