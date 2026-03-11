"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-xl font-bold">
          Endeavor
        </Link>

        {sent ? (
          <div>
            <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
            <p className="mb-6 text-sm text-medium-gray leading-relaxed">
              If an account exists for <span className="text-code-green">{email}</span>,
              we&apos;ve sent a password reset link. Check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="block w-full border border-medium-gray/50 px-4 py-3 text-center text-sm text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
            >
              Back to Log In
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="mb-2 text-2xl font-bold">Reset your password</h1>
            <p className="mb-8 text-sm text-medium-gray">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-4 border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-light-gray">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-code-green bg-code-green px-4 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-medium-gray">
              Remember your password?{" "}
              <Link href="/login" className="text-code-blue hover:text-code-green">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
