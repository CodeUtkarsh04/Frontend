import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Mail } from 'lucide-react';
import { useNavigate } from "react-router-dom";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
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
const DEFAULT_COMMON = ["password", "123456", "123456789", "qwerty", "abc123", "admin","letmein", "welcome", "iloveyou", "monkey", "dragon", "baseball"];

const validatePassword = (password, commonList = DEFAULT_COMMON) => {
  const raw = String(password || "");        
  const len = raw.length;

  const upper = /[A-Z]/.test(raw);
  const lower = /[a-z]/.test(raw);
  const number = /\d/.test(raw);
  const special = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~`]/.test(raw);
  const noSpaces = !/\s/.test(raw);         
  const noLongRepeat = !/(.)\1{2,}/.test(raw); 
  const noCommon = !commonList.some(c => raw.toLowerCase() === c); 

  const isFullySequential = (str) => {
    if (!str || str.length < 3) return false;
    const norm = str.toLowerCase();
    let asc = true, desc = true;
    for (let i = 1; i < norm.length; i++) {
      const prev = norm.charCodeAt(i - 1);
      const cur = norm.charCodeAt(i);
      if (cur !== prev + 1) asc = false;
      if (cur !== prev - 1) desc = false;
    }
    return asc || desc;
  };

  const isAllSame = (str) => {
    if (!str) return false;
    for (let i = 1; i < str.length; i++) if (str[i] !== str[0]) return false;
    return true;
  };

  const categories = [upper, lower, number, special].filter(Boolean).length;

  const checks = {
    length10plus: len >= 10,
    length6plus: len >= 6,
    uppercase: upper,
    lowercase: lower,
    number: number,
    special: special,
    noSpaces,
    noRepeat: noLongRepeat,
    noCommon,
    notAllSame: !isAllSame(raw),
    notSequential: !isFullySequential(raw),
    categoriesCount: categories
  };

  let level = 1;

  if (
    len <= 1 ||
    isAllSame(raw) ||
    (/^[0-9]+$/.test(raw) && len < 3) ||
    (/^[a-zA-Z]+$/.test(raw) && len < 3)
  ) {
    level = 1;
  } else {
    if (categories <= 1) {
      level = 1;
    } else if (categories === 2) {
      level = special ? 3 : 2;
    } else if (categories === 3) {
      if (len >= 10 && !isFullySequential(raw)) level = 5;
      else if (len >= 6) level = isFullySequential(raw) ? 4 : 4;
      else level = 3;
    } else if (categories === 4) {
      if (len > 10 && !isFullySequential(raw)) level = 5;
      else if (len >= 6) level = 4;
      else level = 3;
    } else {
      level = 1;
    }
  }

  if (!noSpaces || !noLongRepeat || !noCommon) {
    if (level >= 4) level = level - 1;
    else if (level === 3) level = 2;
  }

  if (level < 1) level = 1;
  if (level > 5) level = 5;

  const isValid = level >= 4 && noSpaces && noLongRepeat && noCommon;

  return {
    checks,
    score: level,
    isValid,
    level,
    rawLength: len,
    isSequential: isFullySequential(raw),
    isAllSame: isAllSame(raw)
  };
};

const PasswordStrength = ({ password }) => {
  const validation = useMemo(() => validatePassword(password), [password]);

  if (!password) return null;

  const level = validation.level || 1; 
  const width = level * 20;
  const colors = {
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-yellow-500",
    4: "bg-green-500",
    5: "bg-emerald-500",
  };
  const labels = {
    1: "Very Weak",
    2: "Weak",
    3: "Medium",
    4: "Strong",
    5: "Very Strong",
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colors[level]}`}
            style={{ width: `${width}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${level <= 2 ? 'text-red-600' : level === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
          {labels[level]}
        </span>
      </div>
    </div>
  );
};

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
            className={`w-11 h-11 md:w-14 md:h-14 text-center text-lg md:text-xl font-semibold border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors ${error
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
  const [step, setStep] = useState(1); 
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

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

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

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError('');
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);
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

    // Read raw response text so we can handle plain text or JSON consistently
    const rawText = await response.text();
    let data = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
      data = null;
    }

    // Build normalized backend message from possible places
    const candidate =
      (data && (data.message || data.errorMessage)) ||
      rawText ||
      '';

    const backendMsg = String(candidate).toLowerCase();

    // check status codes commonly used for conflicts/pending (adjust if your backend uses others)
    const status = response.status;

    // Detection
    const isEmailExist =
      backendMsg.includes('email already exist') ||
      backendMsg.includes('email already exists') ||
      (backendMsg.includes('exist') && backendMsg.includes('email')) ||
      status === 409; // often used for conflict

    const isEmailPending =
      backendMsg.includes('email already pending') ||
      backendMsg.includes('already pending') ||
      (backendMsg.includes('pending') && backendMsg.includes('email')) ||
      status === 423; // optionally: 423 Locked or use whatever status your API uses for pending

    if (isEmailExist) {
      setSubmitError('Email already exist, Use Different Mail');
      setIsSubmitting(false);
      return;
    }

    if (isEmailPending) {
      setSubmitError('Email already Pending, Please try again later');
      setIsSubmitting(false);
      return;
    }

    // If response not OK and we didn't hit the above special cases, show generic error (including backend text)
    if (!response.ok) {
      const fallback = backendMsg || `Server error: ${status}`;
      throw new Error(fallback);
    }

    // If OK: parse token if present
    const token = (data && (data.accessToken || data.token)) || null;
    if (token) localStorage.setItem('token', token);

    // proceed to OTP step
    setStep(2);
    setOtp(Array(6).fill(''));

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
        : error.message || 'An unexpected error occurred';
    setSubmitError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};


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
      if (!response.ok) {
        const msg = raw?.trim() || `Server error: ${response.status}`;
        throw new Error(msg);
      }

      let token = (raw || '').trim().replace(/^"(.*)"$/, '$1');
      if (!token) throw new Error('No token found in response.');
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
                className={`w-full px-3.5 py-2.5 md:px-4 md:py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${validation.email.error
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
                className={`w-full px-3.5 py-2.5 md:px-4 md:py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${validation.username.error
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
                  className={`w-full px-3.5 py-2.5 md:px-4 md:py-3 pr-12 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${validation.password.error
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
                  className={`w-full px-3.5 py-2.5 md:px-4 md:py-3 pr-12 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${validation.confirmPassword.error
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
