import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function PrintEndeavorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [endeavorResult, membersResult, tasksResult, milestonesResult] = await Promise.all([
    db.execute(sql`
      SELECT e.*, u.name as creator_name
      FROM endeavor e
      JOIN "user" u ON e.creator_id = u.id
      WHERE e.id = ${id}
      LIMIT 1
    `),
    db.execute(sql`
      SELECT u.name, m.role, m.joined_at
      FROM member m
      JOIN "user" u ON m.user_id = u.id
      WHERE m.endeavor_id = ${id} AND m.status = 'approved'
      ORDER BY m.joined_at ASC
    `),
    db.execute(sql`
      SELECT title, status, priority, due_date
      FROM task
      WHERE endeavor_id = ${id}
      ORDER BY created_at DESC
    `),
    db.execute(sql`
      SELECT title, target_date, completed, completed_at
      FROM milestone
      WHERE endeavor_id = ${id}
      ORDER BY created_at ASC
    `),
  ]);

  const end = endeavorResult.rows[0] as {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    location: string | null;
    location_type: string | null;
    created_at: string;
    creator_name: string;
  } | undefined;

  if (!end) {
    return (
      <html>
        <body style={{ fontFamily: "monospace", padding: 40 }}>
          <p>Endeavor not found.</p>
        </body>
      </html>
    );
  }

  const members = membersResult.rows as { name: string; role: string; joined_at: string }[];
  const tasks = tasksResult.rows as { title: string; status: string; priority: string; due_date: string | null }[];
  const milestones = milestonesResult.rows as { title: string; target_date: string | null; completed: boolean; completed_at: string | null }[];

  return (
    <html>
      <head>
        <title>{end.title} — Endeavor (Print)</title>
        <style>{`
          @media print {
            body { font-size: 11pt; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Fira Code', 'Courier New', monospace;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #000;
            background: #fff;
            line-height: 1.6;
          }
          h1 { font-size: 24px; margin-bottom: 4px; }
          h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-top: 32px; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
          .badge { display: inline-block; border: 1px solid #ccc; padding: 1px 8px; font-size: 10px; text-transform: uppercase; margin-right: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
          th { font-weight: 600; color: #666; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
          .completed { text-decoration: line-through; color: #999; }
          .print-btn { position: fixed; top: 20px; right: 20px; padding: 8px 16px; background: #000; color: #0f0; border: 1px solid #0f0; font-family: monospace; cursor: pointer; font-size: 12px; }
          .print-btn:hover { background: #0f0; color: #000; }
        `}</style>
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('print-btn').addEventListener('click', function() {
              window.print();
            });
          });
        `}} />
        <button id="print-btn" className="no-print print-btn">
          Print / Save PDF
        </button>

        <h1>{end.title}</h1>
        <div className="meta">
          <span className="badge">{end.category}</span>
          <span className="badge">{end.status}</span>
          Created by {end.creator_name} &middot;{" "}
          {new Date(end.created_at).toLocaleDateString()}
        </div>

        <p>{end.description}</p>

        {end.location && (
          <p style={{ fontSize: 12, color: "#666" }}>
            Location: {end.location} ({end.location_type})
          </p>
        )}

        {members.length > 0 && (
          <>
            <h2>Members ({members.length})</h2>
            <table>
              <thead>
                <tr><th>Name</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={i}>
                    <td>{m.name}</td>
                    <td>{m.role}</td>
                    <td>{new Date(m.joined_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tasks.length > 0 && (
          <>
            <h2>Tasks ({tasks.length})</h2>
            <table>
              <thead>
                <tr><th>Title</th><th>Status</th><th>Priority</th><th>Due Date</th></tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr key={i} className={t.status === "completed" ? "completed" : ""}>
                    <td>{t.title}</td>
                    <td>{t.status}</td>
                    <td>{t.priority || "—"}</td>
                    <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {milestones.length > 0 && (
          <>
            <h2>Milestones ({milestones.length})</h2>
            <table>
              <thead>
                <tr><th>Title</th><th>Target</th><th>Status</th></tr>
              </thead>
              <tbody>
                {milestones.map((m, i) => (
                  <tr key={i} className={m.completed ? "completed" : ""}>
                    <td>{m.title}</td>
                    <td>{m.target_date ? new Date(m.target_date).toLocaleDateString() : "—"}</td>
                    <td>{m.completed ? `Completed ${m.completed_at ? new Date(m.completed_at).toLocaleDateString() : ""}` : "In progress"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{ marginTop: 40, borderTop: "1px solid #ddd", paddingTop: 12, fontSize: 10, color: "#999" }}>
          Generated from Endeavor &middot; {new Date().toLocaleDateString()}
        </div>
      </body>
    </html>
  );
}
