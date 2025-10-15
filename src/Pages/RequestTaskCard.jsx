import { useState, useEffect, useRef } from "react";

function RequestTaskCard({ variant = "default" }) {
  const [formData, setFormData] = useState({
    description: "",
    category: "",
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

  const categoryExamples = {
    grocery:
      "Pick up groceries from Big Bazaar, including milk, bread, vegetables, and fruits",
    delivery: "Collect a package from the courier office and deliver to my home",
    "pet-care": "Walk my Golden Retriever for 30 minutes in the nearby park",
    household: "Fix a leaky kitchen faucet and replace the bathroom light bulb",
    personal: "Stand in queue at the bank to submit documents and get a receipt",
    transport: "Airport pickup from Terminal 2 to Bandra with 2 suitcases",
    other: "Help organize a surprise birthday party setup",
  };

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "info" });
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "budget") {
      let budgetValue = parseInt(value, 10) || 50;
      if (budgetValue > 9999) budgetValue = 9999;
      if (budgetValue < 50) budgetValue = 50;

      setFormData((prev) => ({
        ...prev,
        [name]: budgetValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Initialize map
  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return;

    // Default to Mumbai coordinates
    const defaultLocation = { lat: 19.0760, lng: 72.8777 };
    
    // Using Leaflet for the map (free, no API key needed)
    if (window.L) {
      const map = window.L.map(mapRef.current).setView([defaultLocation.lat, defaultLocation.lng], 13);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      let marker = null;

      map.on('click', async (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Remove previous marker
        if (marker) {
          map.removeLayer(marker);
        }
        
        // Add new marker
        marker = window.L.marker([lat, lng]).addTo(map);
        
        setSelectedCoords({ lat, lng });
        
        // Try to get address from coordinates
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
          const data = await response.json();
          
          if (data.display_name) {
            const address = data.display_name.split(',').slice(0, 3).join(', ');
            setFormData(prev => ({ ...prev, location: address }));
            marker.bindPopup(address).openPopup();
          }
        } catch (error) {
          console.error('Error getting address:', error);
        }
      });

      mapInstance.current = map;
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert("Geolocation is not supported by this browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 16);
          
          const marker = window.L.marker([lat, lng]).addTo(mapInstance.current);
          marker.bindPopup("Your current location").openPopup();
          
          setSelectedCoords({ lat, lng });
          setFormData(prev => ({ ...prev, location: "Your current location" }));
        }
      },
      (error) => {
        showAlert("Unable to get your location", "error");
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.description || !formData.category || !formData.location || !formData.urgency) {
      showAlert("Please fill in all required fields", "error");
      return;
    }

    if (formData.description.length < 10) {
      showAlert("Please provide a more detailed description of your task", "error");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(true);
      setFormData({
        description: "",
        category: "",
        location: "",
        urgency: "",
        budget: 200,
      });
      setSelectedCoords(null);
      setShowMap(false);
    }, 2000);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
        setShowMap(false);
      }
      if (e.ctrlKey && e.key === "t") {
        e.preventDefault();
        document.getElementById("taskDescription")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load Leaflet when map is shown
  useEffect(() => {
    if (showMap && !window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
      script.onload = () => {
        setTimeout(initMap, 100);
      };
      document.head.appendChild(script);
    } else if (showMap && window.L) {
      setTimeout(initMap, 100);
    }
  }, [showMap]);

  const fillPercent = Math.round(((formData.budget - 50) / (9999 - 50)) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div
        className={`w-full ${
          variant === "dashboard"
            ? "max-w-3xl transform scale-100"
            : "max-w-md transform scale-95"
        } origin-top-right`}
      >
        {/* Alert */}
        {alert.show && (
          <div
            className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium max-w-md transition-all duration-300 ${
              alert.type === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {alert.message}
          </div>
        )}

        {/* Success Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Task Submitted Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                We're finding the best helpers in your area. You'll receive notifications shortly.
              </p>
              <button
                onClick={closeModal}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-10 relative">
          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Request a task</h2>
            <p className="text-gray-600 text-lg">Tell us what you need help with</p>
          </div>

          {/* Form */}
          <div className="space-y-8">
            {/* Task Description */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                What do you need help with?
              </label>
              <textarea
                id="taskDescription"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 text-base"
                placeholder={
                  formData.category && categoryExamples[formData.category]
                    ? "e.g., ${categoryExamples[formData.category]}"
                    : "e.g., Pick up groceries from Big Bazaar, walk my dog for 30 minutes..."
                }
                rows="4"
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
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 appearance-none cursor-pointer text-base"
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


                  
            {/* Location with Map */}
           <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">Address</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 text-base"
              placeholder="Enter Building No, Room No"
              required
            />
          </div>


            {/* Location with Map */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">Your location</label>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 text-base"
                    placeholder="Enter your area or full address"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="px-4 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                {showMap && (
                  <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
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
                    <div 
                      ref={mapRef} 
                      className="h-64 rounded-lg overflow-hidden border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Timing */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                When do you need this done?
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 appearance-none cursor-pointer text-base"
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
              <div className="bg-blue-50 rounded-xl p-5 mt-3">
                <div className="mb-4">
                  <input
                    type="range"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    min="50"
                    max="9999"
                    step="1"
                    style={{
                      background: "linear-gradient(to right, #3B82F6 0%, #3B82F6 ${fillPercent}%, #DBEAFE ${fillPercent}%, #DBEAFE 100%),"
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
                      min="50"
                      max="9999"
                      step="25"
                      className="text-2xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 text-center w-24 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-5 font-bold text-xl rounded-xl transition-all duration-200 transform ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-800 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {isSubmitting ? "Finding helpers..." : "Find available helpers"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestTaskCard;