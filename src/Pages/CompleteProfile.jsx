import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Upload, Check } from 'lucide-react';
import { getToken } from "../auth";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = {
  endpoints: {
    sendOTP: `${BASE_URL}/profile/sendSms`,
    verifyOTP: `${BASE_URL}/profile/verifySms`,
    completeProfile: `${BASE_URL}/profile/create`,
  },
};

const CompleteProfile = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [otpMessage, setOtpMessage] = useState({ type: '', text: '' });
  const otpInputs = useRef([]);
  const token = getToken();
  const navigate = useNavigate();
  const dobDMY = dob ? dob.split('-').reverse().join('-') : '';
  const submittingRef = useRef(false);



  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) return 'Name is required';
    if (value.length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should only contain letters';
    return '';
  };

  const validateDOB = (value) => {
    if (!value) return 'Date of birth is required';
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) return 'You must be at least 18 years old';
    if (age > 120) return 'Please enter a valid date of birth';
    return '';
  };

  const validateMobile = (value) => {
    if (!value) return 'Mobile number is required';
    if (!/^\d{10}$/.test(value)) return 'Mobile number must be exactly 10 digits';
    return '';
  };

  // Send OTP
  const handleSendOTP = async () => {
    const mobileError = validateMobile(mobile);
    if (mobileError) {
      setErrors(prev => ({ ...prev, mobile: mobileError }));
      return;
    }

    // Open OTP box immediately
    setShowOtpBox(true);
    setTimer(180);
    setCanResend(false);
    setOtp(['', '', '', '']);
    setOtpMessage({ type: '', text: '' });
    setOtpSending(true);

    try {
      const res = await fetch(
        `${API.endpoints.sendOTP}?phone=${encodeURIComponent(mobile)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      );

      let data;
      try { data = await res.text(); } catch { data = null; }

      if (res.ok) {
        setOtpMessage({ type: 'success', text: data?.message || 'OTP sent successfully!' });
      } else {
        setOtpMessage({ type: 'error', text: data?.message || 'Failed to send OTP' });
      }
    } catch (e) {
      setOtpMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
    } finally {
      setOtpSending(false);
    }
  };



  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (/^\d$/.test(char) && index < 4) newOtp[index] = char;
    });
    setOtp(newOtp);
    otpInputs.current[Math.min(pastedData.length, 3)]?.focus();
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setOtpMessage({ type: 'error', text: 'Please enter complete 4-digit OTP' });
      return;
    }

    setOtpVerifying(true);
    setOtpMessage({ type: '', text: '' });

    try {
      const res = await fetch(
        `${API.endpoints.verifyOTP}?phone=${encodeURIComponent(mobile)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ otp: otpValue })
        }
      );

      const responseText = await res.text();
      if (res.ok) {
        setIsVerified(true);
        setShowOtpBox(false);
        setOtpMessage({ type: 'success', text: responseText || 'Mobile number verified successfully!' });
      } else {
        setOtpMessage({ type: 'error', text: responseText || 'Invalid OTP' });
        setOtp(['', '', '', '']);
        otpInputs.current[0]?.focus();
      }
    }
    catch {
      setOtpMessage({ type: 'error', text: 'Verification failed. Please try again.' });
    } finally {
      setOtpVerifying(false);
    }
  };



  // Resend OTP
  const handleResendOTP = () => {
    if (!canResend) return;
    setOtp(['', '', '', '']);
    setOtpMessage({ type: '', text: '' });
    handleSendOTP();
  };


  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;
    const dobError = validateDOB(dob);
    if (dobError) newErrors.dob = dobError;
    const mobileError = validateMobile(mobile);
    if (mobileError) newErrors.mobile = mobileError;
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!isVerified) newErrors.mobile = 'Please verify your mobile number';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setFormMessage({ type: 'error', text: 'Please fix all errors before submitting' });
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;


    setFormLoading(true);
    setFormMessage({ type: '', text: '' });


    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("dob", dobDMY);
      formData.append("phone", mobile.trim());
      formData.append("address", address.trim());

      const res = await fetch(API.endpoints.completeProfile, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        body: formData,
      });

      // backend sends TEXT
      let message = '';
      try { message = (await res.text()).trim(); } catch { }

      const success = res.status >= 200 && res.status < 300; // counts 201 as success

      if (success) {
        setFormMessage({ type: 'success', text: message || 'Profile completed successfully!' });
        navigate('/user', { replace: true }); // change to '/userdashboard' if that's your actual route
      } else {
        setFormMessage({ type: 'error', text: message || 'Failed to complete profile' });
      }

    } catch (error) {
      setFormMessage({ type: 'error', text: 'Failed to complete profile. Please try again.' });
    } finally {
      setFormLoading(false);
      submittingRef.current = false;
    }

  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Please fill in your details to continue</p>
        </div>

        {formMessage.text && (
          <div className={`mb-6 p-4 rounded-lg ${formMessage.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {formMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }} onBlur={() => { const error = validateName(name); if (error) setErrors(prev => ({ ...prev, name: error })); }} maxLength={50} className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`} placeholder="Enter your full name" />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            <p className="text-gray-500 text-xs mt-1">{name.length}/50 characters</p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Date of Birth <span className="text-red-500">*</span></label>
            <input type="date" value={dob} onChange={(e) => { setDob(e.target.value); setErrors(prev => ({ ...prev, dob: '' })); }} onBlur={() => { const error = validateDOB(dob); if (error) setErrors(prev => ({ ...prev, dob: error })); }} max={new Date().toISOString().split('T')[0]} className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition ${errors.dob ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`} />
            {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Mobile Number <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input type="tel" value={mobile} onChange={(e) => { const value = e.target.value.replace(/\D/g, '').slice(0, 10); setMobile(value); setErrors(prev => ({ ...prev, mobile: '' })); if (isVerified) setIsVerified(false); }} disabled={isVerified} maxLength={10} className={`flex-1 px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition ${isVerified ? 'bg-green-50 border-green-500 opacity-70' : errors.mobile ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`} placeholder="Enter 10-digit mobile number" />
              {!isVerified && (
                <button type="button" onClick={handleSendOTP} disabled={otpSending || mobile.length !== 10} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap">
                  {otpSending ? 'Sending...' : 'Send OTP'}
                </button>
              )}
              {isVerified && (
                <div className="flex items-center px-4 py-3 bg-green-100 rounded-xl">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              )}
            </div>
            {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
          </div>

          {/* INLINE OTP BOX */}
          {showOtpBox && !isVerified && (
            <div className="mt-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Enter the 4-digit OTP sent to <span className="font-semibold">{mobile}</span>
                  </p>
                  <p className={`text-sm font-medium ${timer < 30 ? 'text-red-600' : 'text-blue-700'}`}>
                    {timer > 0 ? `Time remaining: ${formatTime(timer)}` : 'OTP expired'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                  className="px-3 py-2 text-sm rounded-lg border-2 border-blue-600 text-blue-600 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>

              <div className="mt-4 flex gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (otpInputs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                ))}
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={otpVerifying || otp.join('').length !== 4}
                  className="ml-2 px-5 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
                >
                  {otpVerifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {otpMessage.text && (
                <div className={`mt-3 text-sm p-2 rounded-lg ${otpMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {otpMessage.text}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Address <span className="text-red-500">*</span></label>
            <textarea value={address} onChange={(e) => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: '' })); }} rows={3} className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition resize-none ${errors.address ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`} placeholder="Enter your complete address" />
            {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
          </div>

          <button type="submit" disabled={formLoading || !isVerified} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition">
            {formLoading ? 'Completing Profile...' : 'Complete Your Profile'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default CompleteProfile;