"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function validate(email: string): string | undefined {
  if (!email) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(email);
    if (err) {
      setError(err);
      return;
    }
    setError(undefined);
    setIsLoading(true);
    // TODO: replace with Axios call when API is ready
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-light">
            <CheckCircle className="text-success" size={28} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-text">Check your email</h1>
        <p className="mt-2 text-sm text-text-muted">
          We sent a password reset link to{" "}
          <span className="font-medium text-text">{email}</span>.
        </p>
        <p className="mt-4 text-xs text-text-muted">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            onClick={() => { setSubmitted(false); }}
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            try again
          </button>
          .
        </p>
        <div className="mt-8">
          <a
            href="/account/login"
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Forgot password?</h1>
        <p className="mt-1 text-sm text-text-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(undefined);
          }}
          error={error}
        />

        <Button
          type="submit"
          variant="cta"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-text-muted">
        Remember your password?{" "}
        <a
          href="/account/login"
          className="text-accent hover:text-accent-hover font-medium transition-colors"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
