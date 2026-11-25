"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Champs à saisie locale : la valeur est envoyée à la sortie du champ (ou Entrée),
 * pour ne pas écrire en base à chaque frappe.
 */

type NumberFieldProps = {
  value: number | null;
  onCommit: (value: number | null) => void;
  label?: string;
  className?: string;
  step?: string;
};

export function NumberField({ value, onCommit, label, className, step }: NumberFieldProps) {
  const [brouillon, setBrouillon] = useState(value === null ? "" : String(value));
  useEffect(() => setBrouillon(value === null ? "" : String(value)), [value]);

  const commit = () => {
    const suivant = brouillon.trim() === "" ? null : Number(brouillon.replace(",", "."));
    if (suivant !== null && Number.isNaN(suivant)) return setBrouillon(value === null ? "" : String(value));
    if (suivant !== value) onCommit(suivant);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={label}
      placeholder="—"
      step={step}
      value={brouillon}
      onChange={(e) => setBrouillon(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className={cn(
        "h-10 w-full rounded border border-ink-700 bg-ink px-3 text-base tabular-nums outline-none placeholder:text-ink-500 focus:border-accent md:text-sm",
        className,
      )}
    />
  );
}

type TextFieldProps = {
  value: string;
  onCommit: (value: string) => void;
  label?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  placeholder?: string;
};

export function TextField({ value, onCommit, label, multiline, rows = 2, className, placeholder }: TextFieldProps) {
  const [brouillon, setBrouillon] = useState(value);
  useEffect(() => setBrouillon(value), [value]);

  const props = {
    "aria-label": label,
    value: brouillon,
    placeholder,
    onBlur: () => brouillon !== value && onCommit(brouillon),
    className: cn(
      "w-full rounded border border-ink-700 bg-ink px-3 py-2 text-base outline-none placeholder:text-ink-500 focus:border-accent md:text-sm",
      className,
    ),
  };

  return multiline ? (
    <textarea {...props} rows={rows} onChange={(e) => setBrouillon(e.target.value)} />
  ) : (
    <input
      {...props}
      type="text"
      onChange={(e) => setBrouillon(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
    />
  );
}

export function PageTitre({ surtitre, titre, children }: { surtitre: string; titre: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-400">{surtitre}</p>
        <h1 className="mt-1 font-serif text-3xl md:text-5xl">{titre}</h1>
      </div>
      {children}
    </div>
  );
}

export function BoutonCopier({ texte, className, label = "Copier" }: { texte: string; className?: string; label?: string }) {
  const [copie, setCopie] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(texte);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
      }}
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 rounded border border-ink-700 px-2.5 text-xs text-ink-400 hover:border-ink-500 hover:text-white",
        className,
      )}
    >
      {copie ? <Check size={13} /> : <Copy size={13} />}
      {copie ? "Copié" : label}
    </button>
  );
}

export function Chargement() {
  return <p className="py-20 text-center text-sm text-ink-400">Chargement…</p>;
}
