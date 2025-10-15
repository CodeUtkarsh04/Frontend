import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HelperSignUpCard() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate(); // ✅ create navigate instance

  return (
    <div className="min-h-screen flex items-center mt-10">
      {/* Request Card */}
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-2xl border border-gray-100">
        {/* Card Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Ready to start earning?
          </h2>
          <p className="text-gray-600 text-base">
            Sign up today and start receiving task requests.
          </p>
        </div>

        {/* Form */}
        <form id="helperSignUpForm" className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50
                         focus:outline-none focus:border-blue-600 focus:bg-white
                         focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50
                         focus:outline-none focus:border-blue-600 focus:bg-white
                         focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50
                         focus:outline-none focus:border-blue-600 focus:bg-white
                         focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>

          {/* City */}
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">
              City
            </label>
            <input
              type="text"
              placeholder="Enter your city"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50
                         focus:outline-none focus:border-blue-600 focus:bg-white
                         focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="button" 
            onClick={() => navigate("/signup")}
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-900 
                       text-white rounded-lg text-lg font-semibold shadow-md
                       hover:shadow-xl hover:scale-[1.02] transition-transform duration-200"
          >
            Sign up to be a Helper
          </button>
        </form>
      </div>
    </div>
  );
}

export default HelperSignUpCard;