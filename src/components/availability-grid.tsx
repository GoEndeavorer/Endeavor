"use client";

import { useState, useEffect, useCallback } from "react";

type Availability = {
  id: string;
  endeavor_id: string;
  user_id: string;
  user_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Map display index (0=Mon) to day_of_week (0=Sun)
const DAY_MAP = [1, 2, 3, 4, 5, 6, 0];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 9am to 9pm

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

function timeToHour(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

export function AvailabilityGrid({ endeavorId }: { endeavorId: string }) {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    day: number;
    hour: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    day: number;
    hour: number;
  } | null>(null);

  const fetchAvailability = useCallback(() => {
    fetch(`/api/endeavors/${endeavorId}/availability`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setAvailability(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [endeavorId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Count how many members are available at a given day/hour
  function getMemberCount(dayIndex: number, hour: number): number {
    const dow = DAY_MAP[dayIndex];
    return availability.filter((a) => {
      if (a.day_of_week !== dow) return false;
      const start = timeToHour(a.start_time);
      const end = timeToHour(a.end_time);
      return hour >= start && hour < end;
    }).length;
  }

  // Get members available at a given day/hour
  function getMembersAt(dayIndex: number, hour: number): string[] {
    const dow = DAY_MAP[dayIndex];
    return availability
      .filter((a) => {
        if (a.day_of_week !== dow) return false;
        const start = timeToHour(a.start_time);
        const end = timeToHour(a.end_time);
        return hour >= start && hour < end;
      })
      .map((a) => a.user_name || "Unknown");
  }

  // Max member count for intensity scaling
  const uniqueMembers = new Set(availability.map((a) => a.user_id)).size;
  const maxCount = Math.max(uniqueMembers, 1);

  function getCellColor(count: number): string {
    if (count === 0) return "bg-medium-gray/5";
    const intensity = count / maxCount;
    if (intensity > 0.75) return "bg-code-green/80";
    if (intensity > 0.5) return "bg-code-green/50";
    if (intensity > 0.25) return "bg-code-green/30";
    return "bg-code-green/15";
  }

  function isInSelection(dayIndex: number, hour: number): boolean {
    if (!selectionStart || !selectionEnd) return false;
    if (dayIndex !== selectionStart.day) return false;
    const minH = Math.min(selectionStart.hour, selectionEnd.hour);
    const maxH = Math.max(selectionStart.hour, selectionEnd.hour);
    return hour >= minH && hour <= maxH;
  }

  function handleMouseDown(dayIndex: number, hour: number) {
    setSelecting(true);
    setSelectionStart({ day: dayIndex, hour });
    setSelectionEnd({ day: dayIndex, hour });
  }

  function handleMouseEnter(dayIndex: number, hour: number) {
    if (!selecting || !selectionStart) return;
    // Only allow vertical selection within the same day
    if (dayIndex === selectionStart.day) {
      setSelectionEnd({ day: dayIndex, hour });
    }
  }

  async function handleMouseUp() {
    if (!selecting || !selectionStart || !selectionEnd) {
      setSelecting(false);
      return;
    }

    setSelecting(false);

    const dayIndex = selectionStart.day;
    const dow = DAY_MAP[dayIndex];
    const minH = Math.min(selectionStart.hour, selectionEnd.hour);
    const maxH = Math.max(selectionStart.hour, selectionEnd.hour) + 1; // +1 because end is exclusive

    const startTime = `${String(minH).padStart(2, "0")}:00`;
    const endTime = `${String(maxH).padStart(2, "0")}:00`;

    setSaving(true);
    setSelectionStart(null);
    setSelectionEnd(null);

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const res = await fetch(`/api/endeavors/${endeavorId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day_of_week: dow,
        start_time: startTime,
        end_time: endTime,
        timezone: tz,
      }),
    });

    if (res.ok) {
      fetchAvailability();
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse bg-medium-gray/10 border border-medium-gray/10"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// team availability"}
        </h3>
        {saving && (
          <span className="text-xs text-medium-gray animate-pulse">
            saving...
          </span>
        )}
      </div>

      <p className="text-xs text-medium-gray mb-3">
        Click and drag to set your available hours. Color intensity shows team
        overlap.
      </p>

      <div
        className="border border-medium-gray/20 overflow-x-auto select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (selecting) {
            handleMouseUp();
          }
        }}
      >
        {/* Header row */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[500px]">
          <div className="p-1.5 text-[10px] text-medium-gray border-b border-r border-medium-gray/20" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-1.5 text-[10px] font-mono font-semibold text-code-blue text-center border-b border-r border-medium-gray/20 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time rows */}
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[500px]"
          >
            <div className="p-1 text-[10px] font-mono text-medium-gray text-right pr-2 border-r border-medium-gray/20 flex items-center justify-end">
              {formatHour(hour)}
            </div>
            {DAYS.map((_, dayIndex) => {
              const count = getMemberCount(dayIndex, hour);
              const members = getMembersAt(dayIndex, hour);
              const inSelection = isInSelection(dayIndex, hour);

              return (
                <div
                  key={dayIndex}
                  className={`
                    h-7 border-b border-r border-medium-gray/10 last:border-r-0 cursor-pointer
                    transition-colors duration-100
                    ${inSelection ? "bg-code-blue/40 ring-1 ring-inset ring-code-blue/60" : getCellColor(count)}
                    hover:ring-1 hover:ring-inset hover:ring-code-green/40
                  `}
                  title={
                    count > 0
                      ? `${members.join(", ")} (${count} available)`
                      : "No one available"
                  }
                  onMouseDown={() => handleMouseDown(dayIndex, hour)}
                  onMouseEnter={() => handleMouseEnter(dayIndex, hour)}
                >
                  {count > 0 && !inSelection && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[9px] font-mono text-code-green/80">
                        {count}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 text-[10px] text-medium-gray">
        <span>less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 bg-medium-gray/5 border border-medium-gray/20" />
          <div className="w-3 h-3 bg-code-green/15" />
          <div className="w-3 h-3 bg-code-green/30" />
          <div className="w-3 h-3 bg-code-green/50" />
          <div className="w-3 h-3 bg-code-green/80" />
        </div>
        <span>more</span>
      </div>

      {/* Member summary */}
      {uniqueMembers > 0 && (
        <div className="mt-3 border-t border-medium-gray/10 pt-2">
          <p className="text-[10px] text-medium-gray mb-1 font-mono">
            {uniqueMembers} member{uniqueMembers !== 1 ? "s" : ""} with
            availability set
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(availability.map((a) => a.user_name))).map(
              (name) => (
                <span
                  key={name}
                  className="text-[10px] px-1.5 py-0.5 border border-medium-gray/20 text-code-blue font-mono"
                >
                  {name || "Unknown"}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
