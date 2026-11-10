"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useState } from "react";

import { formatAuthError, isExistingUserSignup } from "@/features/auth/auth-errors";
import { accountApi } from "@/features/auth/services/account-api";
import { getAuthCallbackUrl } from "@/lib/app-url";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

async function bootstrapAccount() {
  try {
    await accountApi.sync();
  } catch {
    // Session may still work; profile sync can retry from Settings.
  }
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/practice";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // Read directly from form controls as fallback if browser autofill / strong password fill bypassed React state
    const formData = new FormData(event.currentTarget);
    const formPassword =
      (formData.get("new-password") as string) ||
      (formData.get("password") as string) ||
      password;
    const formConfirmPassword =
      (formData.get("confirm-password") as string) ||
      confirmPassword;
    const formIdentifier =
      ((formData.get("username") as string) || identifier).trim();

    if (isSignup && formPassword !== formConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      let loginEmail = formIdentifier;

      if (!isSignup && !loginEmail.includes("@")) {
        try {
          const resolved = await accountApi.resolveLoginEmail(loginEmail);
          loginEmail = resolved.email;
        } catch {
          setError("Invalid username or password");
          return;
        }
      }

      if (isSignup) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: loginEmail,
          password: formPassword,
          options: {
            emailRedirectTo: getAuthCallbackUrl(redirectTo),
          },
        });

        if (signUpError) {
          setError(formatAuthError(signUpError.message, "signup"));
          return;
        }

        if (isExistingUserSignup(signUpData)) {
          setMessage(
            "An account with this email may already exist. Try signing in, or check your inbox for a confirmation link.",
          );
          return;
        }

        if (signUpData.session) {
          await bootstrapAccount();
          router.push(redirectTo);
          router.refresh();
          return;
        }

        setMessage(
          "Account created. Check your email to confirm, then sign in. If you don't see it, check spam or wait before requesting another.",
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: formPassword,
      });

      if (signInError) {
        const lower = signInError.message.toLowerCase();
        setError(
          lower.includes("invalid login credentials")
            ? "Invalid username or password"
            : formatAuthError(signInError.message, "login"),
        );
        return;
      }

      await bootstrapAccount();

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{isSignup ? "Create account" : "Sign in"}</CardTitle>
        <CardDescription>
          {isSignup
            ? "Start studying with your own decks and progress."
            : "Sign in with your email or username."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          method="post"
          action={isSignup ? "/signup" : "/login"}
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="username">{isSignup ? "Email" : "Email or username"}</Label>
            <Input
              id="username"
              name="username"
              type={isSignup ? "email" : "text"}
              autoComplete="username"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={isSignup ? "new-password" : "password"}>Password</Label>
            <Input
              id={isSignup ? "new-password" : "password"}
              name={isSignup ? "new-password" : "password"}
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              passwordrules={isSignup ? "minlength: 6;" : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {isSignup ? (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                passwordrules="minlength: 6;"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link href="/explore" className="text-muted-foreground underline-offset-4 hover:underline">
            Continue as guest instead
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to Rimev?{" "}
              <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary underline-offset-4 hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
