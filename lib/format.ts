const jourCourt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const jourMois = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const nombreFr = new Intl.NumberFormat("fr-FR");

/** « lun. 2 nov. » */
export const dateCourte = (iso: string) => jourCourt.format(new Date(iso));

/** « 2 – 8 nov. » ou « 25 oct. – 1 nov. » */
export function plage(debut: string, fin: string) {
  const d = new Date(debut);
  const f = new Date(fin);
  return d.getUTCMonth() === f.getUTCMonth()
    ? `${d.getUTCDate()} – ${jourMois.format(f)}`
    : `${jourMois.format(d)} – ${jourMois.format(f)}`;
}

/** « 15/11 » */
export const jjmm = (iso: string) => `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`;

export const nombre = (n: number | null | undefined) => (n === null || n === undefined ? "–" : nombreFr.format(n));

export const pourcent = (r: number | null) => (r === null ? "–" : `${Math.round(r * 100)} %`);

export const isoDuJour = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
