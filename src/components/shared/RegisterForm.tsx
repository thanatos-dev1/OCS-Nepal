'use client';

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    // TODO: replace with Axios call when API is ready
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
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

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Create an account</h1>
        <p className="mt-1 text-sm text-text-muted">
          Join OCS Nepal and start shopping
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
          disabled={isLoading}
        >
          {isLoading ? "Creating account…" : "Create Account"}
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
