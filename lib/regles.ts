import type { Doc } from "@/convex/_generated/dataModel";

export type Valeurs = Record<string, (number | null)[]>; // indicateur → valeur par semaine (même ordre que les codes)

export type Alerte = {
  regle: Doc<"regles">;
  semaine: string;
};

export function indexer(
  semaines: Pick<Doc<"semaines">, "_id" | "code">[],
  mesures: Pick<Doc<"mesures">, "semaineId" | "indicateurKey" | "valeur">[],
): Valeurs {
  const position = new Map(semaines.map((s, i) => [s._id as string, i]));
  const valeurs: Valeurs = {};
  for (const m of mesures) {
    const i = position.get(m.semaineId);
    if (i === undefined) continue;
    (valeurs[m.indicateurKey] ??= Array(semaines.length).fill(null))[i] = m.valeur;
  }
  return valeurs;
}

const val = (v: Valeurs, k: string, i: number) => (i >= 0 ? v[k]?.[i] ?? null : null);

/** Dernière semaine avec au moins un chiffre saisi, -1 si aucune. */
export function semaineCourante(v: Valeurs, nbSemaines: number) {
  for (let i = nbSemaines - 1; i >= 0; i--) {
    if (Object.values(v).some((serie) => serie[i] !== null && serie[i] !== undefined)) return i;
  }
  return -1;
}

export function monte(v: Valeurs, k: string, i: number) {
  const a = val(v, k, i);
  const b = val(v, k, i - 1);
  return a !== null && b !== null && a > b;
}

/** Ne monte pas (égal ou en baisse) deux semaines de suite. */
export function stagne(v: Valeurs, k: string, i: number) {
  const [a, b, c] = [val(v, k, i), val(v, k, i - 1), val(v, k, i - 2)];
  return a !== null && b !== null && c !== null && a <= b && b <= c;
}

export function cumul(v: Valeurs, k: string, i: number) {
  let total = 0;
  for (let j = 0; j <= i; j++) total += val(v, k, j) ?? 0;
  return total;
}

export function taux(v: Valeurs, num: string, den: string, i: number) {
  const n = val(v, num, i);
  const d = val(v, den, i);
  return n !== null && d !== null && d > 0 ? n / d : null;
}

export function tendance(v: Valeurs, k: string, i: number): "↑" | "↓" | "→" | null {
  const a = val(v, k, i);
  const b = val(v, k, i - 1);
  if (a === null || b === null) return null;
  return a > b ? "↑" : a < b ? "↓" : "→";
}

/** Messages reçus : PROJET + autres (décembre). null si aucun n'est saisi. */
export const MESSAGES = ["messages_projet", "messages_autres"] as const;

/** Ajoute les séries calculées (ex. `messages_total`) aux valeurs saisies. */
export function deriver(v: Valeurs, nbSemaines: number): Valeurs {
  if (!MESSAGES.some((k) => v[k])) return v;
  const total = Array.from({ length: nbSemaines }, (_, i) => {
    const parts = MESSAGES.map((k) => v[k]?.[i] ?? null);
    return parts.every((x) => x === null) ? null : parts.reduce<number>((t, x) => t + (x ?? 0), 0);
  });
  return { ...v, messages_total: total };
}

export function evaluer(regles: Doc<"regles">[], saisies: Valeurs, codes: string[]): Alerte[] {
  const v = deriver(saisies, codes.length);
  const i = semaineCourante(v, codes.length);
  if (i < 0) return [];

  const vraie = (c: Doc<"regles">["condition"]) => {
    switch (c.type) {
      case "stagne":
        return stagne(v, c.k, i);
      case "monte-et-stagne":
        return monte(v, c.a, i) && stagne(v, c.b, i);
      case "monte-et-zero":
        return monte(v, c.a, i) && (val(v, c.b, i) ?? 0) === 0;
      case "positif-et-stagne":
        return cumul(v, c.a, i) > 0 && stagne(v, c.b, i);
      case "cumul-zero-apres":
        return i >= codes.indexOf(c.apres) && codes.includes(c.apres) && cumul(v, c.k, i) === 0;
      case "taux-hausse-apres": {
        if (!codes.includes(c.apres) || i <= codes.indexOf(c.apres)) return false;
        const t = taux(v, c.num, c.den, i);
        const avant = taux(v, c.num, c.den, i - 1);
        return t !== null && avant !== null && t > avant;
      }
      case "sous-seuil": {
        const x = val(v, c.k, i);
        return x !== null && x < c.seuil;
      }
      case "seuil-et-stagne": {
        const x = val(v, c.a, i);
        return x !== null && x >= c.seuil && stagne(v, c.b, i);
      }
      case "monte-et-taux-sous": {
        const t = taux(v, c.num, c.den, i);
        return monte(v, c.a, i) && t !== null && t < c.seuil;
      }
      case "cumul-superieur":
        return cumul(v, c.a, i) > cumul(v, c.b, i);
    }
  };

  return regles.filter((r) => vraie(r.condition)).map((regle) => ({ regle, semaine: codes[i] }));
}
