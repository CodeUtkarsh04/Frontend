import React, { useState } from "react";

const Filters = ({ onFilterChange }) => {
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All Categories");
  const [search, setSearch] = useState("");

  const handleClear = () => {
    setStatus("All");
    setCategory("All Categories");
    setSearch("");
    onFilterChange({ status: "All", category: "All Categories", search: "" });
  };

  const handleChange = (field, value) => {
    const filters = { status, category, search, [field]: value };
    onFilterChange(filters);
    if (field === "status") setStatus(value);
    if (field === "category") setCategory(value);
    if (field === "search") setSearch(value);
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 w-64">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Filters</h2>
        <button
          onClick={handleClear}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear
        </button>
      </div>

      {/* Status */}
      <div className="mb-4">
        <p className="font-medium mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {["All", "Active", "In-Progress", "Completed", "Cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => handleChange("status", s)}
              className={`px-3 py-1 text-sm rounded-lg border ${
                status === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
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
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          <option>All Categories</option>
          <option>Grocery & Shopping</option>
          <option>Pickup & Delivery</option>
          <option>Pet Care</option>
          <option>Household Tasks</option>
          <option>Personal Assistance</option>
          <option>Transportation</option>
          <option>Other</option>
        </select>
      </div>

      {/* Search */}
      <div>
        <p className="font-medium mb-2">Search</p>
        <input
          type="text"
          value={search}
          onChange={(e) => handleChange("search", e.target.value)}
          placeholder="Search tasks..."
          className="w-full border rounded-lg p-2 text-sm"
        />
      </div>
    </div>
  );
};

export default Filters;
