"use client";

import { useState } from "react";

type MiniCalendarProps = {
  activeDates?: Set<string>;
  onDateClick?: (date: string) => void;
};

export function MiniCalendar({ activeDates = new Set(), onDateClick }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="border border-medium-gray/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="text-xs text-medium-gray hover:text-code-green">&lt;</button>
        <span className="text-xs font-semibold text-light-gray">{monthName}</span>
        <button onClick={nextMonth} className="text-xs text-medium-gray hover:text-code-green">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-[10px] text-medium-gray py-0.5">{d}</span>
        ))}
        {days.map((day, i) => {
          if (day === null) return <span key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isActive = activeDates.has(dateStr);

          return (
            <button
              key={i}
              onClick={() => onDateClick?.(dateStr)}
              className={`text-[11px] py-0.5 transition-colors ${
                isToday ? "bg-code-green text-black font-bold" :
                isActive ? "text-code-green font-semibold" :
                "text-medium-gray hover:text-light-gray"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
