// src/Components/AvailableFilters.jsx
import React, { useState, useEffect, useRef } from "react";

const CATEGORY_OPTIONS_FALLBACK = [
  { id: "0", label: "All Categories" },
  { id: "1", label: "Grocery & Shopping" },
  { id: "2", label: "Pickup & Delivery" },
  { id: "3", label: "Pet Care" },
  { id: "4", label: "Household Tasks" },
  { id: "5", label: "Personal Assistance" },
  { id: "6", label: "Transportation" },
  { id: "7", label: "Other" },
];

export default function AvailableFilters({ onFilterChange, apiBase, getToken }) {
  const [status, setStatus] = useState("All");
  const [catId, setCatId] = useState("");        
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(CATEGORY_OPTIONS_FALLBACK);

  const [maxPrice, setMaxPrice] = useState(10000);
  const MIN = 0, MAX = 10000, STEP = 100;            

  useEffect(() => {
    onFilterChange?.({ status, catId, search, maxPrice });
  }, [status, catId, search]);

  const draggingRef = useRef(false);

  const onPriceChange = (e) => {
    setMaxPrice(Number(e.target.value)); 
  };

  const startDrag = () => { draggingRef.current = true; };
  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onFilterChange?.({ status, catId, search, maxPrice });
  };

  return (
    <div className="w-full flex flex-wrap items-center gap-3">
      {/* Category */}
      <select
        value={catId}
        onChange={(e) => setCatId(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tasks…"
        className="border rounded-lg px-3 py-2 text-sm min-w-56"
        type="text"
      />

      {/* Max Price slider (fires on release) */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600 whitespace-nowrap"> Sort by Price</label>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={maxPrice}
          onChange={onPriceChange}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          onMouseUp={endDrag}
          onTouchEnd={endDrag}
          className="w-56"
        />
        <span className="text-sm font-medium">₹ {maxPrice.toLocaleString("en-IN")}</span>
      </div>

      {/* Clear */}
      <button
        onClick={() => { setStatus("All"); setCatId(""); setSearch(""); setMaxPrice(10000); onFilterChange?.({ status:"All", catId:"", search:"", maxPrice:10000 }); }}
        className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
        type="button"
      >
        Clear
      </button>
    </div>
  );
}
