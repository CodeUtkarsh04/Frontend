import { AlertTriangle, User, Image as ImageIcon, Mail, Ban, AlertCircle, Scale, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSetupPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleProceed = () => {
    setIsLoading(true);
    try {
      navigate('/setup');
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-sky-500 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/90 rounded-full mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-medium text-white mb-2">Account Created Successfully</h1>
          <p className="text-white/80">Complete your profile setup to continue</p>
        </div>

        {/* Main Warning Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-amber-500">
          {/* Warning Header */}
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-gray-900 font-semibold text-2xl">Profile Setup Requirements</h2>
                <p className="text-gray-600 text-base">Please read carefully before proceeding</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800 text-base">
                  <span className="font-semibold">One-time setup process:</span> This information will be permanent and cannot be changed after confirmation.
                </p>
              </div>
            </div>

            {/* Requirements Section */}
            <div className="space-y-6 mb-6">
              {/* Setup Items */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-14 h-14 bg-white rounded-lg border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">Personal Information</h3>
                      <p className="text-gray-600 text-sm mb-2">Name, phone, and address</p>
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">One-time</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-14 h-14 bg-white rounded-lg border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">Profile Picture</h3>
                      <p className="text-gray-600 text-sm mb-2">Upload during setup</p>
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">One-time</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-14 h-14 bg-white rounded-lg border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">System Information</h3>
                      <p className="text-gray-600 text-sm mb-2">Age and email (automatic)</p>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">System</span>
                    </div>
                  </div>
                </div>

                {/* Warning Items */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-14 h-14 bg-white rounded-lg border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <Ban className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">No Modifications</h3>
                      <p className="text-gray-600 text-sm mb-2">Changes not allowed after setup</p>
                      <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Final</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-14 h-14 bg-white rounded-lg border border-red-300 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-900 text-base mb-1">Account Suspension</h3>
                      <p className="text-red-700 text-base">False information results in ban</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="w-14 h-14 bg-white rounded-lg border border-amber-300 flex items-center justify-center flex-shrink-0">
                      <Scale className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 text-base mb-1">Legal Action</h3>
                      <p className="text-amber-700 text-base">Fraudulent info may be prosecuted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acknowledgment */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                 <label htmlFor="acknowledge" className="flex items-start gap-3 cursor-pointer">                    
                  <input
                    type="checkbox"
                    id="acknowledge"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">I understand and acknowledge</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    I have read the requirements and understand that profile information will be permanent. 
                    I will provide accurate information only.
                  </p>
                </div>
              </label>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Go Back
              </button>
              <button
                onClick={handleProceed}
                disabled={!acknowledged || isLoading}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  acknowledged && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue Setup
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            Questions? <button onClick={() => navigate('/support')} className="text-white hover:underline font-medium">Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  );
}