import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Factory, Menu, X, ShoppingCart, Hammer, Layers, Plus } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { isAuthenticated, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src="/logo.png" alt="IndustryResource" className="h-10 w-auto" />
          <div className="font-display text-lg font-bold leading-none">
            <span className="text-primary">Industry</span>
            <span className="text-accent">Resource</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/browse">{t("browse")}</Link>
          </Button>

          {/* Buy dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" /> Buy
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Buy from Marketplace
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/machines" })} className="gap-2">
                <Hammer className="h-4 w-4 text-primary" /> Machines for Sale
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/materials" })} className="gap-2">
                <Layers className="h-4 w-4 text-primary" /> Materials &amp; Spares
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/listings" })} className="gap-2">
                📋 Browse Classifieds
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sell dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Sell
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                List &amp; Sell
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/machines/new" })} className="gap-2">
                <Hammer className="h-4 w-4 text-amber-600" /> Sell a Machine
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/materials/new" })} className="gap-2">
                <Layers className="h-4 w-4 text-amber-600" /> Sell Material / Spares
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/listings/new" })} className="gap-2">
                📋 Post a Classified
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/register-vendor" })} className="gap-2">
                🏭 {t("listBusiness")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild variant="ghost" size="sm">
            <Link to="/requirements">{t("requirements")}</Link>
          </Button>
        </nav>

        {/* Desktop right section */}
        <div className="hidden items-center gap-2 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold transition hover:bg-accent hover:text-accent-foreground uppercase"
                aria-label="Toggle language"
              >
                {lang === "en" ? "EN" : lang === "kn" ? "ಕನ್ನಡ" : lang === "hi" ? "हिंदी" : "मराठी"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("en")}>English (EN)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("kn")}>ಕನ್ನಡ (KN)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("hi")}>हिंदी (HI)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("mr")}>मराठी (MR)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">Account</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {hasRole("vendor") && (
                  <>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Vendor</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                      🏭 Vendor Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/listings/new" })}>
                      📋 Post a Listing
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuLabel className="text-xs text-muted-foreground">Buyer</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate({ to: "/customer-dashboard" })}>
                  🛒 My Orders &amp; Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/post-requirement" })}>
                  {t("postRequirement")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
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

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            <Link
              to="/browse"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              {t("browse")}
            </Link>

            <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Buy
            </div>
            <Link
              to="/machines"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Hammer className="h-4 w-4 text-primary" /> Machines for Sale
            </Link>
            <Link
              to="/materials"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Layers className="h-4 w-4 text-primary" /> Materials &amp; Spares
            </Link>
            <Link
              to="/listings"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              📋 Classifieds
            </Link>

            <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sell
            </div>
            <Link
              to="/machines/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Hammer className="h-4 w-4 text-amber-600" /> Sell a Machine
            </Link>
            <Link
              to="/materials/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Layers className="h-4 w-4 text-amber-600" /> Sell Material
            </Link>
            <Link
              to="/register-vendor"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              🏭 {t("listBusiness")}
            </Link>
            <Link
              to="/requirements"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              {t("requirements")}
            </Link>

            {isAuthenticated && (
              <Link
                to="/customer-dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <ShoppingCart className="h-4 w-4" /> My Orders &amp; Dashboard
              </Link>
            )}
            {isAuthenticated && hasRole("vendor") && (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                🏭 Vendor Dashboard
              </Link>
            )}

            <div className="flex items-center gap-2 pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold uppercase">
                    {lang === "en" ? "EN" : lang === "kn" ? "ಕನ್ನಡ" : lang === "hi" ? "हिंदी" : "मराठी"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setLang("en")}>English (EN)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang("kn")}>ಕನ್ನಡ (KN)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang("hi")}>हिंदी (HI)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang("mr")}>मराठी (MR)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isAuthenticated ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    setOpen(false);
                    navigate({ to: "/" });
                  }}
                >
                  {t("logout")}
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    {t("login")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
