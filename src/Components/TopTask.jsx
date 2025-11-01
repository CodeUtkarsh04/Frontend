// src/components/TopTask.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTasks } from "../context/TasksContext.jsx";

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";

export default function TopTask({ max = 3 }) {
  const { tasks = [], loading, error } = useTasks();
  console.log("TopTask — tasks from context:", tasks, " loading:", loading, " error:", error);


  // debug if you need — uncomment to inspect
  // console.log("TopTask tasks:", tasks);
  const STATUS_WANTED = ["available", "pending", "accepted", "ongoing", "in-progress", "in_progress"];

  const topOngoing = (tasks || [])
    .filter((t) => {
      const s = String(t.status || t.statusKey || "").toLowerCase();
      return STATUS_WANTED.some((want) => s.includes(want));
    })
    .slice(0, max);

  if (loading) return <div className="text-gray-500 text-sm">Loading…</div>;
  if (error) return <div className="text-rose-600 text-sm">{error.status === 401 ? "Please sign in." : "Could not load tasks."}</div>;
  if (!topOngoing.length) return <div className="text-gray-500 text-sm">No ongoing tasks yet.</div>;

  return (
    <div className="space-y-3">
      {topOngoing.map((task) => {
        const id = task.id ?? task._id ?? "-";
        const title = task.title || task.name || (task.description ? task.description.slice(0, 40) + (task.description.length > 40 ? "…" : "") : "Untitled Task");
        const type = task.category || (task.categoryId && task.categoryId.name) || "—";
        const statusLabel = task.status || task.statusKey || "—";

        return (
          <Link
            key={id}
            to={`/user/tasks?taskId=${encodeURIComponent(id)}`} // ← opens My Tasks page with query param
            className="block bg-white p-3 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{title}</div>
                <div className="text-xs text-gray-500 mt-1">{type}</div>
              </div>
              <div className="ml-3 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                {statusLabel}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
