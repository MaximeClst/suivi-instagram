/**
 * Rotation des clients montrés (décembre 2026) : chaque contenu qui montre un client en montre un différent.
 * Alerte si un même client revient en moins de 30 jours, novembre compris.
 */

export const DELAI_JOURS = 30;

/**
 * La rotation commence en décembre : novembre compte dans les 30 jours, mais deux apparitions
 * toutes les deux en novembre (déjà publiées) ne déclenchent pas d'alerte.
 */
export const DEBUT_ROTATION = "2026-12-01";

/** Routine du samedi, planning de décembre (prompt du 21/11/2026). */
export const PLANNING_SAMEDI =
  "5/12 Élagage Péi · 12/12 remplacé par les nominations du concours · 19/12 O Milles Déco · 26/12 Chandelle Émeraude";

/**
 * Contenus de novembre qui montraient un client. Novembre n'a pas de champ « Client montré » :
 * ces lignes viennent des scripts de novembre (6/11 SM Design, 13/11 SCMOI, et les notes des stories
 * du samedi : « L2KJ est dans le Reel du 16/11 », « PAP LD est dans le Reel du 23/11 »).
 */
export const CONTENUS_NOVEMBRE: Entree[] = [
  { date: "2026-11-06", contenu: "Reel avant/après", texte: "SM Design" },
  { date: "2026-11-13", contenu: "Carrousel étude de cas", texte: "SCMOI" },
  { date: "2026-11-16", contenu: "Reel écran Google (Clim)", texte: "L2KJ Services" },
  { date: "2026-11-23", contenu: "Reel écran Google (Peintre)", texte: "PAP LD" },
  // Stories « Site de la semaine » (convex/stories.ts, SITES_SEMAINE) : le client n'est que dans le texte.
  { date: "2026-11-14", contenu: "Story · Site de la semaine", texte: "SM Design" },
  { date: "2026-11-21", contenu: "Story · Site de la semaine", texte: "PAP LD" },
  { date: "2026-11-28", contenu: "Story · Site de la semaine", texte: "L2KJ Services" },
];

/** Un contenu et le texte de son champ « Client montré ». */
export type Entree = { date: string; contenu: string; texte: string };

export type Apparition = { date: string; contenu: string; cle: string; alerte: boolean };
export type LigneRotation = { client: string; apparitions: Apparition[]; alerte: boolean };

/**
 * Les clients réellement montrés dans un champ « Client montré » :
 * « Aucun » → personne ; le plan B entre parenthèses n'est pas compté ; « + collage des 5 autres » non plus
 * (ces 5 sites ont déjà leur propre date).
 */
export function nomsClients(texte: string | undefined): string[] {
  if (!texte) return [];
  const sansPlanB = texte.replace(/\([^)]*\)/g, "");
  return sansPlanB
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n && !/^aucun$/i.test(n) && !n.startsWith("+"));
}

const normaliser = (nom: string) => nom.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

const jours = (a: string, b: string) => Math.abs(Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;

/** Clé d'une case « Accord obtenu » : un client à une date. */
export const cleAccord = (date: string, client: string) => `${date}|${normaliser(client)}`;

/** Une ligne par client, ses dates dans l'ordre, et l'alerte des 30 jours. */
export function rotation(entrees: Entree[]): LigneRotation[] {
  const parClient = new Map<string, { client: string; apparitions: Apparition[] }>();
  for (const e of entrees) {
    for (const nom of nomsClients(e.texte)) {
      const cle = normaliser(nom);
      const ligne = parClient.get(cle) ?? { client: nom, apparitions: [] };
      if (!ligne.apparitions.some((a) => a.date === e.date && a.contenu === e.contenu)) {
        ligne.apparitions.push({ date: e.date, contenu: e.contenu, cle: cleAccord(e.date, nom), alerte: false });
      }
      parClient.set(cle, ligne);
    }
  }
  const lignes = [...parClient.values()].map((l) => {
    const apparitions = [...l.apparitions].sort((a, b) => a.date.localeCompare(b.date));
    for (const [i, a] of apparitions.entries()) {
      a.alerte = apparitions.some(
        (b, j) => j !== i && jours(a.date, b.date) < DELAI_JOURS && (a.date >= DEBUT_ROTATION || b.date >= DEBUT_ROTATION),
      );
    }
    return { client: l.client, apparitions, alerte: apparitions.some((a) => a.alerte) };
  });
  return lignes.sort((a, b) => Number(b.alerte) - Number(a.alerte) || a.apparitions[0].date.localeCompare(b.apparitions[0].date));
}
