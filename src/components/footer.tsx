import { Link } from "@tanstack/react-router";
import { Factory, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Factory className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">
              <span className="text-primary">Industrial</span><span className="text-accent">Belgaum</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Belagavi's first hyper-local B2B industrial marketplace.</p>
        </div>
        <div>
          <h4 className="mb-3 font-display font-semibold">Discover</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/browse" className="hover:text-foreground">Browse Vendors</Link></li>
            <li><Link to="/requirements" className="hover:text-foreground">Requirements Board</Link></li>
            <li><Link to="/register-vendor" className="hover:text-foreground">List Your Business</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display font-semibold">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-foreground">Login / Sign up</Link></li>
            <li><Link to="/post-requirement" className="hover:text-foreground">Post a Requirement</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> admin@industrialbelgaum.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Belagavi, Karnataka 590001</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} IndustrialBelgaum.com — Built for Belagavi's industry.
      </div>
    </footer>
  );
}
