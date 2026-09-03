import React, { useRef, useEffect } from 'react';

export default function OtpInput({ length = 6, value = '', onChange, disabled = false }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount if empty
    if (!value && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    // Get the last typed character
    const char = rawVal.replace(/\D/g, '').slice(-1);

    const otpArray = value.split('');
    // Pad with empty strings if shorter than length
    while (otpArray.length < length) {
      otpArray.push('');
    }

    otpArray[index] = char;
    const newOtp = otpArray.join('').slice(0, length);
    onChange(newOtp);

    // Auto-focus next input if a digit was entered
    if (char && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move back and clear previous
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => {
        const digit = value[idx] || '';
        return (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="w-11 h-13 sm:w-13 sm:h-14 text-center text-2xl font-bold rounded-xl border border-slate-300 bg-white text-slate-800 shadow-sm transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
          />
        );
      })}
    </div>
  );
}
