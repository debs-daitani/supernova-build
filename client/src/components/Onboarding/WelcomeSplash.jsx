/**
 * WelcomeSplash Component
 * Full-screen welcome screen shown on first login only
 */

import { useState, useEffect } from 'react';

export default function WelcomeSplash({ userName, onStart, onSkip }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-500 to-pink-500 z-50 flex items-center justify-center">
      {/* Confetti Animation */}
      {showConfetti && <ConfettiAnimation />}

      <div className="bg-white rounded-2xl p-12 max-w-2xl mx-4 text-center shadow-2xl animate-fade-in">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          🎉 Welcome to The dAItaniverse!
        </h1>

        <p className="text-2xl mb-8 text-gray-800">
          Hey <span className="font-bold text-orange-600">{userName}</span>!
        </p>

        <p className="text-xl text-gray-700 mb-8">
          You're officially part of something special.
        </p>

        <p className="text-lg text-gray-600 mb-12">
          Let's get you set up in 3 minutes.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={onStart}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            Let's Go! →
          </button>

          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 px-8 py-4 rounded-lg text-lg transition-all"
          >
            Skip Setup, Explore On My Own
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple CSS-based confetti animation
 */
function ConfettiAnimation() {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    color: ['#f97316', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-40">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 rounded-full animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`
          }}
        />
      ))}

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
