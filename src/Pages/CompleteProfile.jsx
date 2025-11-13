import React, { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { getToken } from "../auth";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = {
  endpoints: {
    completeProfile: `${BASE_URL}/profile/create`,
  },
};

const CompleteProfile = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const token = getToken();
  const navigate = useNavigate();
  const dobDMY = dob ? dob.split('-').reverse().join('-') : '';
  const submittingRef = useRef(false);

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
            <input
              type="tel"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setMobile(value);
                setErrors(prev => ({ ...prev, mobile: '' }));
              }}
              maxLength={10}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition ${errors.mobile ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
              placeholder="Enter 10-digit mobile number"
            />
            {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Address <span className="text-red-500">*</span></label>
            <textarea value={address} onChange={(e) => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: '' })); }} rows={3} className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition resize-none ${errors.address ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`} placeholder="Enter your complete address" />
            {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
          </div>

          <button type="submit" disabled={formLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition">
            {formLoading ? 'Completing Profile...' : 'Complete Your Profile'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default CompleteProfile;