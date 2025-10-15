import { useState, useEffect } from "react";

function RequestTaskCardLanding({ variant = "default" }) { // 👈 Added variant prop
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    location: "",
    urgency: "",
    budget: 200,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

  const categoryExamples = {
    grocery: "Pick up groceries from Big Bazaar, including milk, bread, vegetables, and fruits",
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
      let budgetValue = parseInt(value) || 50;
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

  const handleSubmit = async (e) => {
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
    }, 2000);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
      if (e.ctrlKey && e.key === "t") {
        e.preventDefault();
        document.getElementById("taskDescription")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`w-full ${
        variant === "dashboard"
          ? "max-w-3xl transform scale-100" // ✅ Bigger card for dashboard
          : "max-w-md transform scale-95" // ✅ Original size everywhere else
      } origin-top-right mr-2 md:mr-4 lg:mr-6`}
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
                ></path>
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
                  ? `e.g., ${categoryExamples[formData.category]}`
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

          {/* Location */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">Your location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 focus:bg-white transition-all duration-200 text-base"
              placeholder="Enter your area or full address"
              required
            />
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
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                      ((formData.budget - 50) / (9999 - 50)) * 100
                    }%, #DBEAFE ${((formData.budget - 50) / (9999 - 50)) * 100}%, #DBEAFE 100%)`,
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ backgroundColor: isSubmitting ? undefined : "#1e40af" }}
            className={`w-full py-5 font-bold text-xl rounded-xl transition-all duration-200 transform ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {isSubmitting ? "Finding helpers..." : "Find available helpers"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestTaskCardLanding;
