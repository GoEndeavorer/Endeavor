"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">Invalid Reset Link</h1>
          <p className="mb-6 text-sm text-medium-gray">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block border border-code-green bg-code-green px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-xl font-bold">
          Endeavor
        </Link>

        {success ? (
          <div>
            <h1 className="mb-2 text-2xl font-bold">Password reset</h1>
            <p className="mb-6 text-sm text-medium-gray">
              Your password has been updated. You can now log in with your new password.
            </p>
            <Link
              href="/login"
              className="block w-full border border-code-green bg-code-green px-4 py-3 text-center text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
            >
              Log In
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="mb-2 text-2xl font-bold">Set new password</h1>
            <p className="mb-8 text-sm text-medium-gray">
              Choose a new password for your account.
            </p>

            {error && (
              <div className="mb-4 border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm text-light-gray">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm text-light-gray">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                  placeholder="Re-enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-code-green bg-code-green px-4 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
