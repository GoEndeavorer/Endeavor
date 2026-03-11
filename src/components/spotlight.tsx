"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SpotlightData = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  imageUrl: string | null;
  status: string;
  creatorName: string;
  creatorId: string;
  memberCount: number;
};

export function Spotlight() {
  const [data, setData] = useState<SpotlightData | null>(null);

  useEffect(() => {
    fetch("/api/spotlight")
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <section className="border-t border-medium-gray/30 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// spotlight"}
        </p>

        <Link
          href={`/endeavors/${data.id}`}
          className="group block border border-medium-gray/20 overflow-hidden transition-colors hover:border-code-green/50 md:flex"
        >
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt=""
              className="h-48 w-full object-cover md:h-auto md:w-1/3"
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-code-green/5 text-6xl font-bold text-code-green/20 md:h-auto md:w-1/3">
              {data.title.charAt(0)}
            </div>
          )}
          <div className="flex-1 p-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="border border-code-green/30 px-2 py-0.5 text-xs uppercase text-code-green">
                {data.category}
              </span>
              <span className="text-xs text-medium-gray">
                {data.memberCount} members
              </span>
              {data.location && (
                <span className="text-xs text-medium-gray">{data.location}</span>
              )}
            </div>
            <h3 className="mb-2 text-2xl font-bold group-hover:text-code-green transition-colors">
              {data.title}
            </h3>
            <p className="mb-4 text-sm text-light-gray leading-relaxed line-clamp-3">
              {data.description}
            </p>
            <p className="text-xs text-medium-gray">
              by{" "}
              <span className="text-code-blue">{data.creatorName}</span>
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
