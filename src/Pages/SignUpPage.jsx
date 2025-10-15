import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Mail } from 'lucide-react';
import { useNavigate } from "react-router-dom";

// Utils
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validatePassword = (password) => {
  const checks = {
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password),
    noCommon: !/password|123456|qwerty|admin/i.test(password),
    noRepeat: !/(.)\1{2,}/.test(password),
    noSpaces: !/\s/.test(password),
    noSequential: !/(?:abc|abcd|123|1234)/i.test(password)
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score, isValid: score >= 6 };
};

const validateUsername = (username) => {
  return {
    length: username.length >= 3 && username.length <= 20,
    format: /^[a-zA-Z0-9_]+$/.test(username),
    startValid: /^[a-zA-Z]/.test(username),
    isValid:
      username.length >= 3 &&
      username.length <= 20 &&
      /^[a-zA-Z][a-zA-Z0-9_]*$/.test(username),
  };
};

// Password strength indicator
const PasswordStrength = ({ password }) => {
  const validation = useMemo(() => validatePassword(password), [password]);

  const strengthConfig = {
    0: { bg: 'bg-gray-300', text: 'text-gray-600', label: 'No Password', width: 0 },
    1: { bg: 'bg-red-500', text: 'text-red-600', label: 'Very Weak', width: 15 },
    2: { bg: 'bg-red-400', text: 'text-red-500', label: 'Weak', width: 30 },
    3: { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Fair', width: 45 },
    4: { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Good', width: 65 },
    5: { bg: 'bg-lime-500', text: 'text-lime-600', label: 'Strong', width: 80 },
    6: { bg: 'bg-green-500', text: 'text-green-600', label: 'Very Strong', width: 100 },
    7: { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Excellent', width: 100 }
  };

  if (!password) return null;
  const config = strengthConfig[Math.min(validation.score, 7)] || strengthConfig[0];
  const percentage = config.width;

  return (
    <div className="mt-3 p-4 md:p-5 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${config.bg}`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={validation.score}
            aria-valuemin={0}
            aria-valuemax={7}
            aria-label={`Password strength: ${config.label}`}
          />
        </div>
        <span className={`text-xs md:text-sm font-semibold ${config.text} min-w-[80px] text-right`}>
          {config.label}
        </span>
      </div>
    </div>
  );
};

// OTP Input
const OTPInput = ({ otp, setOtp, error }) => {
  const inputRefs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2 md:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => (inputRefs.current[index] = el)}
            type="text"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-11 h-11 md:w-14 md:h-14 text-center text-lg md:text-xl font-semibold border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors ${
              error
                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-400 focus:ring-blue-200'
            }`}
            maxLength={1}
            inputMode="numeric"
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

// Main
export default function SignUpPage({ onSuccess, onError, apiEndpoint = `${BASE_URL}/auth/signup` }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // OTP state
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Validation
  const validation = useMemo(() => {
    const emailValid = validateEmail(formData.email);
    const usernameValid = validateUsername(formData.username);
    const passwordValid = validatePassword(formData.password);
    const confirmPasswordValid =
      formData.password === formData.confirmPassword &&
      formData.confirmPassword.length > 0;

    return {
      email: {
        isValid: emailValid,
        error: !emailValid && touched.email ? 'Please enter a valid email address' : '',
      },
      username: {
        isValid: usernameValid.isValid,
        error:
          !usernameValid.isValid && touched.username
            ? !usernameValid.length
              ? 'Username must be 3-20 characters'
              : !usernameValid.startValid
              ? 'Username must start with a letter'
              : !usernameValid.format
              ? 'Username can only contain letters, numbers, and underscores'
              : ''
            : '',
      },
      password: {
        isValid: passwordValid.isValid,
        error:
          !passwordValid.isValid && touched.password
            ? 'Password must meet all security requirements'
            : '',
        strength: passwordValid,
      },
      confirmPassword: {
        isValid: confirmPasswordValid,
        error:
          !confirmPasswordValid && touched.confirmPassword
            ? formData.confirmPassword.length === 0
              ? 'Please confirm your password'
              : 'Passwords do not match'
            : '',
      },
    };
  }, [formData, touched]);

  const isStep1Valid =
    validation.email.isValid &&
    validation.username.isValid &&
    validation.password.isValid &&
    validation.confirmPassword.isValid;

  // Handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError('');
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Step 1 submit now does the signup POST and then moves to OTP
  const handleStep1Submit = async () => {
    setTouched({ email: true, username: true, password: true, confirmPassword: true });
    if (!isStep1Valid) {
      setSubmitError('Please correct the errors above');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      try { data = await response.json(); } catch (e) {}

      if (!response.ok) {
        throw new Error(
          (data && (data.message || data.errorMessage)) || `Server error: ${response.status}`
        );
      }

      // provisional token (if backend returns)
      const token = data?.accessToken || data?.token;
      if (token) {
        localStorage.setItem('token', token);
        console.log('Signup step success, provisional token saved:', token);
      }

      // go to OTP step
      setStep(2);
      setOtp(Array(6).fill(''));

      // start resend timer
      setResendTimer(60);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.message === 'Failed to fetch'
          ? 'Network error. Please check your connection and try again.'
          : error.message;
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const sendOTP = async () => {
    if (resendTimer > 0) return;

    setIsSubmitting(true);
    try {
      const payload = { email: formData.email.trim(), resendOTP: true };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = null;
      try { data = await response.json(); } catch (e) {}

      if (!response.ok) {
        throw new Error((data && data.message) || `Server returned ${response.status}`);
      }

      setOtp(Array(6).fill(''));
      setSubmitError('');

      setResendTimer(60);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const msg = error.message === 'Failed to fetch'
        ? 'Network error — check backend or CORS'
        : error.message;
      setSubmitError(msg || 'Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final verify
  const handleFinalSubmit = async () => {
    if (otp.join('').length !== 6) {
      setSubmitError('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = { otp: otp.join('') };

      const response = await fetch(
        `${BASE_URL}/auth/verification?email=${encodeURIComponent(formData.email.trim())}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
          body: JSON.stringify(payload),
        }
      );

      const raw = await response.text();
      console.log('Raw backend response:', raw);
      console.log('Response Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        const msg = raw?.trim() || `Server error: ${response.status}`;
        throw new Error(msg);
      }

      let token = (raw || '').trim().replace(/^"(.*)"$/, '$1');
      if (!token) throw new Error('No token found in response.');

      console.log('Verification success, final token saved:', token);

      try {
        const { setAuth, fetchMe } = await import('../auth');
        setAuth({ token });
        await fetchMe();

        onSuccess?.(token);
        navigate('/notice', { replace: true });
      } catch (e) {
        console.error('Error resolving role:', e);
        navigate('/404', { replace: true });
      }
    } catch (error) {
      const errorMessage =
        error.message === 'Failed to fetch'
          ? 'Network error. Please check your connection and try again.'
          : error.message;

      setSubmitError(errorMessage);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 2;
  const progressWidth = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 md:px-6 lg:px-8">
      <div
        className="
          w-full
          max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
          bg-white/95 backdrop-blur
          rounded-2xl
          shadow-lg md:shadow-xl lg:shadow-2xl
          border border-gray-100
          p-6 md:p-8 lg:p-10
        "
      >
        {/* Progress */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs md:text-sm font-medium text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-xs md:text-sm text-gray-500">{Math.round(progressWidth)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 md:space-y-7">
            <div className="text-center mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Create Account</h1>
              <p className="text-gray-600 text-sm md:text-base">Enter your details to sign up</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-3.5 py-2.5 md:px-4 md:py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${
                  validation.email.error
                    ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                }`}
                placeholder="email@example.com"
                disabled={isSubmitting}
              />
              {validation.email.error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validation.email.error}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                className={`w-full px-3.5 py-2.5 md:px-4 md:py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${
                  validation.username.error
                    ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                }`}
                placeholder="Choose a unique username"
                disabled={isSubmitting}
              />
              {validation.username.error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validation.username.error}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-3.5 py-2.5 md:px-4 md:py-3 pr-12 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${
                    validation.password.error
                      ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                  }`}
                  placeholder="Create a strong password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <PasswordStrength password={formData.password} />

              {validation.password.error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validation.password.error}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full px-3.5 py-2.5 md:px-4 md:py-3 pr-12 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${
                    validation.confirmPassword.error
                      ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validation.confirmPassword.error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validation.confirmPassword.error}
                </p>
              )}
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {submitError}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleStep1Submit}
              disabled={isSubmitting}
              className="w-full h-11 md:h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
            >
              Continue to Verification
            </button>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div className="space-y-6 md:space-y-7">
            <div className="text-center mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Verify Your Account</h1>
              <p className="text-gray-600 text-sm md:text-base flex items-center justify-center gap-2">
                <Mail size={16} />
                Code sent to your email
              </p>
            </div>

            <OTPInput otp={otp} setOtp={setOtp} error={submitError.includes('code') ? submitError : ''} />

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend code in <span className="font-medium">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={isSubmitting}
                  className="text-sm md:text-base text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
                >
                  Resend verification code
                </button>
              )}
            </div>

            {submitError && !submitError.includes('code') && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {submitError}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-11 md:h-12 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || otp.join('').length !== 6}
                className="flex-1 h-11 md:h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 md:mt-8 text-center">
          <p className="text-sm md:text-base text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
