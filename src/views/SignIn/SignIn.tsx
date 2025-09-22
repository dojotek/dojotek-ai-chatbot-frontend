"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthControllerSignIn } from "@/sdk/authentication/authentication";
import { setAuthToken } from "@/lib/auth";
import { toast } from "sonner";

function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [touchedEmail, setTouchedEmail] = useState<boolean>(false);
  const [touchedPassword, setTouchedPassword] = useState<boolean>(false);

  const isValidEmail = useMemo(() => {
    if (!email) return false;
    // Simple RFC 5322 compliant-enough email regex for UI validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  const isPasswordValid = password.length > 0;
  const canSubmit = isValidEmail && isPasswordValid;

  const signInMutation = useAuthControllerSignIn({});

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouchedEmail(true);
    setTouchedPassword(true);
    if (!canSubmit) return;
    signInMutation.mutate(
      { data: { email, password } as any },
      {
        onSuccess: (resp) => {
          const token = resp?.data?.access_token;
          if (token) setAuthToken(token);
          toast.success("Sign in success", { duration: 2500 });
          const url = new URL(window.location.href);
          const redirectTo = url.searchParams.get("redirect") || "/admin/dashboards";
          router.push(redirectTo);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || "Email or password is incorrect";
          toast.error(message, { duration: 3000 });
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full bg-background px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-4xl rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Form */}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Dojotek AI Chatbot</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouchedEmail(true)}
                  aria-invalid={touchedEmail && !isValidEmail}
                  aria-describedby="email-error"
                  placeholder="you@example.com"
                  className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
                {touchedEmail && !isValidEmail ? (
                  <p id="email-error" className="text-xs text-red-600">
                    Please enter a valid email address.
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouchedPassword(true)}
                    aria-invalid={touchedPassword && !isPasswordValid}
                    aria-describedby="password-error"
                    placeholder="••••••••"
                    className="w-full rounded-md border bg-background px-3 py-2.5 pr-24 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                {touchedPassword && !isPasswordValid ? (
                  <p id="password-error" className="text-xs text-red-600">
                    Password is required.
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember my session</span>
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot your password?
                </a>
              </div>

              <button
                type="submit"
                disabled={!canSubmit || signInMutation.isPending}
                className="w-full rounded-md bg-foreground border border-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 hover:border-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-foreground disabled:hover:border-foreground"
              >
                {signInMutation.isPending ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* Right: Description */}
          <div className="hidden lg:block bg-muted/30 p-8">
            <div className="h-full flex items-center">
              <p className="text-sm leading-6 text-muted-foreground">
                <span className="font-semibold text-foreground">Dojotek AI Chatbot</span> is a software system to help enterprise/company/corporate to build, configure, run, monitor multiple Chatbot AI LLM RAG; and expose chatbots to multiple channels (Shopify, WordPress, WhatsApp Business API, etc)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;