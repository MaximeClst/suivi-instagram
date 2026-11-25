"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useSearchParams } from "next/navigation";
import { useAcces } from "@/components/Providers";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

export type MoisData = NonNullable<FunctionReturnType<typeof api.mois.get>>;
export type Publication = Doc<"publications">;
export type PublicationPatch = Partial<Omit<Publication, "_id" | "_creationTime" | "mois" | "script">>;
export type Script = NonNullable<Publication["script"]>;
export type StoryPatch = Partial<Omit<Doc<"stories">, "_id" | "_creationTime" | "date">>;
export type ReelEssaiPatch = Partial<
  Pick<Doc<"reelsEssai">, "date" | "statut" | "abonnes" | "visitesProfil" | "vues48h" | "comparaisonFaite">
>;

export function useListeMois() {
  const token = useAcces();
  return useQuery(convexQuery(api.mois.liste, { token }));
}

/** Mois affiché : `?mois=` dans l'URL, sinon le mois en cours s'il existe, sinon le plus récent. */
export function useMoisCourant(): string | undefined {
  const demande = useSearchParams().get("mois");
  const { data } = useListeMois();
  if (demande) return demande;
  if (!data?.length) return undefined;
  const now = new Date();
  const cle = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return data.find((m) => m.key === cle)?.key ?? data[data.length - 1].key;
}

export function useMoisData() {
  const token = useAcces();
  const mois = useMoisCourant();
  return useQuery(convexQuery(api.mois.get, mois ? { token, mois } : "skip"));
}

/** Les mutations mettent l'écran à jour tout de suite (mise à jour optimiste), puis Convex confirme. */
export function useMutations() {
  const token = useAcces();
  const mois = useMoisCourant() ?? "";
  const args = { token, mois };

  const updatePublication = useMutation(api.publications.update).withOptimisticUpdate((store, { id, patch }) => {
    const data = store.getQuery(api.mois.get, args);
    if (!data) return;
    store.setQuery(api.mois.get, args, {
      ...data,
      publications: data.publications.map((p) => (p._id === id ? { ...p, ...patch } : p)),
    });
  });

  const setMesure = useMutation(api.suivi.setMesure).withOptimisticUpdate((store, { semaineId, indicateurKey, valeur }) => {
    const data = store.getQuery(api.mois.get, args);
    if (!data) return;
    const autres = data.mesures.filter((m) => !(m.semaineId === semaineId && m.indicateurKey === indicateurKey));
    const existante = data.mesures.find((m) => m.semaineId === semaineId && m.indicateurKey === indicateurKey);
    store.setQuery(api.mois.get, args, {
      ...data,
      mesures: [
        ...autres,
        existante
          ? { ...existante, valeur }
          : { _id: crypto.randomUUID() as Id<"mesures">, _creationTime: Date.now(), semaineId, indicateurKey, valeur },
      ],
    });
  });

  const toggleItem = useMutation(api.controles.toggleItem).withOptimisticUpdate((store, { id, coche }) => {
    const data = store.getQuery(api.mois.get, args);
    if (!data) return;
    store.setQuery(api.mois.get, args, {
      ...data,
      controles: data.controles.map((c) => ({ ...c, items: c.items.map((i) => (i._id === id ? { ...i, coche } : i)) })),
    });
  });

  const updateReelEssai = useMutation(api.reelsEssai.update).withOptimisticUpdate((store, { id, patch }) => {
    const data = store.getQuery(api.mois.get, args);
    if (!data) return;
    store.setQuery(api.mois.get, args, {
      ...data,
      reelsEssai: data.reelsEssai.map((r) => (r._id === id ? { ...r, ...patch } : r)),
    });
  });

  const updateStory = useMutation(api.stories.update).withOptimisticUpdate((store, { id, patch }) => {
    const data = store.getQuery(api.mois.get, args);
    if (!data) return;
    store.setQuery(api.mois.get, args, {
      ...data,
      stories: data.stories.map((s) => (s._id === id ? { ...s, ...patch } : s)),
    });
  });

  const setScript = useMutation(api.publications.setScript).withOptimisticUpdate((store, { id, script }) => {
    const data = store.getQuery(api.mois.get, args);
    if (!data) return;
    store.setQuery(api.mois.get, args, {
      ...data,
      publications: data.publications.map((p) => (p._id === id ? { ...p, script } : p)),
    });
  });

  const createPublication = useMutation(api.publications.create);
  const removePublication = useMutation(api.publications.remove);
  const updateRegle = useMutation(api.suivi.updateRegle);
  const setNotes = useMutation(api.controles.setNotes);
  const creerMois = useMutation(api.mois.creer);

  return {
    updatePublication: (id: Id<"publications">, patch: PublicationPatch) => updatePublication({ token, id, patch }),
    setScript: (id: Id<"publications">, script: Script) => setScript({ token, id, script }),
    createPublication: (date: string) => createPublication({ token, mois, date }),
    removePublication: (id: Id<"publications">) => removePublication({ token, id }),
    setMesure: (semaineId: Id<"semaines">, indicateurKey: string, valeur: number | null) =>
      setMesure({ token, semaineId, indicateurKey, valeur }),
    updateRegle: (id: Id<"regles">, patch: { probleme?: string; action?: string }) => updateRegle({ token, id, patch }),
    toggleItem: (id: Id<"controleItems">, coche: boolean) => toggleItem({ token, id, coche }),
    setNotes: (id: Id<"controles">, notes: string) => setNotes({ token, id, notes }),
    creerMois: (key: string) => creerMois({ token, key }),
    updateReelEssai: (id: Id<"reelsEssai">, patch: ReelEssaiPatch) => updateReelEssai({ token, id, patch }),
    updateStory: (id: Id<"stories">, patch: StoryPatch) => updateStory({ token, id, patch }),
  };
}
