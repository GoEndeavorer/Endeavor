"use client";

import { use } from "react";
import Link from "next/link";

export default function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-yellow-400 text-2xl text-yellow-400">
        !
      </div>
      <h1 className="mb-2 text-2xl font-bold">Payment Cancelled</h1>
      <p className="mb-8 text-sm text-medium-gray">
        Your payment was not completed. No charges were made.
      </p>
      <Link
        href={`/endeavors/${id}`}
        className="border border-code-green px-6 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
      >
        Back to Endeavor
      </Link>
    </div>
  );
}
