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

// ─── Friendly error mapper ────────────────────────────────────────────────────

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Incorrect email or password. Please try again.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Please log in instead.";
  if (m.includes("email not confirmed"))
    return "Please verify your email address before logging in. Check your inbox.";
  if (m.includes("password should be at least"))
    return "Password must be at least 6 characters long.";
  if (m.includes("unable to validate email address"))
    return "Please enter a valid email address.";
  if (m.includes("signup is disabled"))
    return "New registrations are temporarily disabled. Please try again later.";
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "Too many attempts. Please wait a few minutes and try again.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error. Please check your connection and try again.";
  return message;
}

// ─── Safe redirect helper ─────────────────────────────────────────────────────

function getSafeRedirect(): string {
  if (typeof window === "undefined") return "/";
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("redirect") ?? "";
  // Only allow relative paths — reject absolute URLs / external domains
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

// ─── Main component ───────────────────────────────────────────────────────────

function AuthPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Shared busy state
  const [busy, setBusy] = useState(false);

  // ── Login state ──────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // ── Signup state ─────────────────────────────────────────────────────────
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [signup, setSignup] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [signupDone, setSignupDone] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  // ── Login handler ────────────────────────────────────────────────────────
  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPwd,
    });
    setBusy(false);
    if (error) {
      toast.error(friendlyAuthError(error.message));
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: getSafeRedirect() as never });
  };

  // ── Forgot Password: request ─────────────────────────────────────────────
  const onForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${origin}/auth/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(friendlyAuthError(error.message));
      return;
    }
    setForgotSent(true);
  };

  // ── Signup handler ───────────────────────────────────────────────────────
  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!signup.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (signup.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (signup.password !== signup.confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    setBusy(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { data, error } = await supabase.auth.signUp({
      email: signup.email.trim(),
      password: signup.password,
      options: {
        emailRedirectTo: `${origin}/`,
        data: { full_name: signup.name.trim(), role, phone: signup.phone.trim() || undefined },
      },
    });
    setBusy(false);

    if (error) {
      toast.error(friendlyAuthError(error.message));
      return;
    }

    // Supabase may auto-confirm (email confirmation OFF) or require confirmation.
    // If identities array is empty, the email already exists (Supabase quirk).
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.error("An account with this email already exists. Please log in instead.");
      return;
    }

    // Store email for the success screen, show confirmation message
    setSignupEmail(signup.email.trim());
    setSignupDone(true);

    // If session was returned (email confirmation disabled), navigate after a brief moment
    if (data.session) {
      setTimeout(() => {
        navigate({ to: role === "vendor" ? "/register-vendor" : "/" });
      }, 2000);
    }
  };

  // ── JSX ──────────────────────────────────────────────────────────────────

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

            {/* ── LOGIN TAB ─────────────────────────────────────────────── */}
            <TabsContent value="login" className="mt-6">
              {!showForgot ? (
                <>
                  <h1 className="font-display text-2xl font-bold">{t("loginTitle")}</h1>
                  <form onSubmit={onLogin} className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor="login-email">{t("email")}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">{t("password")}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        value={loginPwd}
                        onChange={(e) => setLoginPwd(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy ? "Signing in…" : t("login")}
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setForgotSent(false);
                      setShowForgot(true);
                    }}
                    className="mt-3 block w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </button>
                </>
              ) : (
                /* ── FORGOT PASSWORD PANEL ──────────────────────────────── */
                <>
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Back to login
                  </button>
                  <h1 className="font-display text-2xl font-bold">Reset password</h1>

                  {forgotSent ? (
                    <div className="mt-4 rounded-md bg-primary/10 px-4 py-4 text-sm">
                      <p className="font-semibold text-primary">Check your inbox!</p>
                      <p className="mt-1 text-muted-foreground">
                        We sent a password reset link to{" "}
                        <span className="font-medium">{forgotEmail}</span>.
                        Click the link in the email to set a new password.
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Didn't receive it? Check your spam folder or{" "}
                        <button
                          type="button"
                          className="underline hover:text-foreground"
                          onClick={() => setForgotSent(false)}
                        >
                          try again
                        </button>
                        .
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={onForgotRequest} className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor="forgot-email">Your registered email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={busy}>
                        {busy ? "Sending…" : "Send reset link"}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        We'll send a secure link to your email. The link expires in 1 hour.
                      </p>
                    </form>
                  )}
                </>
              )}
            </TabsContent>

            {/* ── SIGNUP TAB ────────────────────────────────────────────── */}
            <TabsContent value="signup" className="mt-6">
              {signupDone ? (
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl">
                    ✅
                  </div>
                  <h1 className="font-display text-2xl font-bold">Account created!</h1>
                  <p className="text-sm text-muted-foreground">
                    We sent a confirmation email to{" "}
                    <span className="font-medium text-foreground">{signupEmail}</span>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check your inbox and click the verification link to activate your account. Then come back to log in.
                  </p>
                  <Button
                    className="mt-2 w-full"
                    onClick={() => navigate({ to: "/" })}
                  >
                    Go to homepage
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-2xl font-bold">{t("signupTitle")}</h1>
                  <p className="text-sm text-muted-foreground">{t("iAm")}:</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("customer")}
                      className={`rounded-md border-2 p-3 text-sm font-semibold transition ${role === "customer" ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      {t("customer")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("vendor")}
                      className={`rounded-md border-2 p-3 text-sm font-semibold transition ${role === "vendor" ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      {t("vendor")}
                    </button>
                  </div>
                  <form onSubmit={onSignup} className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor="signup-name">{t("fullName")}</Label>
                      <Input
                        id="signup-name"
                        autoComplete="name"
                        placeholder="Your full name"
                        value={signup.name}
                        onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">{t("email")}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={signup.email}
                        onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-phone">{t("phone")} <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        value={signup.phone}
                        onChange={(e) => setSignup({ ...signup, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">{t("password")}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Min. 6 characters"
                        minLength={6}
                        value={signup.password}
                        onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-confirm-password">Confirm password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={signup.confirmPassword}
                        onChange={(e) => setSignup({ ...signup, confirmPassword: e.target.value })}
                        required
                      />
                      {signup.confirmPassword && signup.password !== signup.confirmPassword && (
                        <p className="mt-1 text-xs text-destructive">Passwords do not match.</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={busy || (!!signup.confirmPassword && signup.password !== signup.confirmPassword)}
                    >
                      {busy ? "Creating account…" : "Create account"}
                    </Button>
                  </form>
                </>
              )}
            </TabsContent>
          </Tabs>

          <p className="mt-4 text-center text-xs text-muted-foreground">By continuing you agree to our terms.</p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
