'use client';

import { useState, useEffect } from 'react';
import { Users, MessageCircle } from 'lucide-react';

const CHARACTERS = [
  { id: 'alex', name: 'Alex', emoji: '👨‍💻', color: 'text-blue-400' },
  { id: 'sam', name: 'Sam', emoji: '👩‍💼', color: 'text-neon-pink' },
  { id: 'charlie', name: 'Charlie', emoji: '🧑‍🎨', color: 'text-electric-purple' },
  { id: 'riley', name: 'Riley', emoji: '👩‍🔬', color: 'text-neon-green' },
];

const MESSAGES = [
  "You got this! 💪",
  "Keep going!",
  "Nice progress!",
  "One step at a time",
  "You're doing great!",
  "Focus time 🎯",
  "Making it happen!",
  "Stay on track!",
  "I'm here with you",
  "We're crushing this!",
  "Awesome work!",
  "Keep it up! 🚀",
];

const ACTIVITIES = [
  "typing...",
  "thinking...",
  "working...",
  "focused...",
  "on task...",
];

export default function BodyDoublingSimulator() {
  const [isActive, setIsActive] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentActivity, setCurrentActivity] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Random encouraging messages
    const messageInterval = setInterval(() => {
      const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setCurrentMessage(message);
      setShowMessage(true);

      setTimeout(() => {
        setShowMessage(false);
      }, 4000);
    }, 30000); // Every 30 seconds

    // Update activity
    const activityInterval = setInterval(() => {
      const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
      setCurrentActivity(activity);
    }, 5000); // Every 5 seconds

    return () => {
      clearInterval(messageInterval);
      clearInterval(activityInterval);
    };
  }, [isActive]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-electric-purple/20 to-blue-500/20 border-2 border-electric-purple/30">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-electric-purple" />
          <h3 className="text-xl font-bold text-white">Body Doubling Simulator</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Someone to work alongside you (virtually). Because sometimes you just need to know someone else is there.
        </p>

        {/* Toggle */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`w-full py-4 rounded-xl font-bold transition-all ${
            isActive
              ? 'bg-red-500 text-white hover:bg-red-400'
              : 'bg-electric-purple text-white hover:bg-white hover:text-black'
          }`}
        >
          {isActive ? '🛑 End Session' : '▶️ Start Body Doubling'}
        </button>
      </div>

      {/* Character Selection */}
      {!isActive && (
        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Choose Your Work Buddy</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CHARACTERS.map(char => (
              <button
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedCharacter.id === char.id
                    ? 'border-electric-purple bg-electric-purple/20'
                    : 'border-white/10 bg-white/5 hover:border-electric-purple/50'
                }`}
              >
                <div className="text-4xl mb-2">{char.emoji}</div>
                <div className={`text-sm font-semibold ${char.color}`}>{char.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Body Double */}
      {isActive && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="relative">
            {/* Character */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-electric-purple/90 to-blue-500/90 backdrop-blur-lg border-2 border-white/20 shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-3 animate-bounce">{selectedCharacter.emoji}</div>
                <div className={`text-lg font-bold ${selectedCharacter.color} mb-2`}>
                  {selectedCharacter.name}
                </div>
                <div className="text-sm text-gray-300 italic">
                  {currentActivity}
                </div>
              </div>
            </div>

            {/* Speech Bubble */}
            {showMessage && (
              <div className="absolute bottom-full right-0 mb-4 animate-in">
                <div className="relative bg-white text-black px-4 py-3 rounded-xl shadow-lg max-w-xs">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-semibold">{currentMessage}</span>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/30">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 What is Body Doubling?</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Working alongside someone (even virtually) helps with focus</li>
          <li>• Reduces the feeling of isolation when working alone</li>
          <li>• Provides gentle accountability without pressure</li>
          <li>• Your buddy will send encouraging messages while you work</li>
        </ul>
      </div>

      {/* Stats (if active) */}
      {isActive && (
        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Session Active</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Working with:</span>
              <span className={`font-bold ${selectedCharacter.color}`}>
                {selectedCharacter.emoji} {selectedCharacter.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-neon-green font-bold">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
