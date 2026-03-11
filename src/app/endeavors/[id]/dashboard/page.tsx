"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { MarkdownText } from "@/components/markdown-text";
import { formatTimeAgo } from "@/lib/time";
import { useToast } from "@/components/toast";
import { Polls } from "@/components/polls";
import { Schedule } from "@/components/schedule";
import { ActivityFeed } from "@/components/activity-feed";

type Discussion = {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorImage: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
};

type SharedLink = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  createdAt: string;
  addedByName: string;
};

type Member = {
  id: string;
  role: string;
  status: string;
  userId: string;
  userName: string;
};

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
};

type Story = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  authorName?: string;
};

type EndeavorInfo = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string | null;
  locationType: string;
  joinType: string;
  costPerPerson: number | null;
  capacity: number | null;
  needs: string[] | null;
  imageUrl: string | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  creatorId: string;
  members: Member[];
  pendingMembers: Member[];
};

type Update = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  authorName: string;
};

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  actorName: string;
  createdAt: string;
};

type Payment = {
  id: string;
  userId: string;
  userName: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
};

type TabId = "overview" | "updates" | "discussion" | "tasks" | "milestones" | "stories" | "links" | "members" | "finances" | "settings";

export default function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [endeavor, setEndeavor] = useState<EndeavorInfo | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Discussion | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [newUpdateTitle, setNewUpdateTitle] = useState("");
  const [newUpdateContent, setNewUpdateContent] = useState("");
  const [newUpdatePinned, setNewUpdatePinned] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");
  const [newStoryPublished, setNewStoryPublished] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMyTasks, setShowMyTasks] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [endRes, discRes, taskRes, linkRes, msRes, storyRes, actRes, updRes, payRes] = await Promise.all([
        fetch(`/api/endeavors/${id}`),
        fetch(`/api/endeavors/${id}/discussions`),
        fetch(`/api/endeavors/${id}/tasks`),
        fetch(`/api/endeavors/${id}/links`),
        fetch(`/api/endeavors/${id}/milestones`),
        fetch(`/api/endeavors/${id}/stories`),
        fetch(`/api/endeavors/${id}/activity`),
        fetch(`/api/endeavors/${id}/updates`),
        fetch(`/api/endeavors/${id}/payments`),
      ]);

      if (endRes.ok) setEndeavor(await endRes.json());
      if (discRes.ok) setDiscussions(await discRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (linkRes.ok) setLinks(await linkRes.json());
      if (msRes.ok) setMilestones(await msRes.json());
      if (storyRes.ok) setStories(await storyRes.json());
      if (actRes.ok) setActivity(await actRes.json());
      if (updRes.ok) setUpdates(await updRes.json());
      if (payRes.ok) setPayments(await payRes.json());
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }
    if (session) fetchData();
  }, [session, isPending, router, fetchData]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/endeavors/${id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, parentId: replyTo?.id }),
      });
      if (res.ok) {
        const msg = await res.json();
        setDiscussions([msg, ...discussions]);
        setNewMessage("");
        setReplyTo(null);
      }
    } finally {
      setSending(false);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const res = await fetch(`/api/endeavors/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskTitle,
        description: newTaskDescription || null,
        assigneeId: newTaskAssignee || null,
        dueDate: newTaskDueDate || null,
      }),
    });
    if (res.ok) {
      const t = await res.json();
      setTasks([...tasks, t]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setNewTaskAssignee("");
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
    }
  }

  async function deleteTask(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) setTasks(tasks.filter((t) => t.id !== taskId));
  }

  async function reassignTask(taskId: string, assigneeId: string | null) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(tasks.map((t) => t.id === taskId ? { ...t, assigneeId: data.assigneeId, assigneeName: data.assigneeName } : t));
    }
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    const res = await fetch(`/api/endeavors/${id}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newLinkTitle, url: newLinkUrl }),
    });
    if (res.ok) {
      const l = await res.json();
      setLinks([l, ...links]);
      setNewLinkTitle("");
      setNewLinkUrl("");
    }
  }

  async function createMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    const res = await fetch(`/api/endeavors/${id}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newMilestoneTitle,
        description: newMilestoneDescription || null,
        targetDate: newMilestoneDate || null,
      }),
    });
    if (res.ok) {
      const m = await res.json();
      setMilestones([...milestones, m]);
      setNewMilestoneTitle("");
      setNewMilestoneDescription("");
      setNewMilestoneDate("");
    }
  }

  async function toggleMilestone(msId: string, completed: boolean) {
    const res = await fetch(`/api/milestones/${msId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMilestones(milestones.map((m) => (m.id === msId ? updated : m)));
    }
  }

  async function deleteMilestone(msId: string) {
    const res = await fetch(`/api/milestones/${msId}`, { method: "DELETE" });
    if (res.ok) setMilestones(milestones.filter((m) => m.id !== msId));
  }

  async function createUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUpdateTitle.trim() || !newUpdateContent.trim()) return;
    const res = await fetch(`/api/endeavors/${id}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newUpdateTitle,
        content: newUpdateContent,
        pinned: newUpdatePinned,
      }),
    });
    if (res.ok) {
      const u = await res.json();
      setUpdates([u, ...updates]);
      setNewUpdateTitle("");
      setNewUpdateContent("");
      setNewUpdatePinned(false);
    }
  }

  async function createStory(e: React.FormEvent) {
    e.preventDefault();
    if (!newStoryTitle.trim() || !newStoryContent.trim()) return;
    const res = await fetch(`/api/endeavors/${id}/stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newStoryTitle,
        content: newStoryContent,
        published: newStoryPublished,
      }),
    });
    if (res.ok) {
      const s = await res.json();
      setStories([s, ...stories]);
      setNewStoryTitle("");
      setNewStoryContent("");
      setNewStoryPublished(false);
    }
  }

  async function deleteLink(linkId: string) {
    const res = await fetch(`/api/links/${linkId}`, { method: "DELETE" });
    if (res.ok) setLinks(links.filter((l) => l.id !== linkId));
  }

  async function deleteDiscussion(discId: string) {
    const res = await fetch(`/api/discussions/${discId}`, { method: "DELETE" });
    if (res.ok) setDiscussions(discussions.filter((d) => d.id !== discId));
  }

  async function toggleStoryPublish(storyId: string, published: boolean) {
    const res = await fetch(`/api/stories/${storyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setStories(stories.map((s) => (s.id === storyId ? { ...s, published: updated.published } : s)));
    }
  }

  async function deleteStory(storyId: string) {
    const res = await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
    if (res.ok) setStories(stories.filter((s) => s.id !== storyId));
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteStatus("Sending...");
    const res = await fetch(`/api/endeavors/${id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    if (res.ok) {
      setInviteStatus("Invite sent!");
      setInviteEmail("");
      setTimeout(() => setInviteStatus(""), 3000);
    } else {
      setInviteStatus("Failed to send invite");
      setTimeout(() => setInviteStatus(""), 3000);
    }
  }

  async function handleMemberAction(memberId: string, action: "approve" | "reject") {
    const res = await fetch(`/api/endeavors/${id}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, action }),
    });
    if (res.ok) fetchData();
  }

  if (loading || isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading dashboard...
      </div>
    );
  }

  if (!endeavor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-medium-gray">
          Endeavor not found or you don&apos;t have access.
        </p>
      </div>
    );
  }

  const isCreator = session?.user?.id === endeavor.creatorId;
  const filteredTasks = showMyTasks
    ? tasks.filter((t) => t.assigneeId === session?.user?.id)
    : tasks;
  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in-progress");
  const doneTasks = filteredTasks.filter((t) => t.status === "done");
  const pendingMilestones = milestones.filter((m) => !m.completed);
  const completedMilestones = milestones.filter((m) => m.completed);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "updates", label: "Updates", count: updates.length },
    { id: "discussion", label: "Discussion" },
    { id: "tasks", label: "Tasks", count: tasks.length },
    { id: "milestones", label: "Milestones", count: milestones.length },
    { id: "stories", label: "Stories", count: stories.length },
    { id: "links", label: "Links", count: links.length },
    { id: "members", label: "Members", count: endeavor.members.length },
    ...(isCreator ? [{ id: "finances" as TabId, label: "Finances" }] : []),
    ...(isCreator ? [{ id: "settings" as TabId, label: "Settings" }] : []),
  ];

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: endeavor.title, href: `/endeavors/${id}` }} />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        {/* Status bar */}
        <div className="mb-4 flex items-center gap-3">
          <span className={`px-2 py-0.5 text-xs font-bold uppercase border ${
            endeavor.status === "open" ? "border-code-green/50 text-code-green" :
            endeavor.status === "in-progress" ? "border-code-blue/50 text-code-blue" :
            endeavor.status === "completed" ? "border-purple-400/50 text-purple-400" :
            endeavor.status === "cancelled" ? "border-red-400/50 text-red-400" :
            "border-medium-gray/50 text-medium-gray"
          }`}>
            {endeavor.status}
          </span>
          <span className="text-xs text-medium-gray">
            {endeavor.members.length} member{endeavor.members.length !== 1 ? "s" : ""}
            {endeavor.capacity ? ` / ${endeavor.capacity} capacity` : ""}
          </span>
          {isCreator && (
            <span className="text-xs text-code-green">Creator</span>
          )}
        </div>

        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                activeTab === tab.id
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
            </button>
          ))}
          <Link
            href={`/endeavors/${id}/chat`}
            className="whitespace-nowrap border border-code-blue/50 px-4 py-2 text-xs font-semibold uppercase text-code-blue transition-colors hover:bg-code-blue/10"
          >
            Chat
          </Link>
        </div>

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="lg:col-span-3 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("discussion")}
                className="border border-medium-gray/30 px-4 py-2 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
              >
                + Post Message
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className="border border-medium-gray/30 px-4 py-2 text-xs text-medium-gray hover:border-code-blue hover:text-code-blue transition-colors"
              >
                + Add Task
              </button>
              <button
                onClick={() => setActiveTab("milestones")}
                className="border border-medium-gray/30 px-4 py-2 text-xs text-medium-gray hover:border-purple-400 hover:text-purple-400 transition-colors"
              >
                + Set Milestone
              </button>
              <Link
                href={`/endeavors/${id}`}
                className="border border-medium-gray/30 px-4 py-2 text-xs text-medium-gray hover:border-code-blue hover:text-code-blue transition-colors"
              >
                View Public Page
              </Link>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/endeavors/${id}/invite-link`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ expiresInDays: 7 }),
                    });
                    if (res.ok) {
                      const inv = await res.json();
                      const url = `${window.location.origin}/invite/${inv.code}`;
                      navigator.clipboard.writeText(url);
                      toast("Invite link copied! Expires in 7 days.");
                    } else {
                      navigator.clipboard.writeText(`${window.location.origin}/endeavors/${id}`);
                      toast("Link copied to clipboard");
                    }
                  } catch {
                    navigator.clipboard.writeText(`${window.location.origin}/endeavors/${id}`);
                    toast("Link copied to clipboard");
                  }
                }}
                className="border border-medium-gray/30 px-4 py-2 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
              >
                Invite Link
              </button>
              {isCreator && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/endeavors/${id}`);
                    toast("Link copied to clipboard");
                  }}
                  className="border border-medium-gray/30 px-4 py-2 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
                >
                  Copy Link
                </button>
              )}
            </div>

            {/* Progress Stats */}
            <div className="lg:col-span-1 space-y-4">
              <div className="border border-medium-gray/30 p-4">
                <p className="mb-1 text-xs uppercase tracking-widest text-medium-gray">Status</p>
                <p className={`text-lg font-bold ${
                  endeavor.status === "open" ? "text-code-green" :
                  endeavor.status === "in-progress" ? "text-code-blue" :
                  endeavor.status === "completed" ? "text-purple-400" :
                  "text-medium-gray"
                }`}>
                  {endeavor.status === "in-progress" ? "In Progress" :
                   endeavor.status.charAt(0).toUpperCase() + endeavor.status.slice(1)}
                </p>
              </div>
              <div className="border border-medium-gray/30 p-4">
                <p className="mb-1 text-xs uppercase tracking-widest text-medium-gray">Crew</p>
                <p className="text-2xl font-bold">{endeavor.members.length}</p>
                <p className="text-xs text-medium-gray">
                  {endeavor.pendingMembers?.length > 0 && `${endeavor.pendingMembers.length} pending`}
                </p>
              </div>
              <div className="border border-medium-gray/30 p-4">
                <p className="mb-1 text-xs uppercase tracking-widest text-medium-gray">Tasks</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-code-green">{doneTasks.length}</p>
                  <p className="text-sm text-medium-gray">/ {tasks.length} complete</p>
                </div>
                {tasks.length > 0 && (
                  <div className="mt-2 h-1.5 w-full bg-medium-gray/30">
                    <div
                      className="h-1.5 bg-code-green transition-all"
                      style={{ width: `${(doneTasks.length / tasks.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="border border-medium-gray/30 p-4">
                <p className="mb-1 text-xs uppercase tracking-widest text-medium-gray">Milestones</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-code-green">{completedMilestones.length}</p>
                  <p className="text-sm text-medium-gray">/ {milestones.length} reached</p>
                </div>
                {milestones.length > 0 && (
                  <div className="mt-2 h-1.5 w-full bg-medium-gray/30">
                    <div
                      className="h-1.5 bg-code-green transition-all"
                      style={{ width: `${(completedMilestones.length / milestones.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming milestones */}
            {pendingMilestones.length > 0 && (
              <div className="lg:col-span-1">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
                  {"// upcoming"}
                </h3>
                <div className="space-y-2">
                  {pendingMilestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="border border-purple-400/20 p-3">
                      <p className="text-sm font-semibold">{m.title}</p>
                      {m.targetDate && (
                        <p className={`mt-1 text-xs ${
                          new Date(m.targetDate) < new Date() ? "text-red-400" : "text-medium-gray"
                        }`}>
                          {new Date(m.targetDate).toLocaleDateString()}
                          {new Date(m.targetDate) < new Date() && " (overdue)"}
                        </p>
                      )}
                    </div>
                  ))}
                  {pendingMilestones.length > 3 && (
                    <button
                      onClick={() => setActiveTab("milestones")}
                      className="text-xs text-purple-400 hover:text-code-green"
                    >
                      +{pendingMilestones.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pinned Updates */}
            {updates.filter((u) => u.pinned).length > 0 && (
              <div className="lg:col-span-2">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-400">
                  {"// pinned"}
                </h3>
                <div className="space-y-2">
                  {updates.filter((u) => u.pinned).map((u) => (
                    <div key={u.id} className="border border-yellow-400/30 bg-yellow-400/5 p-4">
                      <p className="text-sm font-semibold">{u.title}</p>
                      <p className="mt-1 text-xs text-light-gray line-clamp-2">
                        <MarkdownText content={u.content} />
                      </p>
                      <p className="mt-2 text-xs text-medium-gray">
                        {u.authorName} &middot; {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            <div className="lg:col-span-1">
              <Schedule endeavorId={id} />
            </div>

            {/* Polls */}
            <div className="lg:col-span-1">
              <Polls endeavorId={id} />
            </div>

            {/* Activity Timeline */}
            <div className="lg:col-span-2">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// recent activity"}
              </h3>
              {activity.length === 0 ? (
                <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                  No activity yet. Start by posting a discussion or creating a task.
                </div>
              ) : (
                <div className="space-y-0">
                  {activity.map((item, idx) => {
                    const typeIcon: Record<string, string> = {
                      discussion: "D",
                      task: "T",
                      milestone: "M",
                      story: "S",
                      member: "+",
                    };
                    const typeColor: Record<string, string> = {
                      discussion: "border-code-blue text-code-blue",
                      task: "border-yellow-400 text-yellow-400",
                      milestone: "border-purple-400 text-purple-400",
                      story: "border-code-green text-code-green",
                      member: "border-pink-400 text-pink-400",
                    };
                    return (
                      <div key={`${item.type}-${item.id}`} className="flex gap-3 pb-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-7 w-7 items-center justify-center border text-xs font-bold ${typeColor[item.type] || "border-medium-gray text-medium-gray"}`}>
                            {typeIcon[item.type] || "?"}
                          </div>
                          {idx < activity.length - 1 && (
                            <div className="mt-1 w-px flex-1 bg-medium-gray/20" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm">
                            {item.actorName && <span className="font-semibold">{item.actorName} </span>}
                            {item.title}
                          </p>
                          {item.detail && (
                            <p className="mt-0.5 text-xs text-medium-gray">{item.detail}</p>
                          )}
                          <p className="mt-0.5 text-xs text-medium-gray" title={new Date(item.createdAt).toLocaleString()}>
                            {formatTimeAgo(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Updates ── */}
        {activeTab === "updates" && (
          <div>
            {/* Post update (creator only) */}
            {isCreator && (
              <div className="mb-6 border border-medium-gray/20 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// post an update"}
                </h3>
                <form onSubmit={createUpdate}>
                  <input
                    type="text"
                    value={newUpdateTitle}
                    onChange={(e) => setNewUpdateTitle(e.target.value)}
                    placeholder="Update title..."
                    className="mb-2 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                  />
                  <textarea
                    value={newUpdateContent}
                    onChange={(e) => setNewUpdateContent(e.target.value)}
                    rows={4}
                    placeholder="Share what's happening with the endeavor..."
                    className="mb-1 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                  />
                  <p className="mb-2 text-xs text-medium-gray">
                    Supports **bold**, *italic*, `code`, [links](url)
                  </p>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-medium-gray">
                      <input
                        type="checkbox"
                        checked={newUpdatePinned}
                        onChange={(e) => setNewUpdatePinned(e.target.checked)}
                        className="accent-code-green"
                      />
                      Pin this update
                    </label>
                    <button
                      type="submit"
                      disabled={!newUpdateTitle.trim() || !newUpdateContent.trim()}
                      className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                    >
                      Post Update
                    </button>
                  </div>
                </form>
              </div>
            )}

            {updates.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                No updates yet.{isCreator ? " Post one above to keep your crew informed." : ""}
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((u) => (
                  <div key={u.id} className={`border p-5 ${u.pinned ? "border-code-green/50 bg-code-green/5" : "border-medium-gray/20"}`}>
                    {u.pinned && (
                      <p className="mb-2 text-xs font-semibold uppercase text-code-green">Pinned</p>
                    )}
                    <h4 className="mb-1 text-base font-bold">{u.title}</h4>
                    <MarkdownText content={u.content} />
                    <div className="mt-3 flex items-center gap-2 text-xs text-medium-gray">
                      <span>by {u.authorName}</span>
                      <span>&middot;</span>
                      <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Discussion ── */}
        {activeTab === "discussion" && (
          <div>
            <form onSubmit={sendMessage} className="mb-6">
              {replyTo && (
                <div className="mb-2 flex items-center gap-2 border-l-2 border-code-blue pl-3 py-1">
                  <span className="text-xs text-code-blue">
                    Replying to <span className="font-semibold">{replyTo.authorName}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-xs text-medium-gray hover:text-white"
                  >
                    &times;
                  </button>
                </div>
              )}
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : "Write a message to your crew..."}
                className="mb-2 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
              >
                {sending ? "Sending..." : replyTo ? "Reply" : "Send"}
              </button>
            </form>
            {discussions.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {discussions
                  .filter((msg) => !msg.parentId)
                  .map((msg) => {
                    const replies = discussions
                      .filter((r) => r.parentId === msg.id)
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    return (
                      <div key={msg.id}>
                        <DiscussionMessage
                          msg={msg}
                          isOwn={msg.authorId === session?.user?.id}
                          canDelete={msg.authorId === session?.user?.id || isCreator}
                          onDelete={() => deleteDiscussion(msg.id)}
                          onReply={() => setReplyTo(msg)}
                          onEdit={async (content) => {
                            const res = await fetch(`/api/discussions/${msg.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ content }),
                            });
                            if (res.ok) {
                              setDiscussions((prev) =>
                                prev.map((d) => d.id === msg.id ? { ...d, content } : d)
                              );
                            }
                          }}
                        />
                        {replies.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-medium-gray/20 pl-4">
                            {replies.map((reply) => (
                              <DiscussionMessage
                                key={reply.id}
                                msg={reply}
                                isOwn={reply.authorId === session?.user?.id}
                                canDelete={reply.authorId === session?.user?.id || isCreator}
                                onDelete={() => deleteDiscussion(reply.id)}
                                onReply={() => setReplyTo(reply)}
                                onEdit={async (content) => {
                                  const res = await fetch(`/api/discussions/${reply.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ content }),
                                  });
                                  if (res.ok) {
                                    setDiscussions((prev) =>
                                      prev.map((d) => d.id === reply.id ? { ...d, content } : d)
                                    );
                                  }
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── Tasks ── */}
        {activeTab === "tasks" && (
          <div>
            <form onSubmit={createTask} className="mb-6 space-y-2 border border-medium-gray/20 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New task title..."
                  className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="border border-code-green px-4 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <input
                type="text"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border border-medium-gray/30 bg-transparent px-4 py-2 text-sm text-light-gray outline-none focus:border-code-green"
              />
              <div className="flex gap-2">
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">Unassigned</option>
                  {endeavor.members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.userName}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white outline-none"
                  placeholder="Due date"
                />
              </div>
            </form>
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => setShowMyTasks(!showMyTasks)}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  showMyTasks
                    ? "border-code-blue bg-code-blue/10 text-code-blue"
                    : "border-medium-gray/30 text-medium-gray hover:text-code-blue"
                }`}
              >
                {showMyTasks ? "My Tasks" : "All Tasks"}
              </button>
              <span className="text-xs text-medium-gray">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                {showMyTasks && ` assigned to you`}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <TaskColumn title="To Do" tasks={todoTasks} color="medium-gray" onStatusChange={updateTaskStatus} onDelete={deleteTask} members={endeavor?.members || []} onReassign={reassignTask} />
              <TaskColumn title="In Progress" tasks={inProgressTasks} color="code-blue" onStatusChange={updateTaskStatus} onDelete={deleteTask} members={endeavor?.members || []} onReassign={reassignTask} />
              <TaskColumn title="Done" tasks={doneTasks} color="code-green" onStatusChange={updateTaskStatus} onDelete={deleteTask} members={endeavor?.members || []} onReassign={reassignTask} />
            </div>
          </div>
        )}

        {/* ── Milestones ── */}
        {activeTab === "milestones" && (
          <div>
            <form onSubmit={createMilestone} className="mb-6 space-y-2 border border-medium-gray/20 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="New milestone..."
                  className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                />
                <button
                  type="submit"
                  disabled={!newMilestoneTitle.trim()}
                  className="border border-code-green px-4 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <input
                type="text"
                value={newMilestoneDescription}
                onChange={(e) => setNewMilestoneDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border border-medium-gray/30 bg-transparent px-4 py-2 text-sm text-light-gray outline-none focus:border-code-green"
              />
              <input
                type="date"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white outline-none"
              />
            </form>

            {pendingMilestones.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-blue">
                  {"// upcoming"}
                </h3>
                <div className="space-y-2">
                  {pendingMilestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between border border-medium-gray/20 p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleMilestone(m.id, true)}
                          className="flex h-5 w-5 items-center justify-center border border-medium-gray/50 text-xs hover:border-code-green hover:text-code-green"
                        />
                        <div>
                          <p className="text-sm font-semibold">{m.title}</p>
                          {m.description && <p className="text-xs text-medium-gray">{m.description}</p>}
                          {m.targetDate && (
                            <p className="text-xs text-code-blue">
                              Target: {new Date(m.targetDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMilestone(m.id)}
                        className="text-xs text-medium-gray hover:text-red-400"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedMilestones.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// completed"}
                </h3>
                <div className="space-y-2">
                  {completedMilestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between border border-code-green/20 p-4 opacity-75">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleMilestone(m.id, false)}
                          className="flex h-5 w-5 items-center justify-center border border-code-green bg-code-green text-xs text-black"
                        >
                          &#10003;
                        </button>
                        <div>
                          <p className="text-sm font-semibold line-through">{m.title}</p>
                          {m.completedAt && (
                            <p className="text-xs text-medium-gray">
                              Completed {new Date(m.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMilestone(m.id)}
                        className="text-xs text-medium-gray hover:text-red-400"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {milestones.length === 0 && (
              <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                No milestones yet. Set your first target above.
              </div>
            )}
          </div>
        )}

        {/* ── Stories ── */}
        {activeTab === "stories" && (
          <div>
            <div className="mb-6 border border-medium-gray/20 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// write a story"}
              </h3>
              <form onSubmit={createStory}>
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Story title..."
                  className="mb-2 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                />
                <textarea
                  value={newStoryContent}
                  onChange={(e) => setNewStoryContent(e.target.value)}
                  rows={8}
                  placeholder="Share your experience, lessons learned, highlights..."
                  className="mb-1 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                />
                <p className="mb-2 text-xs text-medium-gray">
                  Supports **bold**, *italic*, `code`, [links](url), and ## headings
                </p>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-medium-gray">
                    <input
                      type="checkbox"
                      checked={newStoryPublished}
                      onChange={(e) => setNewStoryPublished(e.target.checked)}
                      className="accent-code-green"
                    />
                    Publish immediately
                  </label>
                  <button
                    type="submit"
                    disabled={!newStoryTitle.trim() || !newStoryContent.trim()}
                    className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                  >
                    {newStoryPublished ? "Publish" : "Save Draft"}
                  </button>
                </div>
              </form>
            </div>

            {stories.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                No stories yet. Document your endeavor experience above.
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((s) => (
                  <div key={s.id} className="border border-medium-gray/20 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{s.title}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStoryPublish(s.id, !s.published)}
                          className={`text-xs ${s.published ? "text-code-green hover:text-yellow-400" : "text-yellow-400 hover:text-code-green"}`}
                        >
                          {s.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => deleteStory(s.id)}
                          className="text-xs text-medium-gray hover:text-red-400"
                        >
                          x
                        </button>
                      </div>
                    </div>
                    <MarkdownText content={s.content} />
                    <div className="mt-2 flex items-center gap-2 text-xs text-medium-gray">
                      {s.authorName && <span>by {s.authorName}</span>}
                      <span>&middot;</span>
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      <span>&middot;</span>
                      <span className={s.published ? "text-code-green" : "text-yellow-400"}>
                        {s.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Links ── */}
        {activeTab === "links" && (
          <div>
            <form onSubmit={addLink} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Link title..."
                className="border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              />
              <input
                type="url"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              />
              <button
                type="submit"
                disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                className="border border-code-green px-4 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
              >
                Add
              </button>
            </form>
            {links.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                No shared links yet. Add one above.
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((l) => (
                  <div key={l.id} className="flex items-start justify-between border border-medium-gray/20 p-4">
                    <div>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-code-blue hover:text-code-green"
                      >
                        {l.title} &rarr;
                      </a>
                      {l.description && (
                        <p className="mt-1 text-xs text-medium-gray">{l.description}</p>
                      )}
                      <p className="mt-1 text-xs text-medium-gray">
                        Added by {l.addedByName} &middot; {new Date(l.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteLink(l.id)}
                      className="text-xs text-medium-gray hover:text-red-400"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Members ── */}
        {activeTab === "members" && (
          <div>
            {/* Invite */}
            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-blue">
                {"// invite someone"}
              </h3>
              <form onSubmit={sendInvite} className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                />
                <button
                  type="submit"
                  disabled={!inviteEmail.trim()}
                  className="border border-code-blue px-4 py-3 text-xs font-bold uppercase text-code-blue transition-colors hover:bg-code-blue hover:text-black disabled:opacity-50"
                >
                  Invite
                </button>
              </form>
              {inviteStatus && (
                <p className="mt-2 text-xs text-code-green">{inviteStatus}</p>
              )}
            </div>

            {/* Pending requests (creator only) */}
            {isCreator && endeavor.pendingMembers && endeavor.pendingMembers.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-400">
                  {"// pending requests"}
                </h3>
                <div className="space-y-2">
                  {endeavor.pendingMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between border border-yellow-400/30 p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center bg-accent text-xs font-bold">
                          {m.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold">{m.userName}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMemberAction(m.id, "approve")}
                          className="border border-code-green px-3 py-1 text-xs text-code-green hover:bg-code-green hover:text-black"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleMemberAction(m.id, "reject")}
                          className="border border-red-500/50 px-3 py-1 text-xs text-red-400 hover:bg-red-500 hover:text-black"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// crew"} ({endeavor.members.length})
            </h3>
            <div className="space-y-2">
              {endeavor.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between border border-medium-gray/20 p-3">
                  <Link
                    href={`/users/${m.userId}`}
                    className="flex items-center gap-3 hover:text-code-green transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center bg-accent text-xs font-bold">
                      {m.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{m.userName}</p>
                      <p className="text-xs text-medium-gray">{m.role}</p>
                    </div>
                  </Link>
                  {isCreator && m.role !== "creator" && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Remove ${m.userName} from this endeavor?`)) return;
                        const res = await fetch(`/api/endeavors/${id}/members/${m.id}`, {
                          method: "DELETE",
                        });
                        if (res.ok) fetchData();
                      }}
                      className="text-xs text-medium-gray hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Leave button (non-creators only) */}
            {!isCreator && (
              <div className="mt-6 border-t border-medium-gray/20 pt-6">
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to leave this endeavor?")) return;
                    const res = await fetch(`/api/endeavors/${id}/leave`, { method: "POST" });
                    if (res.ok) {
                      router.push("/my-endeavors");
                    }
                  }}
                  className="border border-red-500/30 px-4 py-2 text-xs font-bold uppercase text-red-400 transition-colors hover:bg-red-500 hover:text-black"
                >
                  Leave Endeavor
                </button>
              </div>
            )}
          </div>
        )}
        {/* ── Finances (creator only) ── */}
        {activeTab === "finances" && isCreator && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-medium-gray/30 p-5">
                <p className="text-xs uppercase text-medium-gray mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-code-green">
                  ${(payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="border border-medium-gray/30 p-5">
                <p className="text-xs uppercase text-medium-gray mb-1">Join Payments</p>
                <p className="text-2xl font-bold text-code-blue">
                  {payments.filter(p => p.type === "join" && p.status === "completed").length}
                </p>
              </div>
              <div className="border border-medium-gray/30 p-5">
                <p className="text-xs uppercase text-medium-gray mb-1">Donations</p>
                <p className="text-2xl font-bold text-purple-400">
                  ${(payments.filter(p => p.type === "donation" && p.status === "completed").reduce((sum, p) => sum + p.amount, 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Funding progress */}
            {endeavor.fundingEnabled && endeavor.fundingGoal && (
              <div className="border border-medium-gray/30 p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Funding Progress</p>
                  <p className="text-xs text-medium-gray">
                    {Math.round(((endeavor as unknown as { fundingRaised: number }).fundingRaised / endeavor.fundingGoal) * 100)}% of ${endeavor.fundingGoal.toLocaleString()}
                  </p>
                </div>
                <div className="h-2 w-full bg-medium-gray/30">
                  <div
                    className="h-2 bg-code-green transition-all"
                    style={{ width: `${Math.min(100, ((endeavor as unknown as { fundingRaised: number }).fundingRaised / endeavor.fundingGoal) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Transaction list */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-code-green">
                {"// transactions"}
              </h3>
              {payments.length === 0 ? (
                <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                  No transactions yet.
                </div>
              ) : (
                <div className="space-y-1">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border border-medium-gray/20 p-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold ${p.type === "join" ? "text-code-blue" : "text-purple-400"}`}>
                          {p.type === "join" ? "JOIN" : "FUND"}
                        </span>
                        <div>
                          <p className="text-sm">{p.userName}</p>
                          <p className="text-xs text-medium-gray">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-code-green">
                          ${(p.amount / 100).toFixed(2)}
                        </p>
                        <p className={`text-xs ${p.status === "completed" ? "text-code-green" : p.status === "pending" ? "text-yellow-400" : "text-red-400"}`}>
                          {p.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Settings (creator only) ── */}
        {activeTab === "settings" && isCreator && (
          <SettingsTab endeavor={endeavor} endeavorId={id} onUpdate={fetchData} />
        )}
      </main>
    </div>
  );
}

function SettingsTab({
  endeavor,
  endeavorId,
  onUpdate,
}: {
  endeavor: EndeavorInfo;
  endeavorId: string;
  onUpdate: () => void;
}) {
  const [title, setTitle] = useState(endeavor.title);
  const [status, setStatus] = useState(endeavor.status);
  const [description, setDescription] = useState(endeavor.description);
  const [imageUrl, setImageUrl] = useState(endeavor.imageUrl || "");
  const [joinType, setJoinType] = useState(endeavor.joinType);
  const [costPerPerson, setCostPerPerson] = useState(String(endeavor.costPerPerson ?? ""));
  const [capacity, setCapacity] = useState(String(endeavor.capacity ?? ""));
  const [fundingEnabled, setFundingEnabled] = useState(endeavor.fundingEnabled);
  const [fundingGoal, setFundingGoal] = useState(String(endeavor.fundingGoal ?? ""));
  const [needs, setNeeds] = useState<string[]>(endeavor.needs || []);
  const [needsInput, setNeedsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast: settingsToast } = useToast();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/endeavors/${endeavorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        status,
        description,
        imageUrl: imageUrl || null,
        joinType,
        needs,
        costPerPerson: costPerPerson ? Number(costPerPerson) : null,
        capacity: capacity ? Number(capacity) : null,
        fundingEnabled,
        fundingGoal: fundingEnabled && fundingGoal ? Number(fundingGoal) : null,
      }),
    });
    if (res.ok) {
      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-xl">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// endeavor settings"}
      </h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-medium-gray">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-medium-gray">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-medium-gray/50 bg-black px-4 py-3 text-sm text-white outline-none"
          >
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-medium-gray">
            Description
            <span className="ml-2 text-[10px] text-medium-gray/50">Supports **bold**, *italic*, `code`, [links](url)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-medium-gray">Cover Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
            placeholder="https://example.com/image.jpg"
          />
          {imageUrl && (
            <div className="mt-2 overflow-hidden border border-medium-gray/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Cover preview"
                className="h-32 w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs text-medium-gray">Join Type</label>
          <select
            value={joinType}
            onChange={(e) => setJoinType(e.target.value)}
            className="w-full border border-medium-gray/50 bg-black px-4 py-3 text-sm text-white outline-none"
          >
            <option value="open">Open (anyone can join)</option>
            <option value="request">Request (approval required)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-medium-gray">What do you need?</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={needsInput}
              onChange={(e) => setNeedsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = needsInput.trim();
                  if (trimmed && !needs.includes(trimmed)) {
                    setNeeds([...needs, trimmed]);
                    setNeedsInput("");
                  }
                }
              }}
              className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              placeholder="e.g., Videographer, Guide, Funding"
            />
            <button
              type="button"
              onClick={() => {
                const trimmed = needsInput.trim();
                if (trimmed && !needs.includes(trimmed)) {
                  setNeeds([...needs, trimmed]);
                  setNeedsInput("");
                }
              }}
              className="border border-medium-gray/50 px-4 py-3 text-sm text-medium-gray hover:text-code-green"
            >
              Add
            </button>
          </div>
          {needs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {needs.map((need) => (
                <span
                  key={need}
                  className="flex items-center gap-1 bg-white/5 px-2 py-1 text-xs text-light-gray"
                >
                  {need}
                  <button
                    type="button"
                    onClick={() => setNeeds(needs.filter((n) => n !== need))}
                    className="text-medium-gray hover:text-red-400"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-medium-gray">Cost per Person ($)</label>
            <input
              type="number"
              value={costPerPerson}
              onChange={(e) => setCostPerPerson(e.target.value)}
              min="0"
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              placeholder="0 for free"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-medium-gray">Max Participants</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              placeholder="Unlimited"
            />
          </div>
        </div>
        <div className="border border-medium-gray/30 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={fundingEnabled}
              onChange={(e) => setFundingEnabled(e.target.checked)}
              className="h-4 w-4 accent-code-green"
            />
            <span className="text-sm">Enable crowdfunding</span>
          </label>
          {fundingEnabled && (
            <div className="mt-3">
              <label className="mb-1 block text-xs text-medium-gray">Funding Goal ($)</label>
              <input
                type="number"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                min="1"
                className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                placeholder="How much do you need?"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="border border-code-green px-6 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-xs text-code-green">Saved!</span>}
        </div>
      </form>

      <div className="mt-8 border-t border-medium-gray/20 pt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-blue">
          {"// data"}
        </h3>
        <p className="mb-3 text-xs text-medium-gray">
          Export all endeavor data (members, tasks, milestones, discussions, payments).
        </p>
        <div className="flex gap-2">
          <a
            href={`/api/endeavors/${endeavorId}/export`}
            download
            className="inline-block border border-code-blue px-4 py-2 text-xs font-bold uppercase text-code-blue transition-colors hover:bg-code-blue hover:text-black"
          >
            Export JSON
          </a>
          <button
            type="button"
            onClick={async () => {
              const res = await fetch(`/api/endeavors/${endeavorId}/export`);
              if (!res.ok) return;
              const data = await res.json();
              // Convert tasks to CSV
              const rows = [["Type", "Title", "Status", "Date", "Detail"]];
              data.tasks?.forEach((t: { title: string; status: string; createdAt: string; description?: string }) => {
                rows.push(["Task", t.title, t.status, t.createdAt || "", t.description || ""]);
              });
              data.milestones?.forEach((m: { title: string; completed: boolean; targetDate?: string; description?: string }) => {
                rows.push(["Milestone", m.title, m.completed ? "completed" : "pending", m.targetDate || "", m.description || ""]);
              });
              data.members?.forEach((m: { name: string; role: string; joinedAt: string; email: string }) => {
                rows.push(["Member", m.name, m.role, m.joinedAt || "", m.email]);
              });
              const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${data.endeavor?.title || "export"}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="border border-medium-gray/50 px-4 py-2 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-medium-gray/20 pt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// share & invite"}
        </h3>
        <p className="mb-3 text-xs text-medium-gray">
          Share this link to invite people to view and join your endeavor.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={typeof window !== "undefined" ? `${window.location.origin}/endeavors/${endeavorId}` : `/endeavors/${endeavorId}`}
            className="flex-1 border border-medium-gray/30 bg-medium-gray/5 px-4 py-2 text-sm text-light-gray outline-none"
          />
          <button
            onClick={() => {
              const url = `${window.location.origin}/endeavors/${endeavorId}`;
              navigator.clipboard.writeText(url);
              settingsToast("Link copied!");
            }}
            className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
          >
            Copy Link
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-medium-gray/20 pt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">
          {"// danger zone"}
        </h3>
        <p className="mb-3 text-xs text-medium-gray">
          Permanently delete this endeavor and all its data. This cannot be undone.
        </p>
        <DeleteEndeavorButton endeavorId={endeavorId} />
      </div>
    </div>
  );
}

function DeleteEndeavorButton({ endeavorId }: { endeavorId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/feed");
    } else {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="border border-red-500/50 px-4 py-2 text-xs font-bold uppercase text-red-400 transition-colors hover:bg-red-500 hover:text-black"
      >
        Delete Endeavor
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="border border-red-500 bg-red-500 px-4 py-2 text-xs font-bold uppercase text-black disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Confirm Delete"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="px-4 py-2 text-xs text-medium-gray hover:text-white"
      >
        Cancel
      </button>
    </div>
  );
}

function TaskColumn({
  title,
  tasks,
  color,
  onStatusChange,
  onDelete,
  members,
  onReassign,
}: {
  title: string;
  tasks: Task[];
  color: string;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  members: Member[];
  onReassign: (id: string, assigneeId: string | null) => void;
}) {
  const nextStatus: Record<string, string> = {
    todo: "in-progress",
    "in-progress": "done",
    done: "todo",
  };
  const actionLabel: Record<string, string> = {
    todo: "Start \u2192",
    "in-progress": "Complete \u2192",
    done: "Reopen \u2192",
  };

  return (
    <div>
      <h3 className={`mb-3 border-b border-${color}/50 pb-2 text-xs font-semibold uppercase tracking-widest text-${color}`}>
        {title} ({tasks.length})
      </h3>
      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} members={members} onStatusChange={onStatusChange} onDelete={onDelete} onReassign={onReassign} nextStatus={nextStatus} actionLabel={actionLabel} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({
  task: t,
  members,
  onStatusChange,
  onDelete,
  onReassign,
  nextStatus,
  actionLabel,
}: {
  task: Task;
  members: Member[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onReassign: (id: string, assigneeId: string | null) => void;
  nextStatus: Record<string, string>;
  actionLabel: Record<string, string>;
}) {
  const [showAssign, setShowAssign] = useState(false);

  return (
    <div className="border border-medium-gray/20 p-3">
      <div className="mb-1 flex items-start justify-between">
        <p className="text-sm font-semibold">{t.title}</p>
        <button onClick={() => onDelete(t.id)} className="ml-2 flex-shrink-0 text-xs text-medium-gray hover:text-red-400">x</button>
      </div>
      {t.description && <p className="mb-1 text-xs text-light-gray">{t.description}</p>}
      <div className="mb-1 flex items-center gap-2">
        <button
          onClick={() => setShowAssign(!showAssign)}
          className="text-xs text-medium-gray hover:text-code-blue"
        >
          {t.assigneeName ? `→ ${t.assigneeName}` : "assign"}
        </button>
        {t.assigneeId && (
          <button
            onClick={() => onReassign(t.id, null)}
            className="text-xs text-medium-gray hover:text-red-400"
          >
            unassign
          </button>
        )}
      </div>
      {showAssign && (
        <div className="mb-2 flex flex-wrap gap-1">
          {members
            .filter((m) => m.status === "approved")
            .map((m) => (
              <button
                key={m.userId}
                onClick={() => { onReassign(t.id, m.userId); setShowAssign(false); }}
                className={`px-2 py-0.5 text-xs border transition-colors ${
                  m.userId === t.assigneeId
                    ? "border-code-green text-code-green"
                    : "border-medium-gray/30 text-medium-gray hover:border-code-blue hover:text-code-blue"
                }`}
              >
                {m.userName}
              </button>
            ))}
        </div>
      )}
      {t.dueDate && (
        <p className={`mb-1 text-xs ${new Date(t.dueDate) < new Date() && t.status !== "done" ? "text-red-400" : "text-medium-gray"}`}>
          Due {new Date(t.dueDate).toLocaleDateString()}
          {new Date(t.dueDate) < new Date() && t.status !== "done" && " (overdue)"}
        </p>
      )}
      <button
        onClick={() => onStatusChange(t.id, nextStatus[t.status])}
        className="mt-1 text-xs text-code-blue hover:text-code-green"
      >
        {actionLabel[t.status]}
      </button>
    </div>
  );
}

function DiscussionMessage({
  msg,
  isOwn,
  canDelete,
  onDelete,
  onReply,
  onEdit,
}: {
  msg: Discussion;
  isOwn: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onReply: () => void;
  onEdit: (content: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(msg.content);

  async function handleSave() {
    if (!editContent.trim()) return;
    await onEdit(editContent.trim());
    setEditing(false);
  }

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center bg-accent text-xs font-bold">
            {msg.authorName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold">{msg.authorName}</span>
          <span className="text-xs text-medium-gray" title={new Date(msg.createdAt).toLocaleString()}>
            {formatTimeAgo(msg.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReply}
            className="text-xs text-medium-gray hover:text-code-blue"
          >
            reply
          </button>
          {isOwn && !editing && (
            <button
              onClick={() => { setEditContent(msg.content); setEditing(true); }}
              className="text-xs text-medium-gray hover:text-code-blue"
            >
              edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-medium-gray hover:text-red-400"
            >
              x
            </button>
          )}
        </div>
      </div>
      {editing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="mb-2 w-full border border-medium-gray/50 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!editContent.trim()}
              className="border border-code-green px-3 py-1 text-xs text-code-green hover:bg-code-green hover:text-black disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1 text-xs text-medium-gray hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <MarkdownText content={msg.content} />
      )}
    </div>
  );
}
