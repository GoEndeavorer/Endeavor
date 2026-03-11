"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { useToast } from "@/components/toast";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      setName(session.user.name);
    }
  }, [session]);

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

        {/* Quick links */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// manage"}
          </h2>
          <div className="space-y-2">
            <a
              href="/profile"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Edit Profile</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </a>
            <a
              href="/saved"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Saved Endeavors</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </a>
            <a
              href="/my-endeavors"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>My Endeavors</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </a>
            <a
              href="/notifications"
              className="flex items-center justify-between border border-medium-gray/20 p-4 text-sm transition-colors hover:border-code-green/30"
            >
              <span>Notifications</span>
              <span className="text-xs text-medium-gray">&rarr;</span>
            </a>
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
                  className="border border-red-500 bg-red-500 px-4 py-2 text-xs font-bold uppercase text-black"
                  onClick={() => toast("Account deletion is not yet implemented", "error")}
                >
                  I understand, delete my account
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
    </div>
  );
}
