// Daily Power Messages for VENUED
// Three types as per spec: ADHD Truth Bombs, Rock-Themed Motivation, Quick Tips

export type MessageType = 'truth_bomb' | 'rock_motivation' | 'quick_tip';

export interface PowerMessage {
  id: string;
  type: MessageType;
  content: string;
  emoji: string;
}

// Type A - ADHD Truth Bombs
const truthBombs: PowerMessage[] = [
  {
    id: 'truth-1',
    type: 'truth_bomb',
    content: "ADHD masking is exhausting. Today, try being 10% more yourself.",
    emoji: '🎭',
  },
  {
    id: 'truth-2',
    type: 'truth_bomb',
    content: "Time blindness isn't laziness - your brain processes time differently.",
    emoji: '⏰',
  },
  {
    id: 'truth-3',
    type: 'truth_bomb',
    content: "Your brain isn't broken. The system wasn't built for you.",
    emoji: '🧠',
  },
  {
    id: 'truth-4',
    type: 'truth_bomb',
    content: "Executive dysfunction isn't a character flaw. It's neurological.",
    emoji: '💡',
  },
  {
    id: 'truth-5',
    type: 'truth_bomb',
    content: "Struggling doesn't mean failing. It means you're still fighting.",
    emoji: '💪',
  },
  {
    id: 'truth-6',
    type: 'truth_bomb',
    content: "Your worth isn't measured by your productivity.",
    emoji: '💎',
  },
  {
    id: 'truth-7',
    type: 'truth_bomb',
    content: "Needing accommodations isn't weakness. It's self-awareness.",
    emoji: '🔧',
  },
  {
    id: 'truth-8',
    type: 'truth_bomb',
    content: "Rest is productive. Your brain needs downtime to function.",
    emoji: '😴',
  },
  {
    id: 'truth-9',
    type: 'truth_bomb',
    content: "Comparing your chapter 1 to someone's chapter 20 is unfair to you.",
    emoji: '📖',
  },
  {
    id: 'truth-10',
    type: 'truth_bomb',
    content: "You've survived 100% of your worst days. That's a hell of a track record.",
    emoji: '🏆',
  },
];

// Type B - Rock-Themed Motivation
const rockMotivation: PowerMessage[] = [
  {
    id: 'rock-1',
    type: 'rock_motivation',
    content: "Even rockstars have off days. Show up anyway.",
    emoji: '🎸',
  },
  {
    id: 'rock-2',
    type: 'rock_motivation',
    content: "Your setlist doesn't have to be perfect. Just start the first song.",
    emoji: '🎵',
  },
  {
    id: 'rock-3',
    type: 'rock_motivation',
    content: "Headliners weren't born on stage. They practiced in garages.",
    emoji: '🏠',
  },
  {
    id: 'rock-4',
    type: 'rock_motivation',
    content: "The crowd doesn't need perfection. They need YOU.",
    emoji: '👥',
  },
  {
    id: 'rock-5',
    type: 'rock_motivation',
    content: "Legends aren't made in comfort zones. Get on that stage.",
    emoji: '🔥',
  },
  {
    id: 'rock-6',
    type: 'rock_motivation',
    content: "Every sold-out arena started with an empty room and one person who believed.",
    emoji: '🏟️',
  },
  {
    id: 'rock-7',
    type: 'rock_motivation',
    content: "Turn up the volume on your dreams. Drown out the doubters.",
    emoji: '🔊',
  },
  {
    id: 'rock-8',
    type: 'rock_motivation',
    content: "Your encore is coming. Keep playing.",
    emoji: '🎤',
  },
  {
    id: 'rock-9',
    type: 'rock_motivation',
    content: "Rock bottom can be a solid foundation. Build from here.",
    emoji: '🪨',
  },
  {
    id: 'rock-10',
    type: 'rock_motivation',
    content: "The show must go on. And you're the headliner.",
    emoji: '⭐',
  },
];

// Type C - Quick ADHD Tips
const quickTips: PowerMessage[] = [
  {
    id: 'tip-1',
    type: 'quick_tip',
    content: "Stuck? 2-minute rule: if it takes less than 2 minutes, do it now.",
    emoji: '⚡',
  },
  {
    id: 'tip-2',
    type: 'quick_tip',
    content: "Body doubling works. Even having this app open counts.",
    emoji: '👯',
  },
  {
    id: 'tip-3',
    type: 'quick_tip',
    content: "Movement before motivation. Stand up, stretch, then start.",
    emoji: '🏃',
  },
  {
    id: 'tip-4',
    type: 'quick_tip',
    content: "Can't decide? Flip a coin. Your gut reaction tells you the truth.",
    emoji: '🪙',
  },
  {
    id: 'tip-5',
    type: 'quick_tip',
    content: "Done is better than perfect. Ship it, then improve it.",
    emoji: '🚀',
  },
  {
    id: 'tip-6',
    type: 'quick_tip',
    content: "Set a timer for 10 minutes. You can do anything for 10 minutes.",
    emoji: '⏱️',
  },
  {
    id: 'tip-7',
    type: 'quick_tip',
    content: "Write it down NOW. Your brain will forget in 3 seconds.",
    emoji: '📝',
  },
  {
    id: 'tip-8',
    type: 'quick_tip',
    content: "Eat the frog first. Do your hardest task when energy is highest.",
    emoji: '🐸',
  },
  {
    id: 'tip-9',
    type: 'quick_tip',
    content: "Chunk it. Big task = 3 small tasks = actually doable.",
    emoji: '🧩',
  },
  {
    id: 'tip-10',
    type: 'quick_tip',
    content: "Future you will thank present you. Do one small thing now.",
    emoji: '🎁',
  },
];

// All messages combined
export const allMessages: PowerMessage[] = [
  ...truthBombs,
  ...rockMotivation,
  ...quickTips,
];

// Get a random message
export const getRandomMessage = (): PowerMessage => {
  const randomIndex = Math.floor(Math.random() * allMessages.length);
  return allMessages[randomIndex];
};

// Get a random message of a specific type
export const getRandomMessageByType = (type: MessageType): PowerMessage => {
  const messages = allMessages.filter(m => m.type === type);
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

// Get type label for display
export const getTypeLabel = (type: MessageType): string => {
  switch (type) {
    case 'truth_bomb':
      return 'ADHD TRUTH BOMB';
    case 'rock_motivation':
      return 'ROCK MOTIVATION';
    case 'quick_tip':
      return 'QUICK TIP';
  }
};
