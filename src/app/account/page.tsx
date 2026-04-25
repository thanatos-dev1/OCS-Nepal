"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check, Eye, EyeOff, KeyRound, User } from "lucide-react";
import axios from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/hooks/useProfile";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Feedback({ success, error }: { success?: string; error?: string }) {
  if (success)
    return (
      <p className="text-sm text-success bg-success-light border border-success/20 rounded-md px-4 py-3">
        {success}
      </p>
    );
  if (error)
    return (
      <p className="text-sm text-error bg-error-light border border-error/20 rounded-md px-4 py-3">
        {error}
      </p>
    );
  return null;
}

function ProfileCard() {
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const updateProfile = useUpdateProfileMutation();

  function startEdit() {
    setNameInput(user?.name ?? "");
    setEditing(true);
    setSuccess("");
    setError("");
  }

  function cancelEdit() {
    setEditing(false);
    setNameInput(user?.name ?? "");
  }

  function handleSave() {
    if (!nameInput.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setError("");
    updateProfile.mutate(
      { name: nameInput.trim() },
      {
        onSuccess: () => {
          setEditing(false);
          setSuccess("Profile updated.");
          setTimeout(() => setSuccess(""), 3000);
        },
        onError: (err) => {
          setError(
            axios.isAxiosError(err)
              ? (err.response?.data?.error ?? "Failed to update profile.")
              : "Failed to update profile."
          );
        },
      }
    );
  }

  if (!user) return null;

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <User size={18} className="text-primary" />
        <h2 className="text-base font-semibold text-text">Profile</h2>
      </div>

      <div className="flex items-start gap-5">
        <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-xl font-bold select-none">
          {getInitials(user.name)}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">
              Full Name
            </p>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 h-9 rounded-md border border-border bg-bg px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
                <button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  aria-label="Save name"
                  className="p-1.5 rounded-md text-success hover:bg-success-light transition-colors disabled:opacity-50"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={cancelEdit}
                  aria-label="Cancel edit"
                  className="p-1.5 rounded-md text-text-muted hover:bg-bg-subtle transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">{user.name}</span>
                <button
                  onClick={startEdit}
                  aria-label="Edit name"
                  className="p-1 rounded text-text-muted hover:text-primary hover:bg-bg-subtle transition-colors"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">
              Email
            </p>
            <span className="text-sm text-text">{user.email}</span>
          </div>
        </div>
      </div>

      <Feedback success={success} error={error} />
    </div>
  );
}

function SecurityCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const changePassword = useChangePasswordMutation();

  function toggle(field: keyof typeof show) {
    setShow((s) => ({ ...s, [field]: !s[field] }));
  }

  function EyeToggle({ field }: { field: keyof typeof show }) {
    return (
      <button
        type="button"
        onClick={() => toggle(field)}
        aria-label={show[field] ? "Hide password" : "Show password"}
        className="text-text-muted hover:text-text transition-colors focus-visible:outline-none"
      >
        {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!current || !next || !confirm) { setError("All fields are required."); return; }
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }

    changePassword.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          setSuccess("Password changed successfully.");
          setCurrent(""); setNext(""); setConfirm("");
          setTimeout(() => setSuccess(""), 4000);
        },
        onError: (err) => {
          setError(
            axios.isAxiosError(err)
              ? (err.response?.data?.error ?? "Failed to change password.")
              : "Failed to change password."
          );
        },
      }
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <KeyRound size={18} className="text-primary" />
        <h2 className="text-base font-semibold text-text">Security</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="current-password"
          label="Current Password"
          type={show.current ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter current password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          suffix={<EyeToggle field="current" />}
        />
        <Input
          id="new-password"
          label="New Password"
          type={show.next ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          suffix={<EyeToggle field="next" />}
        />
        <Input
          id="confirm-password"
          label="Confirm New Password"
          type={show.confirm ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          suffix={<EyeToggle field="confirm" />}
        />

        <Feedback success={success} error={error} />

        <Button type="submit" variant="primary" isLoading={changePassword.isPending} className="self-start">
          Change Password
        </Button>
      </form>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (hasHydrated && !user) router.replace("/account/login");
  }, [hasHydrated, user, router]);

  if (!hasHydrated) return null;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">My Account</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your profile and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCard />
        <SecurityCard />
      </div>
    </div>
  );
}
