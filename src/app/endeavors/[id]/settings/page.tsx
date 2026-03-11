"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type EndeavorSettings = {
  title: string;
  status: string;
  joinType: string;
  capacity: number | null;
  costPerPerson: number | null;
  showOnPublicFeed: boolean;
  allowEmbeds: boolean;
  crowdfundingEnabled: boolean;
  fundingGoal: number | null;
  creatorId: string;
};

export default function EndeavorSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState("");

  const [status, setStatus] = useState("open");
  const [joinType, setJoinType] = useState("open");
  const [capacity, setCapacity] = useState("");
  const [costPerPerson, setCostPerPerson] = useState("");
  const [showOnPublicFeed, setShowOnPublicFeed] = useState(true);
  const [allowEmbeds, setAllowEmbeds] = useState(true);
  const [crowdfundingEnabled, setCrowdfundingEnabled] = useState(false);
  const [fundingGoal, setFundingGoal] = useState("");

  useEffect(() => {
    fetch(`/api/endeavors/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          router.push(`/endeavors/${id}`);
          return;
        }
        const data: EndeavorSettings = await r.json();
        if (session?.user?.id && data.creatorId !== session.user.id) {
          router.push(`/endeavors/${id}`);
          return;
        }
        setTitle(data.title);
        setStatus(data.status || "open");
        setJoinType(data.joinType || "open");
        setCapacity(data.capacity != null ? String(data.capacity) : "");
        setCostPerPerson(
          data.costPerPerson != null ? String(data.costPerPerson) : ""
        );
        setShowOnPublicFeed(data.showOnPublicFeed ?? true);
        setAllowEmbeds(data.allowEmbeds ?? true);
        setCrowdfundingEnabled(data.crowdfundingEnabled ?? false);
        setFundingGoal(
          data.fundingGoal != null ? String(data.fundingGoal) : ""
        );
        setLoading(false);
      })
      .catch(() => {
        router.push(`/endeavors/${id}`);
      });
  }, [id, session?.user?.id, router]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/endeavors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          joinType,
          capacity: capacity ? Number(capacity) : null,
          costPerPerson: costPerPerson ? Number(costPerPerson) : null,
          showOnPublicFeed,
          allowEmbeds,
          crowdfundingEnabled,
          fundingGoal: fundingGoal ? Number(fundingGoal) : null,
        }),
      });
      if (res.ok) {
        toast("Settings saved", "success");
      } else {
        const data = await res.json().catch(() => null);
        toast(data?.error || "Failed to save settings", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    setSaving(true);
    try {
      const res = await fetch(`/api/endeavors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (res.ok) {
        toast("Endeavor archived", "success");
        router.push("/my-endeavors");
      } else {
        toast("Failed to archive", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/endeavors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Endeavor deleted", "success");
        router.push("/my-endeavors");
      } else {
        toast("Failed to delete", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const selectClass =
    "w-full border border-medium-gray/20 bg-black px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-code-green/50 appearance-none cursor-pointer";
  const inputClass =
    "w-full border border-medium-gray/20 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-code-green/50 placeholder:text-medium-gray/50";
  const sectionHeader =
    "mb-4 text-xs font-semibold uppercase tracking-widest text-code-green";
  const labelClass = "mb-1.5 block text-sm text-light-gray";

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{ label: title || "Settings", href: `/endeavors/${id}` }}
      />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {loading ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-sm text-medium-gray">Loading settings...</p>
          </div>
        ) : (
          <>
            {/* Page title */}
            <div className="mb-10">
              <h1 className="mb-2 text-2xl font-bold">Endeavor Settings</h1>
              <p className="text-sm text-medium-gray">
                Manage configuration for{" "}
                <span className="text-code-blue">{title}</span>
              </p>
            </div>

            {/* General Settings */}
            <section className="mb-10">
              <p className={sectionHeader}>{"// general settings"}</p>
              <div className="border border-medium-gray/20 p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Status */}
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={selectClass}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Join type */}
                  <div>
                    <label className={labelClass}>Join Type</label>
                    <select
                      value={joinType}
                      onChange={(e) => setJoinType(e.target.value)}
                      className={selectClass}
                    >
                      <option value="open">Open</option>
                      <option value="approval">Approval Required</option>
                    </select>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className={labelClass}>Capacity (max members)</label>
                    <input
                      type="number"
                      min="1"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="No limit"
                      className={inputClass}
                    />
                  </div>

                  {/* Cost per person */}
                  <div>
                    <label className={labelClass}>Cost per Person ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costPerPerson}
                      onChange={(e) => setCostPerPerson(e.target.value)}
                      placeholder="Free"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Visibility */}
            <section className="mb-10">
              <p className={sectionHeader}>{"// visibility"}</p>
              <div className="border border-medium-gray/20 p-6">
                <div className="flex flex-col gap-5">
                  {/* Public feed toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Show on Public Feed
                      </p>
                      <p className="mt-0.5 text-xs text-medium-gray">
                        Allow this endeavor to appear in the public feed and
                        search results
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOnPublicFeed(!showOnPublicFeed)}
                      className={`relative h-6 w-11 shrink-0 border transition-colors ${
                        showOnPublicFeed
                          ? "border-code-green/50 bg-code-green/20"
                          : "border-medium-gray/30 bg-transparent"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 block h-4 w-4 transition-all ${
                          showOnPublicFeed
                            ? "left-[22px] bg-code-green"
                            : "left-0.5 bg-medium-gray"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Embeds toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Allow Embeds
                      </p>
                      <p className="mt-0.5 text-xs text-medium-gray">
                        Let others embed this endeavor on external websites
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowEmbeds(!allowEmbeds)}
                      className={`relative h-6 w-11 shrink-0 border transition-colors ${
                        allowEmbeds
                          ? "border-code-green/50 bg-code-green/20"
                          : "border-medium-gray/30 bg-transparent"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 block h-4 w-4 transition-all ${
                          allowEmbeds
                            ? "left-[22px] bg-code-green"
                            : "left-0.5 bg-medium-gray"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Funding */}
            <section className="mb-10">
              <p className={sectionHeader}>{"// funding"}</p>
              <div className="border border-medium-gray/20 p-6">
                <div className="flex flex-col gap-5">
                  {/* Crowdfunding toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Enable Crowdfunding
                      </p>
                      <p className="mt-0.5 text-xs text-medium-gray">
                        Accept contributions toward a funding goal
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCrowdfundingEnabled(!crowdfundingEnabled)
                      }
                      className={`relative h-6 w-11 shrink-0 border transition-colors ${
                        crowdfundingEnabled
                          ? "border-code-green/50 bg-code-green/20"
                          : "border-medium-gray/30 bg-transparent"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 block h-4 w-4 transition-all ${
                          crowdfundingEnabled
                            ? "left-[22px] bg-code-green"
                            : "left-0.5 bg-medium-gray"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Funding goal */}
                  {crowdfundingEnabled && (
                    <div>
                      <label className={labelClass}>Funding Goal ($)</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={fundingGoal}
                        onChange={(e) => setFundingGoal(e.target.value)}
                        placeholder="Enter target amount"
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Save button */}
            <div className="mb-16">
              <button
                onClick={handleSave}
                disabled={saving}
                className="border border-code-green/50 bg-code-green/10 px-8 py-2.5 text-sm font-semibold text-code-green transition-colors hover:bg-code-green/20 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Danger Zone */}
            <section>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-red-400">
                {"// danger zone"}
              </p>
              <div className="border border-red-500/30 p-6">
                <div className="flex flex-col gap-6">
                  {/* Archive */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Archive Endeavor
                      </p>
                      <p className="mt-0.5 text-xs text-medium-gray">
                        Remove from active listings. Can be restored later.
                      </p>
                    </div>
                    <button
                      onClick={handleArchive}
                      disabled={saving}
                      className="shrink-0 border border-red-500/30 px-5 py-2 text-sm text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Archive
                    </button>
                  </div>

                  <div className="border-t border-red-500/20" />

                  {/* Delete */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Delete Endeavor
                      </p>
                      <p className="mt-0.5 text-xs text-medium-gray">
                        Permanently remove this endeavor and all associated
                        data. This action cannot be undone.
                      </p>
                    </div>
                    {confirmDelete ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="border border-red-500 bg-red-500/20 px-5 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                        >
                          {deleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="border border-medium-gray/30 px-5 py-2 text-sm text-medium-gray transition-colors hover:border-medium-gray/50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="shrink-0 border border-red-500/30 px-5 py-2 text-sm text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
