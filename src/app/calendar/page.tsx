"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type CalendarEvent = {
  id: string;
  type: "task" | "milestone" | "event";
  title: string;
  date: string;
  status: string;
  endeavorId: string;
  endeavorTitle: string;
};

export default function CalendarPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const start = new Date(currentMonth);
    start.setDate(start.getDate() - 7);
    const end = new Date(currentMonth);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() + 7);

    fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, currentMonth]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; inMonth: boolean }[] = [];

    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        inMonth: false,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), inMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), inMonth: false });
    }

    return days;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      const key = new Date(e.date).toISOString().split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const today = new Date().toISOString().split("T")[0];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Calendar", href: "/calendar" }} />
        <div className="mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">
            <Link href="/login" className="text-code-green hover:underline">Log in</Link> to view your calendar.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Calendar", href: "/calendar" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
          </h1>
          <div className="flex gap-2">
            <a
              href="/api/calendar/export"
              download="endeavor-calendar.ics"
              className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
            >
              Export .ics
            </a>
            <button
              onClick={prevMonth}
              className="border border-medium-gray/30 px-3 py-1.5 text-sm text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
            >
              &larr;
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
              className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="border border-medium-gray/30 px-3 py-1.5 text-sm text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
            >
              &rarr;
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-px bg-medium-gray/10">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-medium-gray/5" />
            ))}
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px mb-px">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2 text-center text-xs font-semibold uppercase text-medium-gray">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-medium-gray/10 border border-medium-gray/10">
              {calendarDays.map(({ date, inMonth }, i) => {
                const dateKey = date.toISOString().split("T")[0];
                const dayEvents = eventsByDate[dateKey] || [];
                const isToday = dateKey === today;

                return (
                  <div
                    key={i}
                    className={`min-h-[100px] bg-black p-2 ${
                      !inMonth ? "opacity-30" : ""
                    } ${isToday ? "ring-1 ring-inset ring-code-green/50" : ""}`}
                  >
                    <p className={`mb-1 text-xs ${isToday ? "font-bold text-code-green" : "text-medium-gray"}`}>
                      {date.getDate()}
                    </p>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <Link
                          key={ev.id}
                          href={`/endeavors/${ev.endeavorId}/dashboard`}
                          className={`block truncate px-1 py-0.5 text-[10px] leading-tight transition-opacity hover:opacity-80 ${
                            ev.type === "event"
                              ? "bg-yellow-400/10 text-yellow-400"
                              : ev.type === "task"
                                ? ev.status === "done"
                                  ? "bg-code-green/10 text-code-green line-through"
                                  : "bg-code-blue/10 text-code-blue"
                                : ev.status === "done"
                                  ? "bg-purple-400/10 text-purple-400 line-through"
                                  : "bg-purple-400/10 text-purple-400"
                          }`}
                          title={`${ev.type}: ${ev.title} (${ev.endeavorTitle})`}
                        >
                          {ev.type === "task" ? "T" : ev.type === "event" ? "E" : "M"} {ev.title}
                        </Link>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[9px] text-medium-gray">
                          +{dayEvents.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-medium-gray">
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 bg-code-blue" />
                <span>Task</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 bg-purple-400" />
                <span>Milestone</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 bg-yellow-400" />
                <span>Event</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 bg-code-green" />
                <span>Done</span>
              </div>
            </div>

            {/* Upcoming events list */}
            {events.filter((e) => new Date(e.date) >= new Date()).length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// upcoming"}
                </h2>
                <div className="space-y-1">
                  {events
                    .filter((e) => new Date(e.date) >= new Date())
                    .slice(0, 10)
                    .map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/endeavors/${ev.endeavorId}/dashboard`}
                        className="flex items-center gap-3 border border-medium-gray/10 p-3 transition-colors hover:border-code-green/30 group"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center border text-xs font-bold ${
                            ev.type === "event"
                              ? "border-yellow-400/30 text-yellow-400"
                              : ev.type === "task"
                                ? "border-code-blue/30 text-code-blue"
                                : "border-purple-400/30 text-purple-400"
                          }`}
                        >
                          {ev.type === "event" ? "E" : ev.type === "task" ? "T" : "M"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm group-hover:text-code-green transition-colors">
                            {ev.title}
                          </p>
                          <p className="text-xs text-medium-gray truncate">
                            {ev.endeavorTitle}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-medium-gray">
                          {new Date(ev.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
