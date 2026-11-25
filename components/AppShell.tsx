"use client";

import { CalendarDays, CircleDashed, ClipboardCheck, LineChart, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { deconnexion } from "@/app/connexion/actions";
import { MoisSelector } from "@/components/MoisSelector";
import { cn } from "@/lib/utils";

const PAGES = [
  { href: "/", label: "Calendrier", court: "Calendrier", icon: CalendarDays },
  { href: "/stories", label: "Stories", court: "Stories", icon: CircleDashed },
  { href: "/suivi", label: "Suivi hebdo", court: "Suivi", icon: LineChart },
  { href: "/controles", label: "Points de contrôle", court: "Contrôles", icon: ClipboardCheck },
];

function Nav({ className, mobile }: { className?: string; mobile?: boolean }) {
  const pathname = usePathname();
  const mois = useSearchParams().get("mois");
  const query = mois ? `?mois=${mois}` : "";

  return (
    <nav className={className} aria-label="Pages">
      {PAGES.map(({ href, label, court, icon: Icon }) => {
        const actif = pathname === href;
        return (
          <Link
            key={href}
            href={href + query}
            aria-current={actif ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded text-sm transition-colors",
              mobile ? "flex-1 flex-col gap-1 py-2 text-[11px]" : "px-3 py-2",
              actif ? "text-white" : "text-ink-400 hover:text-white",
              actif && !mobile && "bg-ink-800",
            )}
          >
            <Icon size={mobile ? 20 : 16} className={cn(actif && "text-accent")} />
            {mobile ? court : label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <div className="min-h-dvh pb-20 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 md:h-16 md:px-8">
            <Link href="/" className="whitespace-nowrap font-serif text-lg leading-none">
              <span className="hidden sm:inline">
                Code Celeste <span className="text-ink-500">·</span>{" "}
              </span>
              <span className="text-accent">Suivi</span>
            </Link>
            <Nav className="hidden items-center gap-1 md:flex" />
            <div className="ml-auto flex items-center gap-2">
              <MoisSelector />
              <form action={deconnexion}>
                <button
                  type="submit"
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                  className="grid h-9 w-9 place-items-center rounded text-ink-400 hover:bg-ink-800 hover:text-white"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">{children}</div>

        <Nav
          mobile
          className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-800 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        />
      </div>
    </Suspense>
  );
}
