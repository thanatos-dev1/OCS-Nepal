"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check, Eye, EyeOff, KeyRound, User, Camera, MapPin, Phone, BadgeCheck } from "lucide-react";
import axios from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateProfileMutation, useChangePasswordMutation, useUploadAvatarMutation } from "@/hooks/useProfile";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function Feedback({ success, error }: { success?: string; error?: string }) {
  if (success)
    return <p className="text-sm text-success bg-success-light border border-success/20 rounded-md px-4 py-3">{success}</p>;
  if (error)
    return <p className="text-sm text-error bg-error-light border border-error/20 rounded-md px-4 py-3">{error}</p>;
  return null;
}

function ProfileCard() {
  const user = useAuthStore((s) => s.user);
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [phoneInput, setPhoneInput] = useState(user?.phone ?? "");
  const [addressInput, setAddressInput] = useState(user?.address ?? "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateProfileMutation();
  const uploadAvatar = useUploadAvatarMutation();

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar.mutate(file, {
      onSuccess: () => flash("Profile picture updated."),
      onError: () => setError("Failed to upload photo."),
    });
  }

  function saveName() {
    if (!nameInput.trim()) { setError("Name cannot be empty."); return; }
    setError("");
    updateProfile.mutate(
      { name: nameInput.trim(), phone: user?.phone, address: user?.address },
      {
        onSuccess: () => { setEditingName(false); flash("Name updated."); },
        onError: (err) => setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed to update.") : "Failed to update."),
      }
    );
  }

  function savePhone() {
    const trimmed = phoneInput.trim();
    if (trimmed && !/^\d{10}$/.test(trimmed)) { setError("Phone must be 10 digits."); return; }
    setError("");
    updateProfile.mutate(
      { name: user?.name ?? "", phone: trimmed || undefined, address: user?.address },
      {
        onSuccess: () => { setEditingPhone(false); flash("Phone updated."); },
        onError: (err) => setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed to update.") : "Failed to update."),
      }
    );
  }

  function saveAddress() {
    setError("");
    updateProfile.mutate(
      { name: user?.name ?? "", phone: user?.phone, address: addressInput.trim() || undefined },
      {
        onSuccess: () => { setEditingAddress(false); flash("Address saved."); },
        onError: (err) => setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed to update.") : "Failed to update."),
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
        {/* Avatar */}
        <div className="relative shrink-0 group cursor-pointer" onClick={() => fileRef.current?.click()}>
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center select-none">
              {getInitials(user.name)}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploadAvatar.isPending
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Camera size={16} className="text-white" />}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Name */}
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Full Name</p>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                  className="flex-1 h-9 rounded-md border border-border bg-bg px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
                <button onClick={saveName} disabled={updateProfile.isPending} className="p-1.5 rounded-md text-success hover:bg-success-light transition-colors disabled:opacity-50"><Check size={16} /></button>
                <button onClick={() => setEditingName(false)} className="p-1.5 rounded-md text-text-muted hover:bg-bg-subtle transition-colors"><X size={16} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-text">{user.name}</span>
                {user.purchaseBadge && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success-light text-success text-xs font-semibold">
                    <BadgeCheck size={12} />
                    Verified Buyer
                  </span>
                )}
                <button onClick={() => { setNameInput(user.name); setEditingName(true); setSuccess(""); setError(""); }} className="p-1 rounded text-text-muted hover:text-primary hover:bg-bg-subtle transition-colors"><Pencil size={13} /></button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Email</p>
            <span className="text-sm text-text">{user.email}</span>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <Phone size={11} className="text-text-muted" />
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Phone</p>
            </div>
            {editingPhone ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") savePhone(); if (e.key === "Escape") setEditingPhone(false); }}
                  placeholder="98XXXXXXXX"
                  className="flex-1 h-9 rounded-md border border-border bg-bg px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
                <button onClick={savePhone} disabled={updateProfile.isPending} className="p-1.5 rounded-md text-success hover:bg-success-light transition-colors disabled:opacity-50"><Check size={16} /></button>
                <button onClick={() => { setEditingPhone(false); setPhoneInput(user.phone ?? ""); }} className="p-1.5 rounded-md text-text-muted hover:bg-bg-subtle transition-colors"><X size={16} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text">{user.phone || <span className="text-text-disabled">Not set</span>}</span>
                <button onClick={() => { setPhoneInput(user.phone ?? ""); setEditingPhone(true); setSuccess(""); setError(""); }} className="p-1 rounded text-text-muted hover:text-primary hover:bg-bg-subtle transition-colors"><Pencil size={13} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin size={13} className="text-text-muted" />
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Delivery Address</p>
        </div>
        {editingAddress ? (
          <div className="flex flex-col gap-2">
            <AddressAutocomplete
              label=""
              value={addressInput}
              onChange={setAddressInput}
              placeholder="Search your address…"
            />
            <div className="flex gap-2">
              <button onClick={saveAddress} disabled={updateProfile.isPending} className="p-1.5 rounded-md text-success hover:bg-success-light transition-colors disabled:opacity-50"><Check size={16} /></button>
              <button onClick={() => { setEditingAddress(false); setAddressInput(user.address ?? ""); }} className="p-1.5 rounded-md text-text-muted hover:bg-bg-subtle transition-colors"><X size={16} /></button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <span className="text-sm text-text flex-1">
              {user.address || <span className="text-text-disabled">No address saved</span>}
            </span>
            <button
              onClick={() => { setAddressInput(user.address ?? ""); setEditingAddress(true); setSuccess(""); setError(""); }}
              className="p-1 rounded text-text-muted hover:text-primary hover:bg-bg-subtle transition-colors shrink-0"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
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

  function toggle(field: keyof typeof show) { setShow((s) => ({ ...s, [field]: !s[field] })); }

  function EyeToggle({ field }: { field: keyof typeof show }) {
    return (
      <button type="button" onClick={() => toggle(field)} aria-label={show[field] ? "Hide" : "Show"} className="text-text-muted hover:text-text transition-colors focus-visible:outline-none">
        {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!current || !next || !confirm) { setError("All fields are required."); return; }
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    changePassword.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => { setSuccess("Password changed."); setCurrent(""); setNext(""); setConfirm(""); setTimeout(() => setSuccess(""), 4000); },
        onError: (err) => setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed to change password.") : "Failed to change password."),
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
        <Input id="current-password" label="Current Password" type={show.current ? "text" : "password"} autoComplete="current-password" placeholder="Enter current password" value={current} onChange={(e) => setCurrent(e.target.value)} suffix={<EyeToggle field="current" />} />
        <Input id="new-password" label="New Password" type={show.next ? "text" : "password"} autoComplete="new-password" placeholder="Min. 8 characters" value={next} onChange={(e) => setNext(e.target.value)} suffix={<EyeToggle field="next" />} />
        <Input id="confirm-password" label="Confirm New Password" type={show.confirm ? "text" : "password"} autoComplete="new-password" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} suffix={<EyeToggle field="confirm" />} />
        <Feedback success={success} error={error} />
        <Button type="submit" variant="primary" isLoading={changePassword.isPending} className="self-start">Change Password</Button>
      </form>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s._isInitialized);

  useEffect(() => {
    if (isInitialized && !user) router.replace("/account/login");
  }, [isInitialized, user, router]);

  if (!isInitialized || !user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">My Account</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your profile, security, and orders</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileCard />
          <SecurityCard />
        </div>
      </div>
    </div>
  );
}
