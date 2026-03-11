"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";

type Profile = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  location: string | null;
  skills: string[] | null;
  interests: string[] | null;
};

type Endeavor = {
  id: string;
  title: string;
  category: string;
  status: string;
  memberCount: number;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [endeavors, setEndeavors] = useState<Endeavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interestsInput, setInterestsInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, endeavorsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/endeavors?mine=true"),
      ]);
      if (profileRes.ok) {
        const p = await profileRes.json();
        setProfile(p);
        setBio(p.bio || "");
        setLocation(p.location || "");
        setSkills(p.skills || []);
        setInterests(p.interests || []);
      }
      if (endeavorsRes.ok) {
        setEndeavors(await endeavorsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, location, skills, interests }),
      });
      if (res.ok) {
        setProfile(await res.json());
        setEditing(false);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    const trimmed = skillsInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillsInput("");
    }
  }

  function addInterest() {
    const trimmed = interestsInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setInterestsInput("");
    }
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
      <AppHeader breadcrumb={{ label: "Profile", href: "/profile" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {loading ? (
          <p className="text-medium-gray">Loading...</p>
        ) : (
          <>
            {/* Profile header */}
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center bg-accent text-2xl font-bold">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{session.user.name}</h1>
                <p className="text-sm text-medium-gray">
                  {session.user.email}
                </p>
                {profile?.location && (
                  <p className="text-sm text-medium-gray">
                    {profile.location}
                  </p>
                )}
                {profile?.bio && (
                  <p className="mt-2 text-sm text-light-gray">{profile.bio}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/users/${session.user.id}`}
                  className="border border-medium-gray/50 px-3 py-1.5 text-xs text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
                >
                  Public Profile
                </Link>
                <button
                  onClick={() => setEditing(!editing)}
                  className="border border-medium-gray/50 px-3 py-1.5 text-xs text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
                >
                  {editing ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={handleSignOut}
                  className="border border-medium-gray/50 px-3 py-1.5 text-xs text-medium-gray transition-colors hover:border-red-400 hover:text-red-400"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Skills & Interests display */}
            {!editing && (
              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// skills"}
                  </h3>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="border border-code-blue/30 px-2 py-0.5 text-xs text-code-blue"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-medium-gray">
                      No skills listed yet
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// interests"}
                  </h3>
                  {interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {interests.map((i) => (
                        <span
                          key={i}
                          className="border border-yellow-400/30 px-2 py-0.5 text-xs text-yellow-400"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-medium-gray">
                      No interests listed yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Edit form */}
            {editing && (
              <div className="mb-8 space-y-4 border border-medium-gray/30 p-6">
                <div>
                  <label className="mb-1 block text-sm text-light-gray">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                    placeholder="Tell people about yourself"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-light-gray">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                    placeholder="e.g., Austin, TX"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-light-gray">
                    Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                      placeholder="e.g., Photography, React, Marine Biology"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="border border-medium-gray/50 px-4 py-3 text-sm text-medium-gray hover:text-code-green"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="flex items-center gap-1 border border-code-blue/30 px-2 py-0.5 text-xs text-code-blue"
                      >
                        {s}
                        <button
                          onClick={() =>
                            setSkills(skills.filter((x) => x !== s))
                          }
                          className="text-medium-gray hover:text-red-400"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-light-gray">
                    Interests
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interestsInput}
                      onChange={(e) => setInterestsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInterest();
                        }
                      }}
                      className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                      placeholder="e.g., Hiking, Filmmaking, Conservation"
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="border border-medium-gray/50 px-4 py-3 text-sm text-medium-gray hover:text-code-green"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {interests.map((i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 border border-yellow-400/30 px-2 py-0.5 text-xs text-yellow-400"
                      >
                        {i}
                        <button
                          onClick={() =>
                            setInterests(interests.filter((x) => x !== i))
                          }
                          className="text-medium-gray hover:text-red-400"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="border border-code-green bg-code-green px-6 py-2 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}

            {/* My Endeavors */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-code-green">
                {"// my endeavors"}
              </h2>
              <Link
                href="/endeavors/create"
                className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
              >
                + New Endeavor
              </Link>
            </div>

            {endeavors.length === 0 ? (
              <div className="border border-medium-gray/30 p-8 text-center">
                <p className="mb-4 text-medium-gray">
                  You haven&apos;t created or joined any endeavors yet.
                </p>
                <Link
                  href="/feed"
                  className="text-code-blue hover:text-code-green"
                >
                  Explore endeavors
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {endeavors.map((e) => (
                  <Link
                    key={e.id}
                    href={`/endeavors/${e.id}`}
                    className="flex items-center justify-between border border-medium-gray/30 p-4 transition-colors hover:border-code-green/50"
                  >
                    <div>
                      <h3 className="font-bold">{e.title}</h3>
                      <p className="text-xs text-medium-gray">
                        {e.category} &middot; {e.memberCount} members &middot;{" "}
                        {e.status}
                      </p>
                    </div>
                    <span className="text-xs text-code-blue">
                      View &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
