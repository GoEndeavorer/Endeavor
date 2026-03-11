"use client";

import { useState, useEffect, useCallback } from "react";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  createdByName: string;
};

export function Schedule({ endeavorId }: { endeavorId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const fetchEvents = useCallback(() => {
    fetch(`/api/endeavors/${endeavorId}/schedule`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [endeavorId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async () => {
    if (!title.trim() || !startsAt) return;

    const res = await fetch(`/api/endeavors/${endeavorId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        startsAt,
        endsAt: endsAt || null,
      }),
    });

    if (res.ok) {
      setCreating(false);
      setTitle("");
      setDescription("");
      setLocation("");
      setStartsAt("");
      setEndsAt("");
      fetchEvents();
    }
  };

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startsAt) >= now);
  const past = events.filter((e) => new Date(e.startsAt) < now);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse bg-medium-gray/10 border border-medium-gray/10" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// schedule"}
        </h3>
        <button
          onClick={() => setCreating(!creating)}
          className="text-xs text-medium-gray hover:text-code-green transition-colors"
        >
          {creating ? "Cancel" : "+ New Event"}
        </button>
      </div>

      {creating && (
        <div className="mb-4 border border-medium-gray/20 p-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title..."
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-medium-gray">Starts</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white focus:border-code-green focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-medium-gray">Ends (optional)</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white focus:border-code-green focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={createEvent}
            disabled={!title.trim() || !startsAt}
            className="border border-code-green px-3 py-1 text-xs font-semibold text-code-green hover:bg-code-green/10 disabled:opacity-30"
          >
            Create Event
          </button>
        </div>
      )}

      {events.length === 0 && !creating ? (
        <p className="text-xs text-medium-gray py-4 text-center">
          No events scheduled yet.
        </p>
      ) : (
        <div className="space-y-1">
          {upcoming.length > 0 && (
            <>
              <p className="text-[10px] text-code-green font-semibold uppercase mb-1">Upcoming</p>
              {upcoming.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </>
          )}
          {past.length > 0 && (
            <>
              <p className="mt-3 text-[10px] text-medium-gray font-semibold uppercase mb-1">Past</p>
              {past.slice(0, 3).map((ev) => (
                <EventCard key={ev.id} event={ev} past />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ event: ev, past }: { event: Event; past?: boolean }) {
  const start = new Date(ev.startsAt);
  const end = ev.endsAt ? new Date(ev.endsAt) : null;

  return (
    <div className={`border border-medium-gray/20 p-3 ${past ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{ev.title}</p>
          {ev.description && (
            <p className="mt-0.5 text-xs text-medium-gray line-clamp-1">{ev.description}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-code-blue">
            {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <p className="text-[10px] text-medium-gray">
            {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            {end && ` - ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
          </p>
        </div>
      </div>
      {ev.location && (
        <p className="mt-1 text-[10px] text-medium-gray">{ev.location}</p>
      )}
    </div>
  );
}
