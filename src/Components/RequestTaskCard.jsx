import { useState, useEffect, useRef } from "react";

/* ===== Map-only changes start ===== */
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ proper paths for Vite / React builds
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ✅ Create explicit default icon (Vite-safe)
const defaultMarkerIcon = L.icon({
  iconUrl: new URL(markerIcon, import.meta.url).href,
  iconRetinaUrl: new URL(markerIcon2x, import.meta.url).href,
  shadowUrl: new URL(markerShadow, import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ✅ Force Leaflet to use it globally
L.Marker.prototype.options.icon = defaultMarkerIcon;

console.log("Leaflet icon paths:", defaultMarkerIcon);




function RequestTaskCard({ variant = "default" }) {
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    address: "",
    location: "",
    urgency: "",
    budget: 200,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const categoryExamples = {
    grocery: "Pick up groceries from Big Bazaar, including milk, bread, vegetables, and fruits",
    delivery: "Collect a package from the courier office and deliver to my home",
    "pet-care": "Walk my Golden Retriever for 30 minutes in the nearby park",
    household: "Fix a leaky kitchen faucet and replace the bathroom light bulb",
    personal: "Stand in queue at the bank to submit documents and get a receipt",
    transport: "Airport pickup from Terminal 2 to Bandra with 2 suitcases",
    other: "Help organize a surprise birthday party setup",
  };

  const categoryToNumber = {
    grocery: 1,
    delivery: 2,
    "pet-care": 3,
    household: 4,
    personal: 5,
    transport: 6,
    other: 7,
  };

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "info" }), 4000);
  };

  // budget: allow 0..9999
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "budget") {
      // keep only digits, drop leading zeros (but allow a single 0)
      const cleaned = String(value).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
      let n = cleaned === "" ? 0 : parseInt(cleaned, 10);
      if (n > 9999) n = 9999;
      setFormData((prev) => ({ ...prev, budget: n }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBudgetKeyDown = (e) => {
    // only digits 0-9
    if (!/^[0-9]$/.test(e.key)) return;

    const el = e.currentTarget;
    // when current budget is 0 and caret isn't selecting anything,
    // replace the 0 with the first typed digit
    if (formData.budget === 0 && el.selectionStart === el.selectionEnd) {
      e.preventDefault();
      const next = Number(e.key); // e.g. '5' -> 5
      setFormData((p) => ({ ...p, budget: next }));
    }
  };

  // shared reverse geocode
  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`
      );
      const data = await res.json();
      if (data?.display_name) {
        return data.display_name.split(",").slice(0, 3).join(", ");
      }
    } catch (e) {
      console.error("Reverse geocode failed:", e);
    }
    return null;
  }

  /* ===== Map-only changes start ===== */
  // init leaflet map (once)
  // init leaflet map (once)
  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return;

    const defaultLocation = { lat: 19.076, lng: 72.8777 };
    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [defaultLocation.lat, defaultLocation.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // add a default marker at the center (Mumbai) using the explicit icon
    markerRef.current = L.marker([defaultLocation.lat, defaultLocation.lng], { icon: defaultMarkerIcon }).addTo(map);
    setSelectedCoords({ lat: defaultLocation.lat, lng: defaultLocation.lng });

    // try to populate the location field if empty (non-blocking)
    reverseGeocode(defaultLocation.lat, defaultLocation.lng).then((addr) => {
      if (addr) {
        setFormData((prev) => {
          if (!prev.location) return { ...prev, location: addr };
          return prev;
        });
        try { markerRef.current.bindPopup(addr); } catch { }
      }
    });

    // click handler — replaces marker and reverse-geocodes
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        try { map.removeLayer(markerRef.current); } catch { }
      }

      // add new marker at clicked location
      markerRef.current = L.marker([lat, lng], { icon: defaultMarkerIcon }).addTo(map);

      setSelectedCoords({ lat, lng });

      const address = await reverseGeocode(lat, lng);
      if (address) {
        setFormData((prev) => ({ ...prev, location: address }));
        markerRef.current.bindPopup(address).openPopup();
      } else {
        markerRef.current.bindPopup("Selected location").openPopup();
      }
    });

    mapInstance.current = map;

    // ensure tiles render when shown
    requestAnimationFrame(() => {
      try {
        map.invalidateSize();
      } catch { }
    });
  };

  /* ===== Map-only changes end ===== */

  // get browser location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert("Geolocation is not supported by this browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 16);

          if (markerRef.current) {
            mapInstance.current.removeLayer(markerRef.current);
          }
          /* ===== Map-only change: window.L → L ===== */
          markerRef.current = L.marker([lat, lng], { icon: defaultMarkerIcon }).addTo(mapInstance.current || map);

          const address = await reverseGeocode(lat, lng);

          setSelectedCoords({ lat, lng });
          setFormData((prev) => ({ ...prev, location: address || "Your current location" }));
          markerRef.current.bindPopup(address || "Your current location").openPopup();
        }
      },
      () => showAlert("Unable to get your location", "error"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // submit
  // helper: map UI urgency -> backend values
  const mapUrgency = (u) => (u === "asap" ? "asap" : "today");


  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic checks (adjust as you like)
    if (!formData.description || !formData.category || !formData.address || !formData.location || !formData.urgency) {
      showAlert("Please fill in all required fields", "error");
      return;
    }
    if (formData.description.trim().length < 10) {
      showAlert("Please provide a more detailed description of your task", "error");
      return;
    }

    // === Build payload to match backend exactly ===
    const payload = {
      description: formData.description.trim(),
      price: Number(formData.budget), // map budget -> price
      urgency: mapUrgency(formData.urgency),
      categoryId: {
        id: categoryToNumber[formData.category],
      },
      pickupAddressId: {
        addressLine: formData.address.trim(),
        location: formData.location.trim(),
        latitude: selectedCoords?.lat ?? null,
        longitude: selectedCoords?.lng ?? null,
      },
    };

    const raw = localStorage.getItem("token");
    const token = raw?.replace(/^"(.*)"$/, "$1");
    if (!token) {
      showAlert("Not logged in. Please sign in again.", "error");
      return;
    }

    setIsSubmitting(true);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);

    try {

      const res = await fetch(`${BASE_URL}/errand/addErrand`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If backend wants token *as-is*, do NOT prepend 'Bearer '
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });

      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { }

      console.log("[submit] response", res.status, res.statusText, data || text);

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || `Request failed with ${res.status}`;
        throw new Error(msg);
      }

      // success UI
      setShowModal(true);
      setFormData({
        description: "",
        category: "",
        address: "",
        location: "",
        urgency: "",
        budget: 200,
      });
      setSelectedCoords(null);
      setShowMap(false);
      if (mapInstance.current && markerRef.current) {
        mapInstance.current.removeLayer(markerRef.current);
        markerRef.current = null;
        mapInstance.current.setView([19.076, 72.8777], 13);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        showAlert("Network timeout. Try again.", "error");
      } else {
        console.error("[submit] ❌", err);
        showAlert(err.message || "Failed to submit. Try again!", "error");
      }
    } finally {
      clearTimeout(timer);
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setShowModal(false);

  // hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
        setShowMap(false);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        document.getElementById("taskDescription")?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ===== Map-only changes start ===== */
  // load leaflet when map is toggled on
  useEffect(() => {
    const ensureMap = () => {
      // if we have an instance but it's bound to a different (old) container, drop it
      if (mapInstance.current && mapInstance.current.getContainer() !== mapRef.current) {
        try { mapInstance.current.remove(); } catch { }
        mapInstance.current = null;
        markerRef.current = null;
      }
      if (!mapInstance.current) initMap();
      // make sure tiles recalc once visible
      requestAnimationFrame(() => {
        try { mapInstance.current?.invalidateSize(); } catch { }
      });
    };

    if (showMap) {
      ensureMap();
    } else {
      if (mapInstance.current) {
        try { mapInstance.current.remove(); } catch { }
        mapInstance.current = null;
        markerRef.current = null;
      }
      // tidy up any leftover leaflet id on the DOM node (helps in HMR/dev)
      if (mapRef.current && mapRef.current._leaflet_id) {
        try { delete mapRef.current._leaflet_id; } catch { }
      }
    }
  }, [showMap]);
  /* ===== Map-only changes end ===== */

  // cleanup map on unmount
  useEffect(() => {
    return () => {
      try {
        if (mapInstance.current) mapInstance.current.remove();
      } catch { }
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, []);

  // gradient % for 0..9999
  const fillPercent = Math.round((formData.budget / 9999) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className={`w-full ${variant === "dashboard"
        ? "max-w-full sm:max-w-3xl"
        : "max-w-full sm:max-w-md"
        } origin-top-right`}>



        {alert.show && (
          <div
            className={`fixed top-3 right-3 z-50 px-4 py-3 rounded-lg shadow-md text-white font-medium max-w-md transition-all duration-300 ${alert.type === "error" ? "bg-red-500" : "bg-green-500"
              }`}
          >
            {alert.message}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Task Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">We're finding the best helpers in your area. You'll receive notifications shortly.</p>
              <button
                onClick={closeModal}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl">
          <div className="text-center mb-6 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request a task</h2>
            <p className="text-gray-600 text-sm">Tell us what you need help with</p>

          </div>

          <div className="space-y-6 px-4 pb-6">
            {/* Description */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">What do you need help with?</label>
              <textarea
                id="taskDescription"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-600 text-base" placeholder={
                  formData.category && categoryExamples[formData.category]
                    ? `e.g., ${categoryExamples[formData.category]}`
                    : "e.g., Pick up groceries from Big Bazaar, walk my dog for 30 minutes..."
                }
                rows="3"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-600  focus:bg-white transition-all duration-200 appearance-none cursor-pointer text-base"
                required
              >
                <option value="">Select a category</option>
                <option value="grocery">Grocery & Shopping</option>
                <option value="delivery">Pickup & Delivery</option>
                <option value="pet-care">Pet Care</option>
                <option value="household">Household Tasks</option>
                <option value="personal">Personal Assistance</option>
                <option value="transport">Transportation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-600  focus:bg-white transition-all duration-200 text-base"
                placeholder="Enter Building No, Room No"
                required
              />
            </div>

            {/* Your location (map/manual) */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">Your location</label>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    readOnly
                    // when user focuses or clicks, open the map so they know how to set it
                    onFocus={() => setShowMap(true)}
                    onMouseDown={(e) => {
                      // prevent caret/click selection visual (keeps field focusable for a11y)
                      e.preventDefault();
                      setShowMap(true);
                    }}
                    onPaste={(e) => e.preventDefault()}
                    aria-describedby="location-help"
                    title="Select location from the map (click the pin or use 'Use My Location')"
                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 text-base"
                    placeholder="Select your location from the map"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap((v) => !v)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                <p id="location-help" className="mt-2 text-xs text-gray-500">
                  Select your area on the map. Click the map pin or use “Use My Location”.
                </p>

                {showMap && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-2">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Click on map to select location</span>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        Use My Location
                      </button>
                    </div>
                    {/* ===== Map-only change: added minHeight safety ===== */}
                    <div
                      ref={mapRef}
                      className="w-full h-56 rounded-lg border border-gray-300"
                      style={{ minHeight: 256 }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Timing */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">When do you need this done?</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-600  focus:bg-white transition-all duration-200 appearance-none cursor-pointer text-base"
                required
              >
                <option value="">Select timing</option>
                <option value="asap">ASAP (within 2 hours)</option>
                <option value="today">Today</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">Budget</label>
              <div className="bg-blue-50 rounded-lg p-3 mt-3">
                <div className="mb-4">
                  <input
                    type="range"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    min="0"
                    max="9999"
                    step="1"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${fillPercent}%, #DBEAFE ${fillPercent}%, #DBEAFE 100%)`,
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-blue-600">₹</span>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={handleBudgetKeyDown}
                      min="0"
                      max="9999"
                      step="1"
                      className="text-2xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 text-center w-24 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className={`w-full py-3 text-lg font-semibold rounded-lg transition-all 
                ${isSubmitting ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-700 text-white hover:bg-blue-800"
                }`}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Sending…
                </span>
              ) : (
                "Find available helpers"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestTaskCard;
