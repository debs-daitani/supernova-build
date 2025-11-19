/**
 * OnboardingOrchestrator Component
 * Manages the entire onboarding flow
 * Shows: Welcome Splash → Setup Wizard → Dashboard Tour
 */

import { useState, useEffect } from 'react';
import WelcomeSplash from './WelcomeSplash';
import SetupWizard from './SetupWizard';
import DashboardTour from './DashboardTour';

export default function OnboardingOrchestrator({ user }) {
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/onboarding/status');

      if (!response.ok) {
        throw new Error('Failed to fetch onboarding status');
      }

      const data = await response.json();

      // Determine which stage to show
      if (!data.welcomeSeen) {
        setStage('welcome');
      } else if (!data.setupComplete) {
        setStage('setup');
      } else if (!data.tourComplete) {
        setStage('tour');
      } else {
        setStage('complete');
      }
    } catch (err) {
      console.error('Error checking onboarding status:', err);
      setError(err.message);
      // Default to showing welcome for new users
      setStage('welcome');
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeComplete = async () => {
    try {
      // Mark welcome as seen
      await fetch('/api/onboarding/welcome-seen', {
        method: 'POST'
      });

      setStage('setup');
    } catch (err) {
      console.error('Error marking welcome as seen:', err);
      // Continue anyway
      setStage('setup');
    }
  };

  const handleWelcomeSkip = async () => {
    try {
      // Mark all onboarding as complete
      await fetch('/api/onboarding/skip-all', {
        method: 'POST'
      });

      setStage('complete');
      window.location.reload();
    } catch (err) {
      console.error('Error skipping onboarding:', err);
      setStage('complete');
      window.location.reload();
    }
  };

  const handleSetupComplete = async (setupData) => {
    try {
      // Generate sample data if requested
      if (setupData.wantsSamples) {
        setStage('generating');

        const response = await fetch('/api/sample-data/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: setupData.goal })
        });

        if (!response.ok) {
          console.error('Failed to generate sample data');
        }
      }

      // Mark setup as complete
      await fetch('/api/onboarding/setup-complete', {
        method: 'POST'
      });

      setStage('tour');
    } catch (err) {
      console.error('Error completing setup:', err);
      // Continue to tour anyway
      setStage('tour');
    }
  };

  const handleTourComplete = async () => {
    try {
      await fetch('/api/onboarding/tour-complete', {
        method: 'POST'
      });

      setStage('complete');
      window.location.reload(); // Refresh to show full dashboard
    } catch (err) {
      console.error('Error completing tour:', err);
      setStage('complete');
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500 to-pink-500 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && stage === null) {
    return null; // Silently fail and show main app
  }

  // Show generating state
  if (stage === 'generating') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 max-w-md mx-4 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Creating Your Sample Data...</h2>
          <p className="text-gray-600">
            We're populating your account with examples. This will take just a moment!
          </p>
          <div className="mt-6 space-y-2 text-sm text-gray-500">
            <p>✓ Creating sample pages</p>
            <p>✓ Adding example products</p>
            <p>✓ Building demo content</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {stage === 'welcome' && (
        <WelcomeSplash
          userName={user.preferredName || user.name || 'there'}
          onStart={handleWelcomeComplete}
          onSkip={handleWelcomeSkip}
        />
      )}

      {stage === 'setup' && (
        <SetupWizard
          onComplete={handleSetupComplete}
        />
      )}

      {stage === 'tour' && (
        <DashboardTour
          onComplete={handleTourComplete}
        />
      )}
    </>
  );
}
