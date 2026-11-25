import { nombre, pourcent } from "@/lib/format";
import type { MoisData } from "@/lib/hooks/useMois";
import { estReel, messages } from "@/lib/publications";
import { deriver, taux, type Valeurs } from "@/lib/regles";
import { statsSemaine } from "@/lib/stories";

export type Ton = "accent" | "vert" | "rouge";
export type Cellule = { texte: string; ton?: Ton; badge?: boolean };
export type LigneCalculee = { label: string; depart?: string; objectif?: string; cellules: Cellule[] };

type Semaine = MoisData["semaines"][number];

/** Le mois suit les messages (décembre) plutôt que la pub et les PROJET (novembre). */
export const suiviDecembre = (data: Pick<MoisData, "indicateurs">) => data.indicateurs.some((i) => i.key === "messages_projet");

const dans = (date: string, s: Pick<Semaine, "debut" | "fin">) => date >= s.debut && date <= s.fin;

/** Lignes calculées du suivi hebdo (sous les indicateurs saisis), pour le tableau, les cartes et l'export. */
export function lignesCalculees(data: MoisData, saisies: Valeurs, semaines: Semaine[] = data.semaines): LigneCalculee[] {
  const v = deriver(saisies, semaines.length);
  const parSemaine = (f: (s: Semaine, i: number) => Cellule) => semaines.map(f);

  const stories: LigneCalculee[] = [
    {
      label: "Stories publiées",
      cellules: parSemaine((s) => {
        const st = statsSemaine(data.stories, s);
        return { texte: st ? `${st.publiees} / ${st.total}` : "–" };
      }),
    },
    {
      label: "Messages reçus via les stories",
      cellules: parSemaine((s) => {
        const st = statsSemaine(data.stories, s);
        return { texte: st ? String(st.messages) : "–", ton: st?.messages ? "accent" : undefined };
      }),
    },
  ];

  if (!suiviDecembre(data)) {
    return [
      {
        label: "Taux prospects pub → maquettes",
        cellules: parSemaine((_, i) => ({ texte: pourcent(taux(v, "ad_mockups", "ad_leads", i)) })),
      },
      {
        label: "Taux maquettes → signés (pub)",
        cellules: parSemaine((_, i) => ({ texte: pourcent(taux(v, "ad_signed", "ad_mockups", i)) })),
      },
      ...stories,
      {
        label: "Objectif : 1 PROJET organique / semaine",
        cellules: parSemaine((_, i) => objectif(v.projet_organic?.[i] ?? null)),
      },
    ];
  }

  const pubs = (s: Semaine) => data.publications.filter((p) => dans(p.date, s));
  const somme = <T>(liste: T[], f: (x: T) => number) => liste.reduce((t, x) => t + f(x), 0);

  return [
    {
      label: "Taux de clics (clics / visites du profil)",
      depart: "6 %",
      objectif: "10 % ou plus",
      cellules: parSemaine((_, i) => {
        const t = taux(v, "link_clicks", "profile_visits", i);
        return { texte: pourcent(t), ton: t === null ? undefined : t >= 0.1 ? "vert" : "rouge" };
      }),
    },
    {
      label: "Messages reçus (PROJET + autres)",
      depart: "0",
      objectif: "1 par semaine minimum",
      cellules: parSemaine((_, i) => {
        const n = v.messages_total?.[i] ?? null;
        return { texte: nombre(n), ton: n ? "accent" : undefined };
      }),
    },
    {
      label: "Objectif : 1 message / semaine",
      cellules: parSemaine((_, i) => objectif(v.messages_total?.[i] ?? null)),
    },
    {
      label: "Messages par source (Reels · carrousels · stories)",
      cellules: parSemaine((s) => {
        const p = pubs(s);
        const st = statsSemaine(data.stories, s)?.messages ?? 0;
        return {
          texte: `${somme(p.filter(estReel), messages)} · ${somme(p.filter((x) => !estReel(x)), messages)} · ${st}`,
        };
      }),
    },
    ...stories,
  ];
}

function objectif(valeur: number | null): Cellule {
  if (valeur === null) return { texte: "–" };
  return valeur >= 1 ? { texte: "Atteint", ton: "vert", badge: true } : { texte: "Non atteint", ton: "rouge", badge: true };
}

/** Couleur d'une valeur saisie : durée de vue des Reels rouge sous 5 s, verte à 7 s ou plus. */
export function tonSaisie(key: string, valeur: number | null | undefined): Ton | undefined {
  if (key !== "reel_watch_time" || valeur === null || valeur === undefined) return undefined;
  return valeur < 5 ? "rouge" : valeur >= 7 ? "vert" : undefined;
}
