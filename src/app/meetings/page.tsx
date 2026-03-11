"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type Meeting = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  meeting_url: string | null;
  organizer_name: string;
  attendee_count: string;
  status: string;
};

export default function MeetingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meetings?upcoming=${!showPast}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMeetings)
      .finally(() => setLoading(false));
  }, [showPast]);

  async function createMeeting() {
    if (!title.trim() || !startTime) return;
    setSubmitting(true);
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description || undefined,
        startTime,
        endTime: endTime || undefined,
        location: location || undefined,
        meetingUrl: meetingUrl || undefined,
      }),
    });
    if (res.ok) {
      const meeting = await res.json();
      setMeetings((prev) => [{ ...meeting, organizer_name: session!.user.name, attendee_count: "0" }, ...prev]);
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setMeetingUrl("");
      setShowForm(false);
      toast("Meeting scheduled!", "success");
    }
    setSubmitting(false);
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Meetings", href: "/meetings" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Meetings</h1>
            <p className="text-sm text-medium-gray">Schedule and manage team meetings</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
            >
              {showForm ? "Cancel" : "+ Schedule Meeting"}
            </button>
          )}
        </div>

        {/* Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowPast(false)}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              !showPast ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setShowPast(true)}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              showPast ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
            }`}
          >
            Past
          </button>
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// schedule meeting"}</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda (optional)"
              rows={2}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-medium-gray mb-1 block">Start *</label>
                <input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  type="datetime-local"
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-medium-gray mb-1 block">End</label>
                <input
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  type="datetime-local"
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
              <input
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="Meeting link (optional)"
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
            </div>
            <button
              onClick={createMeeting}
              disabled={submitting || !title.trim() || !startTime}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : meetings.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">{showPast ? "No past meetings" : "No upcoming meetings"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => {
              const isUpcoming = new Date(meeting.start_time) > new Date();
              return (
                <div key={meeting.id} className="border border-medium-gray/20 p-4 hover:border-code-green/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-light-gray">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="text-xs text-medium-gray mt-1 line-clamp-2">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-medium-gray">
                        <span className={isUpcoming ? "text-code-green" : "text-medium-gray"}>
                          {formatDateTime(meeting.start_time)}
                        </span>
                        {meeting.end_time && (
                          <span>- {new Date(meeting.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-medium-gray">
                        <span>Organized by {meeting.organizer_name}</span>
                        <span>{meeting.attendee_count} attending</span>
                        {meeting.location && <span>{meeting.location}</span>}
                      </div>
                    </div>
                    {meeting.meeting_url && (
                      <a
                        href={meeting.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3 py-1 text-xs border border-code-blue text-code-blue hover:bg-code-blue hover:text-black transition-colors"
                      >
                        Join
                      </a>
                    )}
                  </div>
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
