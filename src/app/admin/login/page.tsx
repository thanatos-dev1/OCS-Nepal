"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { adminLogin } from "@/lib/api/admin/auth";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, setAdminAuth, hydrate } = useAdminAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (admin) router.replace("/admin/dashboard");
  }, [admin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminLogin(email.trim(), password);
      setAdminAuth(result.accessToken, { adminId: result.adminId, role: result.role });
      router.replace("/admin/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-text">Admin Portal</h1>
          <p className="text-sm text-text-muted mt-1">OCS Nepal — Staff Access</p>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="admin-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ocsnepal.com"
              autoComplete="username"
            />
            <Input
              id="admin-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {error && (
              <p className="text-xs text-error bg-error-light border border-error/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" className="w-full mt-1" isLoading={loading}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
