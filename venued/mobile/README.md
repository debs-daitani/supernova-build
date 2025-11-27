# VENUED Mobile 🎸

**Strategic project planning for ADHD brains who build like rockstars**

Get VENUED. Get it Done. Plan your projects like a tour. Execute like a headliner.

## What is VENUED Mobile?

VENUED Mobile is the React Native companion app for VENUED - a comprehensive project management and productivity tool designed specifically for ADHD entrepreneurs and creatives. With a rockstar/tour aesthetic and ADHD-friendly features throughout, VENUED Mobile helps you:

- Break down overwhelming projects into manageable phases
- Match tasks to your energy levels
- Track time blindness patterns
- Manage hyperfocus sessions
- Keep momentum with quick wins
- Stay organized without feeling restricted

## Features

### 🎭 THE BACKSTAGE
Your command center. View all projects at a glance, track progress, filter by status, and manage priorities.

### ⭐ THE SETLIST
Project builder with drag-and-drop phases. Build your project like a setlist with templates, energy matching, and ADHD reality checks.

### 👥 THE CREW
Daily task manager with gamification system, crew roles, achievements, points, levels, energy matching, and confetti celebrations for task completion. Complete tasks to earn points, unlock achievements, and level up!

### 📅 THE TOUR
Strategic timeline view with week navigation, workload analysis, ADHD time blindness compensation (1.8x multiplier), and burnout prevention.

### 🧠 THE ENTOURAGE
ADHD support tools including:
- **Brain Dump Space** - Capture everything, organize later
- **Time Blindness Tracker** - Log estimates vs reality
- **Hyperfocus Logger** - Track flow states and triggers
- **Energy Tracker** - Map your energy patterns
- **Dopamine Menu** - Gamified reward system
- **Pattern Insights** - Personalized recommendations

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Storage**: AsyncStorage (offline-first)
- **Animations**: React Native Reanimated + Confetti celebrations
- **Gestures**: React Native Gesture Handler + Drag-drop
- **Haptics**: Expo Haptics for tactile feedback
- **Styling**: React Native StyleSheet with Linear Gradients
- **Icons**: Emoji (for universal compatibility)

## Gamification System

VENUED includes a complete gamification system to keep you motivated:

### 🎯 Points & Levels
- Earn **10 points** for each completed task
- **+5 points** for Quick Wins
- **+20 points** for Hyperfocus tasks
- **Difficulty bonuses**: Easy (0), Medium (+5), Hard (+10)
- Level up from 1 to 10 based on total points

### 🏆 Achievements
8 unlockable achievements including:
- 🎸 **First Gig** - Complete your first task
- 🎤 **Opening Act** - Complete 10 tasks
- ⭐ **Headliner** - Complete 50 tasks
- 🔥 **Week of Shows** - Maintain a 7-day streak
- 🏆 **Tour Veteran** - Reach level 5
- 💎 **Sold Out Show** - Earn 1000 total points

### 👥 Crew Roles
Tasks are automatically assigned to crew roles:
- 🔧 **Roadie** - Setup and logistics
- 🎚️ **Sound Engineer** - Technical and system tasks
- 📋 **Stage Manager** - Coordination and organization
- 💡 **Lighting Tech** - Creative and design tasks
- 🎤 **Tour Manager** - Planning and strategy

## Demo Data

Load demo project: **"Launch The dAItaniverse"**
- 4 phases: Planning, Development, Launch Prep, Launch & Scale
- 12 tasks across all phases
- 5 tasks already completed
- Sample crew roles, points, and achievements

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Expo CLI (installed automatically with npx)
- Expo Go app on your phone (for testing)

### Installation

```bash
# Clone the repository
cd venued-mobile

# Install dependencies
npm install

# Start development server
npm start
```

### Running the App

After starting the development server, you can:

- **iOS Simulator**: Press `i` (requires macOS)
- **Android Emulator**: Press `a` (requires Android Studio)
- **Physical Device**: Scan QR code with Expo Go app
- **Web**: Press `w` (for testing only)

## Building for Production

### iOS (requires macOS and Apple Developer account)
```bash
npm run ios
eas build --platform ios
```

### Android
```bash
npm run android
eas build --platform android
```

## App Structure

```
venued-mobile/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Main navigation configuration
│   ├── screens/
│   │   ├── LandingScreen.tsx     # Welcome screen with Demo/Fresh start
│   │   ├── BackstageScreen.tsx   # Projects dashboard
│   │   ├── SetlistScreen.tsx     # Project planning with phases
│   │   ├── CrewScreen.tsx        # Daily task management
│   │   ├── TourScreen.tsx        # Timeline/roadmap view
│   │   └── EntourageScreen.tsx   # ADHD support tools
│   ├── components/
│   │   └── [feature components]
│   ├── lib/
│   │   ├── storage.ts            # AsyncStorage utilities
│   │   └── demoData.ts           # Demo data generator
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── theme/
│       └── colors.ts             # Color palette and gradients
├── App.tsx                        # Root component
└── app.json                       # Expo configuration
```

## Demo Data

On first launch, choose:
- **Try Demo**: Load sample projects and tasks to explore features
- **Start Fresh**: Begin with a clean slate

You can clear all data from the Backstage screen settings.

## Data Privacy

**Your data never leaves your device.** Everything is stored locally using AsyncStorage. No servers, no tracking, no accounts required.

## ADHD-Specific Features

- **Energy Level Matching**: Tag tasks as High/Medium/Low energy
- **Time Blindness Compensation**: Automatic 1.8x multiplier on estimates
- **Hyperfocus Support**: Mark tasks that need deep focus
- **Quick Wins**: Identify easy tasks for motivation
- **Reality Checks**: Warnings for unrealistic workloads
- **Pattern Recognition**: Track your personal productivity patterns

## Visual Design

- **Dark Mode**: Easy on the eyes for extended use
- **Neon Colors**: Pink (#FF1B8D), Purple (#9D4EDD), Green (#39FF14), Cyan (#00D9FF)
- **Gradient Effects**: Engaging visual hierarchy
- **Rock Concert Theme**: Tour, setlist, crew, backstage metaphors
- **Mobile-First**: Optimized for touch and small screens

## Development

### Project Commands

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS (macOS only)
npm run web        # Run in web browser (testing only)
```

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Styled with StyleSheet for performance
- Inline styles only for dynamic values

## Roadmap

Future features planned:
- [ ] Drag-and-drop task reordering
- [ ] Push notifications for scheduled tasks
- [ ] Data export/import (JSON)
- [ ] Cloud sync (optional)
- [ ] Team collaboration (Entourage feature)
- [ ] Widgets for home screen
- [ ] Apple Watch companion
- [ ] Siri shortcuts integration

## Related Projects

- [VENUED Web](https://github.com/debs-daitani/venued) - The web version built with Next.js

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - feel free to use and modify for your own needs.

## About

Built for ADHD brains, by ADHD brains.

Because sometimes you need a project planner that understands that:
- You'll hyperfocus for 6 hours straight
- Then have zero energy the next day
- Time estimates are always wrong
- You need to see the big picture AND the details
- Motivation comes from momentum, not discipline
- Your brain works differently, and that's not a bug—it's a feature

---

**Get VENUED. Get it Done.** 🚀
