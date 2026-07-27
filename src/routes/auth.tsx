import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login or Sign Up | IndustryResource" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPwd,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    // Check for redirect param, otherwise go home
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect");
    navigate({ to: (redirectTo as never) ?? "/" });
  };

  // Signup
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [signup, setSignup] = useState({ name: "", email: "", phone: "", password: "" });

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
    const { error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: signup.name, role },
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created! Check your email if confirmation is required.");
    navigate({ to: role === "vendor" ? "/register-vendor" : "/" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("login")}</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <h1 className="font-display text-2xl font-bold">{t("loginTitle")}</h1>
              <form onSubmit={onLogin} className="mt-4 space-y-3">
                <div><Label>{t("email")}</Label><Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required /></div>
                <div><Label>{t("password")}</Label><Input type="password" value={loginPwd} onChange={(e) => setLoginPwd(e.target.value)} required /></div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "…" : t("login")}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <h1 className="font-display text-2xl font-bold">{t("signupTitle")}</h1>
              <p className="text-sm text-muted-foreground">{t("iAm")}:</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole("customer")} className={`rounded-md border-2 p-3 text-sm font-semibold transition ${role === "customer" ? "border-primary bg-primary/5" : "border-border"}`}>{t("customer")}</button>
                <button type="button" onClick={() => setRole("vendor")} className={`rounded-md border-2 p-3 text-sm font-semibold transition ${role === "vendor" ? "border-primary bg-primary/5" : "border-border"}`}>{t("vendor")}</button>
              </div>
              <form onSubmit={onSignup} className="mt-4 space-y-3">
                <div><Label>{t("fullName")}</Label><Input value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} required /></div>
                <div><Label>{t("email")}</Label><Input type="email" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} required /></div>
                <div><Label>{t("phone")}</Label><Input value={signup.phone} onChange={(e) => setSignup({ ...signup, phone: e.target.value })} /></div>
                <div><Label>{t("password")}</Label><Input type="password" minLength={6} value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} required /></div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "…" : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="mt-4 text-center text-xs text-muted-foreground">By continuing you agree to our terms.</p>
          <p className="mt-2 text-center text-xs text-muted-foreground"><Link to="/" className="hover:text-foreground">← Back to home</Link></p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
