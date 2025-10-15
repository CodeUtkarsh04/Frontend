import React from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, AlarmClockCheck, Handshake } from "lucide-react";

const services = [
  {
    id: 1,
    title: "Earn Your Way",
    desc:
      "Get paid for tasks you complete. Withdraw your earnings weekly. The more tasks you do, the more you earn.",
    icon: DollarSign,
  },
  {
    id: 2,
    title: "Flexible Schedule",
    desc:
      "You are in control. Choose the tasks that fit your schedule. Work in the morning, evening, or on weekends.",
    icon: AlarmClockCheck,
  },
  {
    id: 3,
    title: "Be a Local Hero",
    desc:
      "Make a real difference in your community by helping your neighbors with their daily needs.",
    icon: Handshake,
  },
];

const WhyHelperGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gray-100 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Why become a DailyDone Helper?
          </h2>
          <p className="mt-2 text-xl text-gray-700 mx-auto">
            Enjoy freedom, flexibility, and the satisfaction of helping your community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => navigate("/signup")}
                className="group block focus:outline-none w-full text-left"
                aria-label={`Open ${s.title}`}
              >
                <article
                  className="
                    h-full bg-white rounded-2xl border border-transparent
                    p-8 shadow-md
                    flex flex-col items-center text-center
                    transition transform duration-300 ease-out
                    group-hover:-translate-y-2 group-hover:scale-[1.03]
                    group-hover:shadow-xl
                    group-hover:border-blue-200
                  "
                >
                  {/* Icon */}
                  <div
                    className="
                      h-16 w-16 flex items-center justify-center
                      bg-blue-600 text-white rounded-xl
                      mb-4 drop-shadow
                    "
                  >
                    <Icon size={36} strokeWidth={2.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </article>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyHelperGrid;
