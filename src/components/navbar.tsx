import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Factory, Menu, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { isAuthenticated, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/browse", label: t("browse") },
    { to: "/requirements", label: t("requirements") },
    { to: "/register-vendor", label: t("listBusiness") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Factory className="h-5 w-5" />
          </div>
          <div className="font-display text-lg font-bold leading-none">
            <span className="text-primary">Industrial</span>
            <span className="text-accent">Belgaum</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm"><Link to="/browse">{t("browse")}</Link></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">Marketplace</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => navigate({ to: "/machines" })}>Machines for Sale</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/materials" })}>Materials & Spares</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="ghost" size="sm"><Link to="/requirements">{t("requirements")}</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link to="/register-vendor">{t("listBusiness")}</Link></Button>
        </nav>


        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => setLang(lang === "en" ? "kn" : "en")}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold transition hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle language"
          >
            {lang === "en" ? "ಕನ್ನಡ" : "EN"}
          </button>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">Account</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasRole("vendor") && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>Vendor Dashboard</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate({ to: "/customer-dashboard" })}>My Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/post-requirement" })}>{t("postRequirement")}</DropdownMenuItem>
                <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">{t("login")}</Link>
            </Button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                {l.label}
              </Link>
            ))}
            <Link to="/machines" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Machines for Sale</Link>
            <Link to="/materials" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">Materials & Spares</Link>

            {isAuthenticated && (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Vendor Dashboard
              </Link>
            )}
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setLang(lang === "en" ? "kn" : "en")} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold">
                {lang === "en" ? "ಕನ್ನಡ" : "EN"}
              </button>
              {isAuthenticated ? (
                <Button size="sm" variant="outline" onClick={async () => { await signOut(); setOpen(false); navigate({ to: "/" }); }}>{t("logout")}</Button>
              ) : (
                <Button asChild size="sm"><Link to="/auth" onClick={() => setOpen(false)}>{t("login")}</Link></Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
