// Filters.jsx
import React from "react";

/**
 * Controlled Filters component.
 * Parent must pass `filters` (object) and `onFilterChange(patch)`.
 * Example: onFilterChange({ category: 'grocery' }) -- parent merges patch and resets page.
 */

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "All Categories" },
  { label: "Grocery", value: "grocery" },
  { label: "Pickup & Delivery", value: "delivery" },
  { label: "Pet Care", value: "pet-care" },
  { label: "Household", value: "household" },
  { label: "Personal Assistance", value: "personal" },
  { label: "Transportation", value: "transport" },
  { label: "Other", value: "other" },
];

const STATUS_OPTIONS = ["All", "Active", "In-Progress", "Completed", "Cancelled"];

export default function Filters({ filters = {}, onFilterChange = () => {} }) {
  const status = filters.status ?? "All";
  const category = filters.category ?? "All Categories";
  const search = filters.search ?? "";

  const handleClear = () => {
    onFilterChange({ status: "All", category: "All Categories", search: "", page: 1 });
  };

  const setField = (field, value) => {
    onFilterChange({ [field]: value, page: 1 });
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 w-64">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Filters</h2>
        <button onClick={handleClear} className="text-sm text-blue-600 hover:underline">
          Clear
        </button>
      </div>

      {/* Status */}
      <div className="mb-4">
        <p className="font-medium mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setField("status", s)}
              className={`px-3 py-1 text-sm rounded-lg border ${
                status === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="mb-4">
        <p className="font-medium mb-2">Category</p>
        <select
          value={category}
          onChange={(e) => setField("category", e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div>
        <p className="font-medium mb-2">Search</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setField("search", e.target.value)}
          placeholder="Search tasks..."
          className="w-full border rounded-lg p-2 text-sm"
        />
      </div>
    </div>
  );
}
