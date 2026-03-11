"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { EmailPreferences } from "@/components/email-preferences";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    joinRequests: true,
    newMembers: true,
    discussions: true,
    milestones: true,
    updates: true,
    directMessages: true,
    soundEnabled: false,
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      setName(session.user.name);
      // Load notification preferences from localStorage
      try {
        const stored = localStorage.getItem("endeavor_notif_prefs");
        if (stored) setNotifPrefs(JSON.parse(stored));
      } catch {}
    }
  }, [session]);

  function toggleNotifPref(key: keyof typeof notifPrefs) {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem("endeavor_notif_prefs", JSON.stringify(updated));
    toast("Preference saved");
  }

  async function handleSaveName() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      toast("Name updated");
    } else {
      toast("Failed to update name", "error");
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Settings", href: "/settings" }} />

      <main className="mx-auto max-w-xl px-4 pt-24 pb-16">
        <h1 className="mb-8 text-2xl font-bold">Account Settings</h1>

        {/* Account info */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// account"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-medium-gray">Email</label>
              <div className="border border-medium-gray/20 bg-medium-gray/5 px-4 py-3 text-sm text-medium-gray">
                {session.user.email}
              </div>
              <p className="mt-1 text-xs text-medium-gray">
                Email cannot be changed.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-medium-gray">Display Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || name === session.user.name}
                  className="border border-code-green px-4 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                >
                  {saving ? "..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// password"}
          </h2>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
            />
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
            />
            {passwordError && (
              <p className="text-xs text-red-400">{passwordError}</p>
            )}
            <button
              disabled={passwordSaving || !currentPassword || !newPassword}
              onClick={async () => {
                setPasswordError("");
                if (newPassword.length < 8) {
                  setPasswordError("Password must be at least 8 characters");
                  return;
                }
                if (newPassword !== confirmNewPassword) {
                  setPasswordError("Passwords do not match");
                  return;
                }
                setPasswordSaving(true);
                try {
                  const res = await fetch("/api/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      currentPassword,
                      newPassword,
                    }),
                  });
                  if (res.ok) {
                    toast("Password updated");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  } else {
                    const data = await res.json();
                    setPasswordError(data.error || "Failed to change password");
                  }
                } catch {
                  setPasswordError("Something went wrong");
                } finally {
                  setPasswordSaving(false);
                }
              }}
              className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
            >
              {passwordSaving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </section>

        {/* In-App Notification Preferences */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// notifications"}
          </h2>
          <div className="space-y-1">
            {[
              { key: "joinRequests" as const, label: "Join requests", desc: "When someone requests to join your endeavor" },
              { key: "newMembers" as const, label: "New members", desc: "When someone joins your endeavor" },
              { key: "discussions" as const, label: "Discussion messages", desc: "When a new message is posted in your endeavor" },
              { key: "milestones" as const, label: "Milestone updates", desc: "When a milestone is completed" },
              { key: "updates" as const, label: "Endeavor updates", desc: "When an update is posted in endeavors you follow" },
              { key: "directMessages" as const, label: "Direct messages", desc: "When someone sends you a direct message" },
              { key: "soundEnabled" as const, label: "Notification sound", desc: "Play a sound when new notifications arrive" },
            ].map((pref) => (
              <label
                key={pref.key}
                className="flex cursor-pointer items-center justify-between border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
              >
                <div>
                  <p className="text-sm">{pref.label}</p>
                  <p className="text-xs text-medium-gray">{pref.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs[pref.key]}
                  onChange={() => toggleNotifPref(pref.key)}
                  className="h-4 w-4 accent-code-green"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Email Notification Preferences */}
        <section className="mb-8">
          <EmailPreferences />
        </section>

        {/* Quick links */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// manage"}
          </h2>
          <div className="space-y-2">
            <Link
              href="/profile"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Edit Profile</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </Link>
            <Link
              href="/saved"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Saved Endeavors</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </Link>
            <Link
              href="/my-endeavors"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>My Endeavors</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </Link>
            <Link
              href="/notifications"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Notifications</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </Link>
            <Link
              href="/achievements"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Achievements</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </Link>
            <Link
              href="/collections"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Collections</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </Link>
            <Link
              href="/messages"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Messages</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </Link>
            <button
              onClick={async () => {
                toast("Preparing export...");
                const res = await fetch("/api/export");
                if (res.ok) {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "endeavor-data.json";
                  a.click();
                  URL.revokeObjectURL(url);
                  toast("Data exported");
                } else {
                  toast("Export failed", "error");
                }
              }}
              className="flex w-full items-center justify-between border border-medium-gray/20 p-4 text-sm text-left transition-colors hover:border-code-green/30"
            >
              <span>Export My Data</span>
              <span className="text-xs text-medium-gray">&darr;</span>
            </button>
          </div>
        </section>

        {/* Session */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// session"}
          </h2>
          <button
            onClick={handleSignOut}
            className="border border-medium-gray/50 px-6 py-3 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-red-400 hover:text-red-400"
          >
            Sign Out
          </button>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-red-400">
            {"// danger zone"}
          </h2>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="border border-red-500/30 px-6 py-3 text-xs font-bold uppercase text-red-400 transition-colors hover:bg-red-500 hover:text-black"
            >
              Delete Account
            </button>
          ) : (
            <div className="border border-red-500/30 p-4">
              <p className="mb-3 text-sm text-red-400">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  className="border border-red-500 bg-red-500 px-4 py-2 text-xs font-bold uppercase text-black disabled:opacity-50"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    const res = await fetch("/api/account", { method: "DELETE" });
                    if (res.ok) {
                      await signOut();
                      router.push("/");
                    } else {
                      const data = await res.json();
                      toast(data.error || "Failed to delete account", "error");
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? "Deleting..." : "I understand, delete my account"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 text-xs text-medium-gray hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
