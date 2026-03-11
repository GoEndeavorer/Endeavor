"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interestsInput, setInterestsInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

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

  async function handleComplete() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, location, skills, interests }),
    });
    router.push("/feed");
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-8 block text-xl font-bold">
          Endeavor
        </Link>

        {step === 0 && (
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              Welcome, {session.user.name}!
            </h1>
            <p className="mb-8 text-sm text-medium-gray leading-relaxed">
              You&apos;re in. Let&apos;s set up your profile so people can find you
              and you can get personalized recommendations.
            </p>

            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="border border-code-green/30 p-4 text-center">
                <p className="mb-1 text-2xl font-bold text-code-green">01</p>
                <p className="text-xs text-medium-gray">Post ideas</p>
              </div>
              <div className="border border-code-blue/30 p-4 text-center">
                <p className="mb-1 text-2xl font-bold text-code-blue">02</p>
                <p className="text-xs text-medium-gray">Join crews</p>
              </div>
              <div className="border border-purple-400/30 p-4 text-center">
                <p className="mb-1 text-2xl font-bold text-purple-400">03</p>
                <p className="text-xs text-medium-gray">Make it real</p>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full border border-code-green bg-code-green px-4 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
            >
              Set Up Profile
            </button>
            <button
              onClick={() => router.push("/feed")}
              className="mt-3 w-full text-center text-xs text-medium-gray hover:text-code-blue"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-2 text-2xl font-bold">Tell us about yourself</h2>
            <p className="mb-6 text-sm text-medium-gray">
              This helps others find you and helps us recommend endeavors.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-light-gray">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                  placeholder="What drives you? What do you love doing?"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-light-gray">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                  placeholder="e.g., Austin, TX"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-light-gray">Skills</label>
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
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Photography", "Programming", "Design", "Writing", "Video", "Music", "Research", "Marketing", "Teaching", "Engineering"].filter(s => !skills.includes(s)).slice(0, 6).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSkills([...skills, s])}
                      className="border border-medium-gray/20 px-2 py-0.5 text-xs text-medium-gray hover:border-code-blue hover:text-code-blue transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
                {skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 border border-code-blue/30 px-2 py-0.5 text-xs text-code-blue">
                        {s}
                        <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-medium-gray hover:text-red-400">x</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-light-gray">Interests</label>
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
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Hiking", "Filmmaking", "Science", "Travel", "Art", "Conservation", "Music", "Tech", "Cooking", "Sports"].filter(i => !interests.includes(i)).slice(0, 6).map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInterests([...interests, i])}
                      className="border border-medium-gray/20 px-2 py-0.5 text-xs text-medium-gray hover:border-purple-400 hover:text-purple-400 transition-colors"
                    >
                      + {i}
                    </button>
                  ))}
                </div>
                {interests.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {interests.map((i) => (
                      <span key={i} className="flex items-center gap-1 border border-purple-400/30 px-2 py-0.5 text-xs text-purple-400">
                        {i}
                        <button onClick={() => setInterests(interests.filter((x) => x !== i))} className="text-medium-gray hover:text-red-400">x</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={saving}
              className="mt-6 w-full border border-code-green bg-code-green px-4 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-50"
            >
              {saving ? "Saving..." : "Complete Setup"}
            </button>
            <button
              onClick={() => router.push("/feed")}
              className="mt-3 w-full text-center text-xs text-medium-gray hover:text-code-blue"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
