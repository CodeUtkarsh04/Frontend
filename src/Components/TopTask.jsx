// components/TopTasks.jsx
import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { useTasks } from "../context/TasksContext.jsx";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "-";

export default function TopTasks({ max = 3 }) {
  const { tasks, loading, error } = useTasks();

  const topOngoing = (tasks || [])
    .filter((t) => {
      const s = String(t.status || t?.statusKey || "").toLowerCase();
      return s.includes("ongoing") || s.includes("progress") || s.includes("in-progress") || s.includes("accepted");
    })
    .slice(0, max);

  if (loading) return <div className="text-gray-500 text-sm">Loading…</div>;
  if (error) return <div className="text-rose-600 text-sm">{error.status === 401 ? "Please sign in." : "Could not load tasks."}</div>;
  if (!topOngoing.length) return <div className="text-gray-500 text-sm">No ongoing tasks yet.</div>;

  return (
    <div className="space-y-3">
      {topOngoing.map((task) => {
        // pick common keys used in your Task shape
        const id = task.id ?? task._id ?? "-";
        const title = task.title || task.name || "Untitled Task";
        const loc = task.location || task?.pickupAddressId?.location || "-";
        const date = formatDate(task.createdAt ?? task.date);
        const statusLabel = task.status || task.statusKey || "—";

        const status = String(statusLabel).toLowerCase();
        const statusClass =
          status.includes("complete")
            ? "bg-green-100 text-green-700"
            : status.includes("progress") || status.includes("ongoing")
            ? "bg-yellow-100 text-yellow-700"
            : "bg-blue-100 text-blue-700";

        return (
          <Link
            key={id}
            to={`/tasks?taskId=${encodeURIComponent(id)}`}
            className="block bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
          >
            <h4 className="font-semibold text-gray-800 text-base truncate">{title}</h4>

            <div className="flex items-center text-sm text-gray-500 mt-2">
              <MapPin size={14} className="mr-1" />
              <span>{loc}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                {date}
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>{statusLabel}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
