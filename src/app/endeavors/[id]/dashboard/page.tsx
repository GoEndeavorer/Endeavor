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

type Member = {
  id: string;
  role: string;
  userId: string;
  userName: string;
};

type EndeavorInfo = {
  id: string;
  title: string;
  creatorId: string;
  members: Member[];
};

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
  const [activeTab, setActiveTab] = useState<"discussion" | "tasks">(
    "discussion"
  );
  const [newMessage, setNewMessage] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [endRes, discRes, taskRes] = await Promise.all([
        fetch(`/api/endeavors/${id}`),
        fetch(`/api/endeavors/${id}/discussions`),
        fetch(`/api/endeavors/${id}/tasks`),
      ]);

      if (endRes.ok) setEndeavor(await endRes.json());
      if (discRes.ok) setDiscussions(await discRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
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
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch(`/api/endeavors/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          assigneeId: newTaskAssignee || null,
        }),
      });
      if (res.ok) {
        const t = await res.json();
        setTasks([...tasks, t]);
        setNewTaskTitle("");
        setNewTaskAssignee("");
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
      }
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
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

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              Endeavor
            </Link>
            <span className="text-medium-gray">/</span>
            <Link
              href={`/endeavors/${id}`}
              className="text-sm text-code-blue hover:text-code-green"
            >
              {endeavor.title}
            </Link>
          </div>
          <Link
            href="/feed"
            className="text-sm text-code-blue hover:text-code-green"
          >
            Feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("discussion")}
              className={`border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                activeTab === "discussion"
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              Discussion
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                activeTab === "tasks"
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              Tasks ({tasks.length})
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main content */}
          <div className="lg:col-span-3">
            {activeTab === "discussion" && (
              <div>
                {/* New message form */}
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

                {/* Messages */}
                {discussions.length === 0 ? (
                  <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discussions.map((msg) => (
                      <div
                        key={msg.id}
                        className="border border-medium-gray/20 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center bg-accent text-xs font-bold">
                            {msg.authorName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold">
                            {msg.authorName}
                          </span>
                          <span className="text-xs text-medium-gray">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-light-gray">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tasks" && (
              <div>
                {/* Add task form */}
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
                      <option key={m.userId} value={m.userId}>
                        {m.userName}
                      </option>
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

                {/* Task columns */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Todo */}
                  <div>
                    <h3 className="mb-3 border-b border-medium-gray/30 pb-2 text-xs font-semibold uppercase tracking-widest text-medium-gray">
                      To Do ({todoTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {todoTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          onStatusChange={updateTaskStatus}
                          onDelete={deleteTask}
                        />
                      ))}
                    </div>
                  </div>

                  {/* In Progress */}
                  <div>
                    <h3 className="mb-3 border-b border-code-blue/50 pb-2 text-xs font-semibold uppercase tracking-widest text-code-blue">
                      In Progress ({inProgressTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {inProgressTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          onStatusChange={updateTaskStatus}
                          onDelete={deleteTask}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Done */}
                  <div>
                    <h3 className="mb-3 border-b border-code-green/50 pb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
                      Done ({doneTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {doneTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          onStatusChange={updateTaskStatus}
                          onDelete={deleteTask}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Members */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// crew"}
            </h3>
            <div className="space-y-2">
              {endeavor.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 border border-medium-gray/20 p-3"
                >
                  <div className="flex h-7 w-7 items-center justify-center bg-accent text-xs font-bold">
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
        </div>
      </main>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const nextStatus: Record<string, string> = {
    todo: "in-progress",
    "in-progress": "done",
    done: "todo",
  };

  return (
    <div className="border border-medium-gray/20 p-3">
      <div className="mb-1 flex items-start justify-between">
        <p className="text-sm font-semibold">{task.title}</p>
        <button
          onClick={() => onDelete(task.id)}
          className="text-xs text-medium-gray hover:text-red-400"
        >
          x
        </button>
      </div>
      {task.assigneeName && (
        <p className="mb-1 text-xs text-medium-gray">
          Assigned to {task.assigneeName}
        </p>
      )}
      {task.dueDate && (
        <p className="mb-1 text-xs text-medium-gray">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
      <button
        onClick={() => onStatusChange(task.id, nextStatus[task.status])}
        className="mt-1 text-xs text-code-blue hover:text-code-green"
      >
        {task.status === "todo" && "Start →"}
        {task.status === "in-progress" && "Complete →"}
        {task.status === "done" && "Reopen →"}
      </button>
    </div>
  );
}
