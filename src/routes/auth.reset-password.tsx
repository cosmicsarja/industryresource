import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password | IndustryResource" }] }),
  ssr: false,
  component: ResetPasswordPage,
});

type PageState = "loading" | "ready" | "invalid" | "success";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase automatically exchanges the #access_token hash in the URL
    // into a session when onAuthStateChange fires with the PASSWORD_RECOVERY event.
    // We listen for it here.
    const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      }
    });

    // Also check: if there's already a valid session with a recovery token in
    // the URL hash, getSession() may already have a session.
    // Give Supabase a moment to exchange the hash token.
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // A session exists — user arrived from the reset link
        setPageState("ready");
      } else {
        // No session and no PASSWORD_RECOVERY event — invalid / expired link
        setPageState("invalid");
      }
    }, 1500);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("same password") || msg.includes("different from the old password")) {
        toast.error("New password must be different from your current password.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    setPageState("success");

    // Sign out so the user logs in fresh with the new password
    await supabase.auth.signOut();

    toast.success("Password updated successfully! Please log in with your new password.");
    setTimeout(() => navigate({ to: "/auth" }), 2500);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">

          {/* LOADING */}
          {pageState === "loading" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
            </div>
          )}

          {/* INVALID / EXPIRED LINK */}
          {pageState === "invalid" && (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-3xl">
                ⚠️
              </div>
              <h1 className="font-display text-2xl font-bold">Link expired or invalid</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link has expired or has already been used. Reset links are valid for 1 hour.
              </p>
              <Button asChild className="mt-2 w-full">
                <Link to="/auth">Request a new reset link</Link>
              </Button>
            </div>
          )}

          {/* READY — Set New Password Form */}
          {pageState === "ready" && (
            <>
              <h1 className="font-display text-2xl font-bold">Set new password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a strong password for your account.
              </p>
              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-new-password">Confirm new password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  {confirm && password !== confirm && (
                    <p className="mt-1 text-xs text-destructive">Passwords do not match.</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={busy || (!!confirm && password !== confirm)}
                >
                  {busy ? "Updating password…" : "Update password"}
                </Button>
              </form>
            </>
          )}

          {/* SUCCESS */}
          {pageState === "success" && (
            <div className="space-y-3 py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl">
                ✅
              </div>
              <h1 className="font-display text-2xl font-bold">Password updated!</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been changed. Redirecting you to the login page…
              </p>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
