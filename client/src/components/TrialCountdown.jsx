/**
 * Phase 2BF: Trial Countdown
 * Shows trial expiration countdown in dashboard
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import signupService from '../services/signup';

export default function TrialCountdown({ trialEndDate, onUpgrade }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!trialEndDate) return;

    // Update countdown every minute
    const updateCountdown = () => {
      const result = signupService.formatTrialCountdown(trialEndDate);
      setCountdown(result);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trialEndDate]);

  if (!countdown) return null;

  if (countdown.expired) {
    return (
      <div className="bg-red-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">Your trial has expired</span>
          </div>
          <button
            onClick={() => navigate('/upgrade')}
            className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  const bgColor =
    countdown.color === 'green'
      ? 'bg-green-600'
      : countdown.color === 'yellow'
      ? 'bg-yellow-500'
      : countdown.color === 'orange'
      ? 'bg-orange-500'
      : 'bg-red-600';

  return (
    <div className={`${bgColor} text-white px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <span className="font-semibold">{countdown.message}</span>
        </div>
        <button
          onClick={() => navigate('/upgrade')}
          className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
        >
          Upgrade to Pro - £26/Month →
        </button>
      </div>
    </div>
  );
}
