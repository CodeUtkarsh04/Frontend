import React, { useState } from "react";
import TaskCard from "./TaskCard";
import Filters from "./Filters";
import { tasksData } from "../data/tasks"; // ✅ Import tasks from shared data file

const UserTasksPage = () => {
  const [filters, setFilters] = useState({
    status: "All",
    category: "All Categories",
    search: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // ✅ Apply filters
  const filteredTasks = tasksData.filter((task) => {
    const matchesStatus =
      filters.status === "All" ||
      task.status.toLowerCase() === filters.status.toLowerCase();

    const matchesCategory =
      filters.category === "All Categories" ||
      task.category.toLowerCase() === filters.category.toLowerCase();

    const matchesSearch =
      filters.search === "" ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      {/* 📱 Mobile Filters Button */}
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-xl font-bold">My Tasks</h2>
        <button
          onClick={() => setShowFilters(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* 🧰 Sidebar Filters (hidden on mobile) */}
        <div className="hidden md:block w-64 shrink-0">
          <Filters onFilterChange={setFilters} />
        </div>

        {/* 📋 Task Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 flex-1">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="h-full">
                <TaskCard task={task} />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No tasks found.</p>
          )}
        </div>
      </div>

      {/* 📱 Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setShowFilters(false)}
            className="absolute inset-0 bg-black/40"
          ></div>

          {/* Slide-in Filters Panel */}
          <div className="relative bg-white w-80 h-full shadow-xl p-6 z-50">
            <button
              onClick={() => setShowFilters(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
            <Filters onFilterChange={setFilters} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTasksPage;
