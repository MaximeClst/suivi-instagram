"use client";

import { useFormState, useFormStatus } from "react-dom";
import { connexion } from "./actions";

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded bg-accent font-medium text-ink transition-opacity disabled:opacity-60"
    >
      {pending ? "Connexion…" : "Entrer"}
    </button>
  );
}

export default function ConnexionPage() {
  const [erreur, action] = useFormState(connexion, null);

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form action={action} className="w-full max-w-sm space-y-5 rounded border border-ink-700 bg-ink-900 p-6 md:p-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">Code Celeste</p>
          <h1 className="mt-1 font-serif text-3xl">Suivi Instagram</h1>
          <p className="mt-2 text-sm text-ink-400">Outil privé. Entre ton mot de passe pour continuer.</p>
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-400">Mot de passe</span>
          <input
            name="motDePasse"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="mt-1 h-11 w-full rounded border border-ink-700 bg-ink px-3 outline-none focus:border-accent"
          />
        </label>
        {erreur && <p role="alert" className="text-sm text-accent">{erreur}</p>}
        <Bouton />
      </form>
    </main>
  );
}
