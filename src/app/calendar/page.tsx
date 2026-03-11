"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

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
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  // Reset expanded state when navigating months
  useEffect(() => {
    setExpandedEventId(null);
    setSelectedDate(null);
  }, [currentMonth]);

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

  const goToToday = () => {
    setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  };

  const toggleEvent = useCallback((eventId: string, dateKey: string) => {
    setExpandedEventId((prev) => (prev === eventId ? null : eventId));
    setSelectedDate((prev) => (prev === dateKey && expandedEventId === eventId ? null : dateKey));
  }, [expandedEventId]);

  const getEventColor = (ev: CalendarEvent) => {
    if (ev.type === "event") return { bg: "bg-yellow-400/10", text: "text-yellow-400", border: "border-yellow-400/30" };
    if (ev.type === "task") {
      if (ev.status === "done") return { bg: "bg-code-green/10", text: "text-code-green", border: "border-code-green/30" };
      return { bg: "bg-code-blue/10", text: "text-code-blue", border: "border-code-blue/30" };
    }
    // milestone
    if (ev.status === "done") return { bg: "bg-purple-400/10", text: "text-purple-400", border: "border-purple-400/30" };
    return { bg: "bg-purple-400/10", text: "text-purple-400", border: "border-purple-400/30" };
  };

  const getTypeLabel = (type: CalendarEvent["type"]) => {
    if (type === "task") return "Task";
    if (type === "event") return "Event";
    return "Milestone";
  };

  const getTypeIcon = (type: CalendarEvent["type"]) => {
    if (type === "task") return "T";
    if (type === "event") return "E";
    return "M";
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

  // Find the row index where the selected date lives so we can insert the detail panel after that row
  const selectedRowIndex = selectedDate
    ? Math.floor(calendarDays.findIndex((d) => d.date.toISOString().split("T")[0] === selectedDate) / 7)
    : -1;

  // Get the expanded event object
  const expandedEvent = expandedEventId ? events.find((e) => e.id === expandedEventId) : null;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Calendar", href: "/calendar" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Header with month navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
            </h1>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="flex h-8 w-8 items-center justify-center border border-medium-gray/30 text-sm text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
                aria-label="Previous month"
              >
                &larr;
              </button>
              <button
                onClick={goToToday}
                className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="flex h-8 w-8 items-center justify-center border border-medium-gray/30 text-sm text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
                aria-label="Next month"
              >
                &rarr;
              </button>
            </div>
          </div>
          <a
            href="/api/calendar/export"
            download="endeavor-calendar.ics"
            className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
          >
            Export .ics
          </a>
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

            {/* Calendar grid - rendered row by row to allow inline detail expansion */}
            <div className="border border-medium-gray/10">
              {Array.from({ length: 6 }).map((_, rowIdx) => {
                const rowDays = calendarDays.slice(rowIdx * 7, rowIdx * 7 + 7);
                const showDetailAfterRow = selectedRowIndex === rowIdx && expandedEvent;

                return (
                  <div key={rowIdx}>
                    {/* Week row */}
                    <div className="grid grid-cols-7 gap-px bg-medium-gray/10">
                      {rowDays.map(({ date, inMonth }, colIdx) => {
                        const dateKey = date.toISOString().split("T")[0];
                        const dayEvents = eventsByDate[dateKey] || [];
                        const isToday = dateKey === today;
                        const hasExpandedEvent = selectedDate === dateKey && expandedEventId !== null;

                        return (
                          <div
                            key={colIdx}
                            className={`min-h-[100px] bg-black p-2 ${
                              !inMonth ? "opacity-30" : ""
                            } ${isToday ? "ring-1 ring-inset ring-code-green/50" : ""} ${
                              hasExpandedEvent ? "ring-1 ring-inset ring-code-blue/50" : ""
                            }`}
                          >
                            <p className={`mb-1 text-xs ${isToday ? "font-bold text-code-green" : "text-medium-gray"}`}>
                              {date.getDate()}
                            </p>
                            <div className="space-y-0.5">
                              {dayEvents.slice(0, 3).map((ev) => {
                                const colors = getEventColor(ev);
                                const isExpanded = expandedEventId === ev.id;

                                return (
                                  <button
                                    key={ev.id}
                                    onClick={() => toggleEvent(ev.id, dateKey)}
                                    className={`block w-full truncate px-1 py-0.5 text-left text-[10px] leading-tight transition-all ${colors.bg} ${colors.text} ${
                                      ev.status === "done" && (ev.type === "task" || ev.type === "milestone")
                                        ? "line-through"
                                        : ""
                                    } ${isExpanded ? "ring-1 ring-code-blue/50" : "hover:opacity-80"}`}
                                    title={`${ev.type}: ${ev.title} (${ev.endeavorTitle})`}
                                  >
                                    {getTypeIcon(ev.type)} {ev.title}
                                  </button>
                                );
                              })}
                              {dayEvents.length > 3 && (
                                <button
                                  onClick={() => {
                                    // Expand first hidden event to reveal the detail panel for this date
                                    const nextEvent = dayEvents[3];
                                    if (nextEvent) toggleEvent(nextEvent.id, dateKey);
                                  }}
                                  className="text-[9px] text-medium-gray hover:text-code-green transition-colors cursor-pointer"
                                >
                                  +{dayEvents.length - 3} more
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Inline event detail panel - shown below the row containing the selected event */}
                    {showDetailAfterRow && expandedEvent && (
                      <div className="border-x border-b border-medium-gray/10 bg-black">
                        <div className="px-4 py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {/* Type badge */}
                              <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center border text-sm font-bold ${
                                  getEventColor(expandedEvent).border
                                } ${getEventColor(expandedEvent).text}`}
                              >
                                {getTypeIcon(expandedEvent.type)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${getEventColor(expandedEvent).text}`}>
                                    {getTypeLabel(expandedEvent.type)}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 border ${
                                    expandedEvent.status === "done"
                                      ? "border-code-green/30 text-code-green"
                                      : "border-medium-gray/30 text-medium-gray"
                                  }`}>
                                    {expandedEvent.status}
                                  </span>
                                </div>
                                <h3 className={`text-sm font-semibold ${
                                  expandedEvent.status === "done" ? "line-through text-medium-gray" : "text-light-gray"
                                }`}>
                                  {expandedEvent.title}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-medium-gray">
                                  <span>
                                    Endeavor:{" "}
                                    <Link
                                      href={`/endeavors/${expandedEvent.endeavorId}/dashboard`}
                                      className="text-code-blue hover:text-code-green transition-colors"
                                    >
                                      {expandedEvent.endeavorTitle}
                                    </Link>
                                  </span>
                                  <span>
                                    Date:{" "}
                                    <span className="text-light-gray">
                                      {new Date(expandedEvent.date).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </span>
                                  <span>{formatTimeAgo(expandedEvent.date)}</span>
                                </div>

                                {/* Show all events for the selected date if there are more */}
                                {selectedDate && eventsByDate[selectedDate] && eventsByDate[selectedDate].length > 1 && (
                                  <div className="mt-3 pt-3 border-t border-medium-gray/10">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-medium-gray mb-2">
                                      All events on this date
                                    </p>
                                    <div className="space-y-1">
                                      {eventsByDate[selectedDate].map((ev) => {
                                        const colors = getEventColor(ev);
                                        const isCurrent = ev.id === expandedEventId;
                                        return (
                                          <button
                                            key={ev.id}
                                            onClick={() => toggleEvent(ev.id, selectedDate)}
                                            className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors ${
                                              isCurrent
                                                ? `${colors.bg} ${colors.text}`
                                                : "text-medium-gray hover:text-light-gray"
                                            }`}
                                          >
                                            <span className={`shrink-0 font-bold ${colors.text}`}>
                                              {getTypeIcon(ev.type)}
                                            </span>
                                            <span className={`truncate ${
                                              ev.status === "done" ? "line-through" : ""
                                            }`}>
                                              {ev.title}
                                            </span>
                                            <span className="ml-auto shrink-0 text-[10px] text-medium-gray">
                                              {ev.endeavorTitle}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/endeavors/${expandedEvent.endeavorId}/dashboard`}
                                className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
                              >
                                View Endeavor
                              </Link>
                              <button
                                onClick={() => {
                                  setExpandedEventId(null);
                                  setSelectedDate(null);
                                }}
                                className="flex h-7 w-7 items-center justify-center border border-medium-gray/30 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
                                aria-label="Close details"
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
              <span className="text-medium-gray/50 ml-2">Click an event for details</span>
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
                    .map((ev) => {
                      const colors = getEventColor(ev);
                      const isExpanded = expandedEventId === ev.id;

                      return (
                        <div key={ev.id}>
                          <button
                            onClick={() => {
                              const dateKey = new Date(ev.date).toISOString().split("T")[0];
                              toggleEvent(ev.id, dateKey);
                            }}
                            className={`flex w-full items-center gap-3 border p-3 transition-colors text-left ${
                              isExpanded
                                ? "border-code-blue/30 bg-code-blue/5"
                                : "border-medium-gray/10 hover:border-code-green/30"
                            } group`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center border text-xs font-bold ${colors.border} ${colors.text}`}
                            >
                              {getTypeIcon(ev.type)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-sm transition-colors ${
                                isExpanded ? "text-code-blue" : "group-hover:text-code-green"
                              }`}>
                                {ev.title}
                              </p>
                              <p className="text-xs text-medium-gray truncate">
                                {ev.endeavorTitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs text-medium-gray">
                                {new Date(ev.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className={`text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                                &#9662;
                              </span>
                            </div>
                          </button>

                          {/* Inline expansion for upcoming list */}
                          {isExpanded && (
                            <div className="border-x border-b border-code-blue/20 bg-black px-4 py-3">
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-medium-gray">
                                <span className={`font-semibold uppercase tracking-wider ${colors.text}`}>
                                  {getTypeLabel(ev.type)}
                                </span>
                                <span className={`px-1.5 py-0.5 border ${
                                  ev.status === "done"
                                    ? "border-code-green/30 text-code-green"
                                    : "border-medium-gray/30 text-medium-gray"
                                }`}>
                                  {ev.status}
                                </span>
                                <span>
                                  {new Date(ev.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>{formatTimeAgo(ev.date)}</span>
                              </div>
                              <div className="mt-2">
                                <Link
                                  href={`/endeavors/${ev.endeavorId}/dashboard`}
                                  className="text-xs text-code-blue hover:text-code-green transition-colors"
                                >
                                  Go to {ev.endeavorTitle} &rarr;
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
