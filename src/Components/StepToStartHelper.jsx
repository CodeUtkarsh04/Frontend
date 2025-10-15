import React from "react";

const steps = [
  {
    id: 1,
    title: "Sign Up",
    desc: "Start by creating your free account using just a few basic details. Quick and hassle-free.",
  },
  {
    id: 2,
    title: "Complete Your Profile",
    desc: "Add your personal info and preferences so we can match you with the right tasks.",
  },
  {
    id: 3,
    title: "Accept a Task",
    desc: "Browse through nearby available tasks and pick the ones that suit you best.",
  },
  {
    id: 4,
    title: "Get Paid",
    desc: "Finish the task successfully and receive your payment without delay.",
  },
];

const StepToStartHelper = () => {
  return (
    <section className="py-20 bg-white mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-24">  {/* ⬅️ increased from mb-16 to mb-24 */}
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            How To Get Started as a Helper
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-gray-600"> {/* ⬅️ also increased mt */}
            Becoming a helper is quick and easy. Follow these simple steps.
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

export default StepToStartHelper;

