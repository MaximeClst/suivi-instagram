"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ACCES } from "@/lib/acces";

export async function connexion(_: string | null, formData: FormData) {
  const motDePasse = String(formData.get("motDePasse") ?? "");
  if (!process.env.APP_PASSWORD || motDePasse !== process.env.APP_PASSWORD) {
    return "Mot de passe incorrect";
  }
  cookies().set(COOKIE_ACCES, motDePasse, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  redirect("/");
}

export async function deconnexion() {
  cookies().delete(COOKIE_ACCES);
  redirect("/connexion");
}
