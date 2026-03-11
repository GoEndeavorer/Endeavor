"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type Event = {
  id: string;
  endeavor_id: string | null;
  creator_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  location_type: string;
  meeting_url: string | null;
  max_attendees: number | null;
  created_at: string;
  creator_name: string;
  creator_image: string | null;
  attendee_count: number;
  endeavor_title: string | null;
};

export default function EventsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    locationType: "remote",
    meetingUrl: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/events?upcoming=${!showPast}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [session, showPast]);

  async function createEvent() {
    if (!form.title.trim() || !form.startTime) return;
    setCreating(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description || undefined,
        startTime: form.startTime,
        endTime: form.endTime || undefined,
        location: form.location || undefined,
        locationType: form.locationType,
        meetingUrl: form.meetingUrl || undefined,
      }),
    });
    if (res.ok) {
      toast("Event created!", "success");
      setShowCreate(false);
      setForm({ title: "", description: "", startTime: "", endTime: "", location: "", locationType: "remote", meetingUrl: "" });
      // Refresh
      const r = await fetch(`/api/events?upcoming=${!showPast}`);
      if (r.ok) setEvents(await r.json());
    }
    setCreating(false);
  }

  async function rsvp(eventId: string, status: string) {
    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast(status === "going" ? "You're going!" : status === "maybe" ? "Marked as maybe" : "RSVP removed", "success");
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, attendee_count: status === "going" ? e.attendee_count + 1 : Math.max(0, e.attendee_count - 1) }
            : e
        )
      );
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Events", href: "/events" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">
            <Link href="/login" className="text-code-blue hover:text-code-green">Log in</Link> to view events.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Events", href: "/events" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-sm text-medium-gray">Upcoming events from your endeavors</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
          >
            {showCreate ? "Cancel" : "Create Event"}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// new event"}
            </h2>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Event title"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
              rows={2}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-medium-gray mb-1 block">Start</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-medium-gray mb-1 block">End (optional)</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.locationType}
                onChange={(e) => setForm((f) => ({ ...f, locationType: e.target.value }))}
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="remote">Remote</option>
                <option value="in-person">In-Person</option>
                <option value="either">Hybrid</option>
              </select>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder={form.locationType === "remote" ? "Platform (e.g., Zoom)" : "Address"}
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
            </div>
            {form.locationType !== "in-person" && (
              <input
                value={form.meetingUrl}
                onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))}
                placeholder="Meeting URL (optional)"
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
            )}
            <button
              onClick={createEvent}
              disabled={creating || !form.title.trim() || !form.startTime}
              className="w-full py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Event"}
            </button>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowPast(false)}
            className={`px-3 py-1 text-xs transition-colors ${
              !showPast
                ? "bg-code-green/10 text-code-green border border-code-green/30"
                : "text-medium-gray hover:text-white border border-medium-gray/20"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setShowPast(true)}
            className={`px-3 py-1 text-xs transition-colors ${
              showPast
                ? "bg-code-green/10 text-code-green border border-code-green/30"
                : "text-medium-gray hover:text-white border border-medium-gray/20"
            }`}
          >
            All Events
          </button>
        </div>

        {/* Events list */}
        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : events.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No events found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const start = new Date(event.start_time);
              const end = event.end_time ? new Date(event.end_time) : null;
              const isPast = start < new Date();
              const isToday = start.toDateString() === new Date().toDateString();

              return (
                <div
                  key={event.id}
                  className={`border p-4 transition-colors ${
                    isPast ? "border-medium-gray/10 opacity-60" : isToday ? "border-code-green/30" : "border-medium-gray/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Date block */}
                    <div className="shrink-0 text-center w-14">
                      <p className="text-xs uppercase text-medium-gray">
                        {start.toLocaleDateString("en-US", { month: "short" })}
                      </p>
                      <p className="text-2xl font-bold text-code-green">{start.getDate()}</p>
                      <p className="text-xs text-medium-gray">
                        {start.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-light-gray">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-medium-gray">
                        <span>
                          {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          {end && ` – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
                        </span>
                        <span className={`px-1.5 py-0.5 border ${
                          event.location_type === "remote" ? "border-code-blue/30 text-code-blue" :
                          event.location_type === "in-person" ? "border-code-green/30 text-code-green" :
                          "border-purple-400/30 text-purple-400"
                        }`}>
                          {event.location_type === "either" ? "Hybrid" : event.location_type}
                        </span>
                        {event.location && <span>{event.location}</span>}
                      </div>
                      {event.description && (
                        <p className="text-xs text-medium-gray mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {event.endeavor_title && (
                          <Link
                            href={`/endeavors/${event.endeavor_id}`}
                            className="text-xs text-code-blue hover:text-code-green"
                          >
                            {event.endeavor_title}
                          </Link>
                        )}
                        <span className="text-xs text-medium-gray">
                          by {event.creator_name}
                        </span>
                        <span className="text-xs text-medium-gray">
                          {Number(event.attendee_count)} going
                          {event.max_attendees && ` / ${event.max_attendees}`}
                        </span>
                      </div>
                    </div>

                    {/* RSVP buttons */}
                    {!isPast && (
                      <div className="shrink-0 flex flex-col gap-1">
                        <button
                          onClick={() => rsvp(event.id, "going")}
                          className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
                        >
                          Going
                        </button>
                        <button
                          onClick={() => rsvp(event.id, "maybe")}
                          className="px-3 py-1 text-xs border border-medium-gray/30 text-medium-gray hover:border-yellow-400/30 hover:text-yellow-400 transition-colors"
                        >
                          Maybe
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Meeting URL */}
                  {event.meeting_url && !isPast && (
                    <div className="mt-3 pt-3 border-t border-medium-gray/10">
                      <a
                        href={event.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-code-blue hover:text-code-green"
                      >
                        Join meeting &rarr;
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
