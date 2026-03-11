"use client";

import { use } from "react";
import Link from "next/link";

export default function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-code-green text-2xl text-code-green">
        &#10003;
      </div>
      <h1 className="mb-2 text-2xl font-bold">Payment Successful</h1>
      <p className="mb-8 text-sm text-medium-gray">
        Thank you! Your payment has been processed. You should receive a confirmation email shortly.
      </p>
      <div className="flex gap-4">
        <Link
          href={`/endeavors/${id}/dashboard`}
          className="border border-code-green bg-code-green px-6 py-3 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
        >
          Go to Dashboard
        </Link>
        <Link
          href={`/endeavors/${id}`}
          className="border border-medium-gray/50 px-6 py-3 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
        >
          View Endeavor
        </Link>
      </div>
    </div>
  );
}
