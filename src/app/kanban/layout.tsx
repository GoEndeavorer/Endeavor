import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kanban Board | Endeavor",
  description: "Visual task management with drag-and-drop kanban boards",
};

export default function KanbanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
