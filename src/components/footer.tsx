import { Link } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { FooterBannerAd } from "@/components/ad-slot";

export function Footer() {
  return (
    <footer className="border-t border-white/10 glass-panel mt-16">
      {/* ── Bottom-of-page Ad Banner ───────────────────────────────────── */}
      <div className="border-b border-white/8 px-4 py-4">
        <FooterBannerAd />
      </div>
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="IndustryResource" className="h-10 w-auto" />
            <span className="font-display text-lg font-bold">
              <span className="text-primary">Industry</span>
              <span className="text-accent">Resource</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            India's multi-city B2B industrial marketplace — zone-level precision, region-wide reach.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display font-semibold text-foreground">Discover</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/browse" className="hover:text-accent transition-colors">Browse Vendors</Link></li>
            <li><Link to="/requirements" className="hover:text-accent transition-colors">Requirements Board</Link></li>
            <li><Link to="/register-vendor" className="hover:text-accent transition-colors">List Your Business</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display font-semibold text-foreground">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-accent transition-colors">Login / Sign up</Link></li>
            <li><Link to="/post-requirement" className="hover:text-accent transition-colors">Post a Requirement</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display font-semibold text-foreground">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent/70" /> admin@industryresource.in</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent/70" /> Belagavi, Karnataka</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/8 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} IndustryResource — Connecting India's industrial ecosystem.
      </div>
    </footer>
  );
}
