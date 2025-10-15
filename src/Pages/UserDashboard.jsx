import { useState } from "react";
import RequestTaskCard from "../Components/RequestTaskCard.jsx";
import { MapPin, Clock } from "lucide-react";
import { tasksData } from "../data/tasks"; // ✅ Import real tasks

function UserDashboard() {
  // ✅ Slice top 3 tasks from real data
  const topThreeTasks = tasksData.slice(0, 3);

  return (
    <>
      {/* 🌟 Welcome Section */}
      <section className="relative bg-gradient-to-br from-blue-800 to-sky-500 text-white py-20 mt-15">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Welcome back, <span id="welcome-name">User</span>!
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8" id="welcome-message">
            Ready to get things done today?
          </p>
        </div>

        {/* Optional subtle SVG background pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="dots"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="1" className="fill-white opacity-10" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </section>

      {/* 📦 Request Task + Top Tasks Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* 📌 Left: Enlarged Request Task Card */}
          <div className="md:col-span-2">
            <RequestTaskCard variant="default" />
          </div>

          {/* 📋 Right: Top 3 Tasks (Compact View) */}
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Your Top Tasks
            </h3>

            {topThreeTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <h4 className="font-semibold text-gray-800 text-base truncate">
                  {task.title}
                </h4>

                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin size={14} className="mr-1" />
                  <span>{task.location}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" /> {task.date}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${task.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : task.status === "In-Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default UserDashboard;
