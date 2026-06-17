import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { Clock, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/requirements")({
  head: () => ({
    meta: [
      { title: "Requirements Board | IndustrialBelgaum.com" },
      { name: "description", content: "Post your industrial requirement and get quotes from verified Belagavi vendors." },
    ],
  }),
  component: RequirementsPage,
});

function RequirementsPage() {
  const { t } = useLanguage();
  const { data: reqs = [], isLoading } = useQuery({
    queryKey: ["requirements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, category:categories(name)")
        .eq("status", "open")
        .order("is_urgent", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <header className="border-b border-border bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-10">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Requirements Board</h1>
            <p className="mt-1 text-primary-foreground/80">Post your job — get quotes from verified vendors.</p>
          </div>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/post-requirement"><Plus className="mr-2 h-4 w-4" />{t("postRequirement")}</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : reqs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">No open requirements right now. Be the first to post one.</p>
            <Button asChild className="mt-4" size="sm"><Link to="/post-requirement">{t("postRequirement")}</Link></Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reqs.map((r) => (
              <article key={r.id} className="rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-foreground">{r.title}</h3>
                  {r.is_urgent && <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">URGENT</span>}
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{r.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {r.category && <span className="font-semibold text-primary">{r.category.name}</span>}
                  {r.zone_preference && <span>· {r.zone_preference}</span>}
                  {r.budget_range && <span>· Budget: {r.budget_range}</span>}
                  {r.deadline && <span>· Deadline: {r.deadline}</span>}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">{r.quote_count} quotes</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
