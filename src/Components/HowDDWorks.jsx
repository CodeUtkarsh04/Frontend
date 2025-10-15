import React from "react";

const steps = [
  {
    id: 1,
    title: "Tell us what you need",
    desc: "Describe your task, set your budget, and choose when you need it done. Our smart system will match you with the right helpers.",
  },
  {
    id: 2,
    title: "Get matched instantly",
    desc: "Receive offers from verified helpers nearby within minutes. View their profiles, ratings, and choose who you prefer.",
  },
  {
    id: 3,
    title: "Track and communicate",
    desc: "Stay connected with your helper through our secure chat. Get real-time updates and photos of task progress.",
  },
  {
    id: 4,
    title: "Pay and review",
    desc: "Pay securely through the app when your task is complete. Rate your experience to help build our trusted community.",
  },
];

const HowDDWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-24">  {/* ⬅️ increased from mb-16 to mb-24 */}
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            How DailyDone works
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-gray-600"> {/* ⬅️ also increased mt */}
            Getting help from neighbors is simple, safe, and reliable
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 text-center">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center px-6">
              {/* Number circle */}
              <div className="h-20 w-20 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold shadow-lg mb-8">
                {step.id}
              </div>
              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              {/* Description */}
              <p className="text-base text-gray-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowDDWorks;

