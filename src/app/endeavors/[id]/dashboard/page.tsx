"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Discussion = {
  id: string;
  content: string;
  createdAt: string;
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
  imageUrl: string | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  creatorId: string;
  members: Member[];
  pendingMembers: Member[];
};

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  actorName: string;
  createdAt: string;
};

type TabId = "overview" | "discussion" | "tasks" | "milestones" | "stories" | "links" | "members" | "settings";

export default function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [endeavor, setEndeavor] = useState<EndeavorInfo | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [newMessage, setNewMessage] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");
  const [newStoryPublished, setNewStoryPublished] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [endRes, discRes, taskRes, linkRes, msRes, storyRes, actRes] = await Promise.all([
        fetch(`/api/endeavors/${id}`),
        fetch(`/api/endeavors/${id}/discussions`),
        fetch(`/api/endeavors/${id}/tasks`),
        fetch(`/api/endeavors/${id}/links`),
        fetch(`/api/endeavors/${id}/milestones`),
        fetch(`/api/endeavors/${id}/stories`),
        fetch(`/api/endeavors/${id}/activity`),
      ]);

      if (endRes.ok) setEndeavor(await endRes.json());
      if (discRes.ok) setDiscussions(await discRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (linkRes.ok) setLinks(await linkRes.json());
      if (msRes.ok) setMilestones(await msRes.json());
      if (storyRes.ok) setStories(await storyRes.json());
      if (actRes.ok) setActivity(await actRes.json());
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
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        const msg = await res.json();
        setDiscussions([msg, ...discussions]);
        setNewMessage("");
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
      body: JSON.stringify({ title: newTaskTitle, assigneeId: newTaskAssignee || null }),
    });
    if (res.ok) {
      const t = await res.json();
      setTasks([...tasks, t]);
      setNewTaskTitle("");
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
        targetDate: newMilestoneDate || null,
      }),
    });
    if (res.ok) {
      const m = await res.json();
      setMilestones([...milestones, m]);
      setNewMilestoneTitle("");
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
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const pendingMilestones = milestones.filter((m) => !m.completed);
  const completedMilestones = milestones.filter((m) => m.completed);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "discussion", label: "Discussion" },
    { id: "tasks", label: "Tasks", count: tasks.length },
    { id: "milestones", label: "Milestones", count: milestones.length },
    { id: "stories", label: "Stories", count: stories.length },
    { id: "links", label: "Links", count: links.length },
    { id: "members", label: "Members", count: endeavor.members.length },
    ...(isCreator ? [{ id: "settings" as TabId, label: "Settings" }] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">Endeavor</Link>
            <span className="text-medium-gray">/</span>
            <Link href={`/endeavors/${id}`} className="text-sm text-code-blue hover:text-code-green">
              {endeavor.title}
            </Link>
          </div>
          <Link href="/feed" className="text-sm text-code-blue hover:text-code-green">Feed</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                activeTab === tab.id
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
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
                          <p className="mt-0.5 text-xs text-medium-gray">
                            {new Date(item.createdAt).toLocaleDateString()} at{" "}
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

        {/* ── Discussion ── */}
        {activeTab === "discussion" && (
          <div>
            <form onSubmit={sendMessage} className="mb-6">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                placeholder="Write a message to your crew..."
                className="mb-2 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
            {discussions.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-4">
                {discussions.map((msg) => (
                  <div key={msg.id} className="border border-medium-gray/20 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center bg-accent text-xs font-bold">
                          {msg.authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold">{msg.authorName}</span>
                        <span className="text-xs text-medium-gray">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {msg.authorId === session?.user?.id && (
                        <button
                          onClick={() => deleteDiscussion(msg.id)}
                          className="text-xs text-medium-gray hover:text-red-400"
                        >
                          x
                        </button>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-light-gray">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tasks ── */}
        {activeTab === "tasks" && (
          <div>
            <form onSubmit={createTask} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New task..."
                className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              />
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="border border-medium-gray/50 bg-black px-3 py-3 text-sm text-white outline-none"
              >
                <option value="">Unassigned</option>
                {endeavor.members.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.userName}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="border border-code-green px-4 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
              >
                Add
              </button>
            </form>
            <div className="grid gap-4 md:grid-cols-3">
              <TaskColumn title="To Do" tasks={todoTasks} color="medium-gray" onStatusChange={updateTaskStatus} onDelete={deleteTask} />
              <TaskColumn title="In Progress" tasks={inProgressTasks} color="code-blue" onStatusChange={updateTaskStatus} onDelete={deleteTask} />
              <TaskColumn title="Done" tasks={doneTasks} color="code-green" onStatusChange={updateTaskStatus} onDelete={deleteTask} />
            </div>
          </div>
        )}

        {/* ── Milestones ── */}
        {activeTab === "milestones" && (
          <div>
            <form onSubmit={createMilestone} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="New milestone..."
                className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              />
              <input
                type="date"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
                className="border border-medium-gray/50 bg-black px-3 py-3 text-sm text-white outline-none"
              />
              <button
                type="submit"
                disabled={!newMilestoneTitle.trim()}
                className="border border-code-green px-4 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
              >
                Add
              </button>
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
                  rows={6}
                  placeholder="Share your experience, lessons learned, highlights..."
                  className="mb-2 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                />
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
                    <p className="whitespace-pre-wrap text-sm text-light-gray">{s.content}</p>
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
              {"// crew"}
            </h3>
            <div className="space-y-2">
              {endeavor.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 border border-medium-gray/20 p-3">
                  <div className="flex h-8 w-8 items-center justify-center bg-accent text-xs font-bold">
                    {m.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{m.userName}</p>
                    <p className="text-xs text-medium-gray">{m.role}</p>
                  </div>
                </div>
              ))}
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
  const [status, setStatus] = useState(endeavor.status);
  const [description, setDescription] = useState(endeavor.description);
  const [imageUrl, setImageUrl] = useState(endeavor.imageUrl || "");
  const [joinType, setJoinType] = useState(endeavor.joinType);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/endeavors/${endeavorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, description, imageUrl: imageUrl || null, joinType }),
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
          <label className="mb-1 block text-xs text-medium-gray">Description</label>
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
}: {
  title: string;
  tasks: Task[];
  color: string;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
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
          <div key={t.id} className="border border-medium-gray/20 p-3">
            <div className="mb-1 flex items-start justify-between">
              <p className="text-sm font-semibold">{t.title}</p>
              <button onClick={() => onDelete(t.id)} className="text-xs text-medium-gray hover:text-red-400">x</button>
            </div>
            {t.assigneeName && <p className="mb-1 text-xs text-medium-gray">Assigned to {t.assigneeName}</p>}
            {t.dueDate && <p className="mb-1 text-xs text-medium-gray">Due {new Date(t.dueDate).toLocaleDateString()}</p>}
            <button
              onClick={() => onStatusChange(t.id, nextStatus[t.status])}
              className="mt-1 text-xs text-code-blue hover:text-code-green"
            >
              {actionLabel[t.status]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
