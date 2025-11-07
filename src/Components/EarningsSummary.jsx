// EarningsSummary.jsx
import React from "react";

export default function EarningsSummary({ total = 0, month = 0,  week = 0, daily = 0 }) {
  return (
    <div className="bg-emerald-600 text-white p-8 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h2 className="text-lg font-medium">This Month's Earnings</h2>
          <p className="text-4xl font-bold mt-2">₹{month}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          <div>
            <p className="text-2xl font-semibold">₹{total}</p>
            <p className="text-sm opacity-90">Total Earnings </p>
          </div>
          <div>
            <p className="text-2xl font-semibold">₹{week}</p>
            <p className="text-sm opacity-90">Weekly</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{daily}</p>
            <p className="text-sm opacity-90">Daily</p>
          </div>
        </div>

        <div className="bg-white text-emerald-700 font-semibold px-5 py-2 rounded-lg hover:bg-emerald-50 transition">
          Text
        </div>
      </div>
    </div>
  );
}
