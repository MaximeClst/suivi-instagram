import { cookies } from "next/headers";
import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import { COOKIE_ACCES } from "@/lib/acces";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Le middleware a déjà vérifié le cookie ; on le transmet aux fonctions Convex
  const token = cookies().get(COOKIE_ACCES)?.value ?? "";
  return (
    <Providers token={token}>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
