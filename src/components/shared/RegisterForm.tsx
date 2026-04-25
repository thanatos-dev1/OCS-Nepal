'use client';

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { register } from "@/lib/api/auth";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(name: string, email: string, password: string, confirmPassword: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) {
    errors.name = "Full name is required.";
  }
  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(name, email, password, confirmPassword);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError("");
    setIsLoading(true);
    try {
      await register(name, email, password);
      setRegistered(true);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Registration failed. Please try again.")
        : "Registration failed. Please try again.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const PasswordToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="text-text-muted hover:text-text transition-colors focus-visible:outline-none"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  if (registered) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-success-light p-4">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-text">Check your email</h1>
        <p className="mt-2 text-sm text-text-muted">
          We sent a verification link to <span className="font-medium text-text">{email}</span>.
          Click it to activate your account, then sign in.
        </p>
        <a href="/account/login" className="mt-6 inline-block text-sm text-accent hover:text-accent-hover font-medium transition-colors">
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Create an account</h1>
        <p className="mt-1 text-sm text-text-muted">
          Join OCS Nepal and start shopping
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {apiError && (
          <p className="text-sm text-error bg-error-light border border-error/20 rounded-md px-4 py-3">
            {apiError}
          </p>
        )}

        <Input
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Bishal Rajbahak"
          value={name}
          onChange={(e) => { setName(e.target.value); clearError("name"); }}
          error={errors.name}
        />

        <Input
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
          error={errors.email}
        />

        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
          error={errors.password}
          suffix={<PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />

        <Input
          id="confirmPassword"
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
          error={errors.confirmPassword}
          suffix={<PasswordToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />}
        />

        <Button
          type="submit"
          variant="cta"
          size="lg"
          className="w-full mt-1"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-text-muted">
        Already have an account?{" "}
        <a href="/account/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
          Sign in
        </a>
      </p>

      <p className="mt-4 text-center text-xs text-text-muted/70">
        By creating an account you agree to our{" "}
        <a href="/terms" className="underline hover:text-text-muted transition-colors">Terms</a>
        {" "}and{" "}
        <a href="/privacy" className="underline hover:text-text-muted transition-colors">Privacy Policy</a>.
      </p>
    </div>
  );
}
