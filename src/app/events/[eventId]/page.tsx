"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type RSVP = {
  user_id: string;
  name: string;
  image: string | null;
  status: string;
};

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  meeting_link: string | null;
  capacity: number | null;
  endeavor_id: string | null;
  creator_id: string;
  creator_name: string;
  rsvp_count: number;
  created_at: string;
};

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRsvp, setMyRsvp] = useState<string | null>(null);
  const [rsvping, setRsvping] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events?eventId=${eventId}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/events/${eventId}/rsvp`).then((r) => (r.ok ? r.json() : [])),
    ]).then(([events, rsvpList]) => {
      const e = Array.isArray(events) ? events.find((ev: Event) => ev.id === eventId) : events;
      setEvent(e || null);
      setRsvps(rsvpList);
      if (session) {
        const mine = rsvpList.find((r: RSVP) => r.user_id === session.user.id);
        setMyRsvp(mine?.status || null);
      }
      setLoading(false);
    });
  }, [eventId, session]);

  async function rsvp(status: string) {
    if (!session) return;
    setRsvping(true);
    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMyRsvp(status);
      // Update rsvp list
      const existingIdx = rsvps.findIndex((r) => r.user_id === session.user.id);
      if (existingIdx >= 0) {
        setRsvps((prev) =>
          prev.map((r) => (r.user_id === session.user.id ? { ...r, status } : r))
        );
      } else {
        setRsvps((prev) => [
          ...prev,
          { user_id: session.user.id, name: session.user.name, image: null, status },
        ]);
      }
      toast(`RSVP: ${status}`, "success");
    }
    setRsvping(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Events", href: "/events" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Events", href: "/events" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Event not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const isPast = startDate < new Date();
  const going = rsvps.filter((r) => r.status === "going");
  const maybe = rsvps.filter((r) => r.status === "maybe");

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Events", href: "/events" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-1.5 py-0.5 border ${isPast ? "border-medium-gray/30 text-medium-gray" : "border-code-green/30 text-code-green"}`}>
              {isPast ? "Past" : "Upcoming"}
            </span>
            <span className="text-xs px-1.5 py-0.5 border border-code-blue/20 text-code-blue">
              {event.event_type}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          {event.description && (
            <p className="text-sm text-medium-gray mb-3">{event.description}</p>
          )}

          {/* Details */}
          <div className="grid gap-2 sm:grid-cols-2 mb-4">
            <div className="border border-medium-gray/20 p-3">
              <p className="text-xs text-medium-gray mb-1">Date & Time</p>
              <p className="text-sm text-light-gray">
                {startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-sm text-code-green">
                {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                {event.end_time && ` — ${new Date(event.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
              </p>
            </div>
            <div className="border border-medium-gray/20 p-3">
              <p className="text-xs text-medium-gray mb-1">Location</p>
              {event.location ? (
                <p className="text-sm text-light-gray">{event.location}</p>
              ) : event.meeting_link ? (
                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-code-blue hover:text-code-green">
                  Virtual Meeting
                </a>
              ) : (
                <p className="text-sm text-medium-gray">TBD</p>
              )}
              {event.capacity && (
                <p className="text-xs text-medium-gray mt-1">{going.length}/{event.capacity} spots filled</p>
              )}
            </div>
          </div>

          <p className="text-xs text-medium-gray">
            Organized by{" "}
            <Link href={`/users/${event.creator_id}`} className="text-code-blue hover:text-code-green">
              {event.creator_name}
            </Link>{" "}
            · {formatTimeAgo(event.created_at)}
          </p>
        </div>

        {/* RSVP buttons */}
        {session && !isPast && (
          <div className="flex gap-2 mb-6">
            {(["going", "maybe", "not_going"] as const).map((status) => (
              <button
                key={status}
                onClick={() => rsvp(status)}
                disabled={rsvping}
                className={`px-4 py-2 text-xs font-semibold border transition-colors ${
                  myRsvp === status
                    ? status === "going"
                      ? "border-code-green bg-code-green text-black"
                      : status === "maybe"
                      ? "border-code-blue bg-code-blue text-black"
                      : "border-red-400 bg-red-400 text-black"
                    : "border-medium-gray/30 text-medium-gray hover:text-light-gray"
                } disabled:opacity-50`}
              >
                {status === "going" ? "Going" : status === "maybe" ? "Maybe" : "Not Going"}
              </button>
            ))}
          </div>
        )}

        {/* Attendees */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
            {"// "}{going.length} going{maybe.length > 0 ? ` · ${maybe.length} maybe` : ""}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {going.map((r) => (
              <Link
                key={r.user_id}
                href={`/users/${r.user_id}`}
                className="flex items-center gap-2 border border-code-green/20 p-2 hover:border-code-green/40 transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center border border-code-green/20 text-code-green text-xs font-bold">
                  {r.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-xs text-light-gray">{r.name}</span>
                <span className="text-xs text-code-green ml-auto">Going</span>
              </Link>
            ))}
            {maybe.map((r) => (
              <Link
                key={r.user_id}
                href={`/users/${r.user_id}`}
                className="flex items-center gap-2 border border-medium-gray/20 p-2 hover:border-code-blue/40 transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center border border-medium-gray/20 text-medium-gray text-xs font-bold">
                  {r.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-xs text-light-gray">{r.name}</span>
                <span className="text-xs text-code-blue ml-auto">Maybe</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
