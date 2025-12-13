'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Zap,
  Music,
  Clock,
  RefreshCw,
  MessageSquare,
  Users,
  TrendingUp,
  Trophy,
  Brain,
} from 'lucide-react';
import { generateSampleADHDData } from '@/lib/adhd';

// Entourage modules configuration - spells E-N-T-O-U-R-A-G-E
const modules = [
  {
    id: 'electrify',
    letter: 'E',
    name: 'Electrify',
    subtitle: "Fuck 'Stuck' - let's get moving!",
    icon: Zap,
    letterColor: '#FF008E',
    gradient: 'entourage-e-electrify',
    description: 'AI breaks down tasks into micro-steps',
  },
  {
    id: 'new-releases',
    letter: 'N',
    name: 'New Releases',
    subtitle: 'Your demo tape studio!',
    icon: Music,
    letterColor: '#C9005C',
    gradient: 'entourage-n-new-releases',
    description: 'Dump ideas, capture pivots, track inspiration',
  },
  {
    id: 'tune-up',
    letter: 'T',
    name: 'Tune Up',
    subtitle: 'Focused A/F',
    icon: Clock,
    letterColor: '#FF008E',
    gradient: 'entourage-t-tune-up',
    description: 'Focus timer, hyperfocus logger, time perception',
  },
  {
    id: 'outro',
    letter: 'O',
    name: 'Outro',
    subtitle: 'Rewrite the lyric',
    icon: RefreshCw,
    letterColor: '#00F0E9',
    gradient: 'entourage-o-outro',
    description: 'Reframe negative thoughts with AI',
  },
  {
    id: 'unplugged',
    letter: 'U',
    name: 'Unplugged',
    subtitle: 'Time to duet',
    icon: Users,
    letterColor: '#00A29D',
    gradient: 'entourage-u-unplugged',
    description: 'Virtual body doubling companions',
  },
  {
    id: 'retune',
    letter: 'R',
    name: 'Retune',
    subtitle: 'Reset & recharge your batteries',
    icon: RefreshCw,
    letterColor: '#00F0E9',
    gradient: 'entourage-r-retune',
    description: 'Reset protocols for different moods',
  },
  {
    id: 'amplify',
    letter: 'A',
    name: 'Amplify',
    subtitle: 'Revenue Re-VENUED',
    icon: TrendingUp,
    letterColor: '#D3FF2C',
    gradient: 'entourage-a-amplify',
    description: 'Revenue tracking and pattern analysis',
  },
  {
    id: 'gig-highlights',
    letter: 'G',
    name: 'Gig Highlights',
    subtitle: 'Your showstoppers!',
    icon: TrendingUp,
    letterColor: '#C9005C',
    gradient: 'entourage-g-gig-highlights',
    description: 'Pattern insights from your activity',
  },
  {
    id: 'excite',
    letter: 'E',
    name: 'Excite',
    subtitle: "Don't stop me now!",
    icon: Trophy,
    letterColor: '#FF008E',
    gradient: 'entourage-e-excite',
    description: 'Achievements and badges',
  },
];

// Wrapper component for Suspense boundary
export default function Entourage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-josefin">Loading...</p>
        </div>
      </div>
    }>
      <EntourageContent />
    </Suspense>
  );
}

function EntourageContent() {
  const searchParams = useSearchParams();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    generateSampleADHDData();

    // Check for URL params to auto-open modules
    const tab = searchParams.get('tab');
    if (tab === 'ideas') {
      setActiveModule('new-releases');
    }
  }, [searchParams]);

  const renderModuleContent = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return null;

    switch (moduleId) {
      case 'electrify':
        return <ElectrifyModule />;
      case 'new-releases':
        return <NewReleasesModule />;
      case 'tune-up':
        return <TuneUpModule />;
      case 'outro':
        return <OutroModule />;
      case 'unplugged':
        return <UnpluggedModule />;
      case 'retune':
        return <RetuneModule />;
      case 'amplify':
        return <AmplifyModule />;
      case 'gig-highlights':
        return <GigHighlightsModule />;
      case 'excite':
        return <ExciteModule />;
      default:
        return <div className="text-gray-400">Module coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header - Only show when no module is active */}
        {!activeModule && (
          <div className="mb-6 sm:mb-8">
            <div className="header-gradient-entourage rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-supernova text-white tracking-tight">
                    ENTOURAGE
                  </h1>
                  <p className="text-base sm:text-lg font-arp-display text-white/80 mt-1">
                    9 'groupies' who've always got your back!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module Grid - 3x3 spelling E-N-T-O-U-R-A-G-E */}
        {!activeModule && (
          <>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              {modules.map((module) => {
                const Icon = module.icon;
                const firstLetter = module.name.charAt(0);
                const restOfName = module.name.slice(1);
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className="relative p-3 sm:p-5 rounded-xl border border-white/10 hover:border-white/30 transition-all group text-left bg-white/5 overflow-hidden"
                  >
                    {/* Bottom gradient highlight */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 opacity-80"
                      style={{ backgroundColor: module.letterColor }}
                    />
                    {/* Icon on top row */}
                    <div className="mb-2 sm:mb-3">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: module.letterColor }} />
                    </div>
                    {/* Title with first letter highlighted */}
                    <h3 className="text-sm sm:text-base md:text-lg font-josefin text-white mb-1">
                      <span className="font-supernova" style={{ color: module.letterColor }}>{firstLetter}</span>
                      {restOfName}
                    </h3>
                    <p className="text-xs text-white/60 font-josefin leading-tight">
                      {module.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Tagline */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <p className="text-gray-300 text-center font-josefin">
                Tools designed BY a variant brain - FOR variant brains! We're wired differently but that's not a flaw - it's a fucking advantage! Use these tools to help you get unstuck, clear your head, connect with others and rock the hell out of your business!
              </p>
            </div>
          </>
        )}

        {/* Active Module */}
        {activeModule && (() => {
          const module = modules.find(m => m.id === activeModule);
          const Icon = module?.icon || Brain;
          return (
            <div>
              <button
                onClick={() => setActiveModule(null)}
                className="mb-4 text-magenta hover:text-white transition-colors font-semibold"
              >
                &larr; Back to Entourage
              </button>

              {/* Module-specific header - Icon on left, title on right */}
              <div
                className="rounded-2xl p-6 sm:p-8 mb-6"
                style={{
                  background: `linear-gradient(135deg, ${module?.letterColor}30 0%, transparent 100%)`,
                  borderColor: `${module?.letterColor}50`,
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Bigger icon on left */}
                  <Icon className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: module?.letterColor }} />
                  <div>
                    <h2
                      className="text-2xl sm:text-3xl font-supernova tracking-tight"
                      style={{ color: module?.letterColor }}
                    >
                      {module?.name}
                    </h2>
                    <p className="text-base font-arp-display text-white/80 mt-1">
                      {module?.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {renderModuleContent(activeModule)}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Module Components
function ElectrifyModule() {
  const [task, setTask] = useState('');
  const [whyStuck, setWhyStuck] = useState('');
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBreakdown = () => {
    if (!task.trim()) return;
    setIsLoading(true);

    // Intelligent AI breakdown based on task and why stuck
    setTimeout(() => {
      let steps: string[] = [];

      // Customize steps based on why they're stuck
      const lowerWhyStuck = whyStuck.toLowerCase();

      if (lowerWhyStuck.includes('overwhelm') || lowerWhyStuck.includes('too big') || lowerWhyStuck.includes('too much')) {
        steps = [
          `Take a deep breath. "${task}" feels huge but we're gonna chunk it.`,
          `Write down just 3 parts of this task on paper - nothing more`,
          `Pick the TINIEST part. Like, embarrassingly tiny.`,
          `Set a 5-minute timer. Only work on that tiny part.`,
          `Done? Celebrate! If not, that's OK - you STARTED. That's the win.`,
        ];
      } else if (lowerWhyStuck.includes('boring') || lowerWhyStuck.includes('don\'t want') || lowerWhyStuck.includes('hate')) {
        steps = [
          `Put on your favorite pump-up song - seriously, do it now!`,
          `Set a 10-minute timer. You can do ANYTHING for 10 minutes.`,
          `Start "${task}" with the most interesting part first`,
          `Reward yourself after - what treat are you earning?`,
          `Remind yourself: boring tasks don't define you, completing them does! 🤘`,
        ];
      } else if (lowerWhyStuck.includes('perfect') || lowerWhyStuck.includes('scared') || lowerWhyStuck.includes('afraid') || lowerWhyStuck.includes('fail')) {
        steps = [
          `Permission granted: Your first attempt can be TERRIBLE. Seriously.`,
          `Write "DRAFT" or "V1" on top - this removes perfectionism pressure`,
          `Set a timer for 15 mins. Whatever you produce is the goal.`,
          `Start in the middle if the beginning feels scary`,
          `Remember: Done > Perfect. Ship the damn thing! 🚀`,
        ];
      } else if (lowerWhyStuck.includes('distract') || lowerWhyStuck.includes('focus') || lowerWhyStuck.includes('phone')) {
        steps = [
          `Put your phone in another room. Yes, really. Go do it.`,
          `Close all browser tabs except what you need for "${task}"`,
          `Write your intention on a sticky note: "I am doing ${task}"`,
          `Set a 25-minute Pomodoro timer - head to Tune Up module!`,
          `When distracted, look at the sticky note. Return to task.`,
        ];
      } else {
        steps = [
          `Open/prepare what you need for "${task}"`,
          `Set a 5-minute timer - commit to just starting`,
          `What's the FIRST physical action? Do that one thing.`,
          `Take a breath. Now do the next tiny step.`,
          `You've started! The hardest part is over. Keep that momentum! 🤘`,
        ];
      }

      setMicroSteps(steps);
      setIsLoading(false);
    }, 1500);
  };

  const handleCancel = () => {
    setTask('');
    setWhyStuck('');
    setMicroSteps([]);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-magenta/10 border border-magenta/30">
        <p className="text-magenta font-semibold">
          🤘 Stuck on a task? Let's break it into tiny, dopamine-friendly micro-steps!
        </p>
      </div>

      <div className="p-6 rounded-xl border-2 border-white/10 bg-white/5">
        <h3 className="text-lg font-bold text-white mb-4">What are you avoiding?</h3>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g., Clean the kitchen, Write that email, Start the presentation..."
          className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none mb-4"
        />

        <h3 className="text-lg font-bold text-white mb-4">Why are you stuck? (optional but helps!)</h3>
        <input
          type="text"
          value={whyStuck}
          onChange={(e) => setWhyStuck(e.target.value)}
          placeholder="e.g., It's too big, I'm scared of failing, It's boring, I keep getting distracted..."
          className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={handleBreakdown}
            disabled={!task.trim() || isLoading}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold hover:shadow-[0_0_30px_rgba(255,0,142,0.5)] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Breaking it down...' : '🤘 LFG!'}
          </button>
          {(task || whyStuck || microSteps.length > 0) && (
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {microSteps.length > 0 && (
        <div className="p-6 rounded-xl border-2 border-magenta/30 bg-magenta/10">
          <h3 className="text-lg font-bold text-white mb-4">Your Badass Micro-Steps:</h3>
          <ol className="space-y-3">
            {microSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-magenta text-black font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-white">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function NewReleasesModule() {
  const [activeTab, setActiveTab] = useState<'dump' | 'ideas' | 'pivots' | 'saved'>('dump');
  const [savedFilter, setSavedFilter] = useState<'all' | 'dumps' | 'ideas' | 'pivots'>('all');
  const [dumpText, setDumpText] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [dumpSaved, setDumpSaved] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [dumpAction, setDumpAction] = useState('');
  const [dumpConversation, setDumpConversation] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [dumpUserInput, setDumpUserInput] = useState('');
  const [currentDumpId, setCurrentDumpId] = useState<string | null>(null);
  const [savedDumps, setSavedDumps] = useState<any[]>([]);
  const [editingDump, setEditingDump] = useState<any>(null);
  const [ideaName, setIdeaName] = useState('');
  const [ideaProblem, setIdeaProblem] = useState('');
  const [ideaAudience, setIdeaAudience] = useState('');
  const [ideaSaved, setIdeaSaved] = useState(false);
  const [ideaAiSuggestion, setIdeaAiSuggestion] = useState('');
  const [ideaConversation, setIdeaConversation] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [ideaUserInput, setIdeaUserInput] = useState('');
  const [currentIdeaId, setCurrentIdeaId] = useState<string | null>(null);
  const [pivotLeaving, setPivotLeaving] = useState('');
  const [pivotHeading, setPivotHeading] = useState('');
  const [pivotWhy, setPivotWhy] = useState('');
  const [pivotSaved, setPivotSaved] = useState(false);
  const [pivotAiSuggestion, setPivotAiSuggestion] = useState('');
  const [pivotConversation, setPivotConversation] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [pivotUserInput, setPivotUserInput] = useState('');
  const [currentPivotId, setCurrentPivotId] = useState<string | null>(null);
  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [savedPivots, setSavedPivots] = useState<any[]>([]);
  const [editingIdea, setEditingIdea] = useState<any>(null);
  const [editingPivot, setEditingPivot] = useState<any>(null);

  // Load saved items and check for prefill
  useEffect(() => {
    setSavedIdeas(JSON.parse(localStorage.getItem('venued_ideas') || '[]'));
    setSavedPivots(JSON.parse(localStorage.getItem('venued_pivots') || '[]'));
    setSavedDumps(JSON.parse(localStorage.getItem('venued_brain_dumps') || '[]'));

    // Check for prefill from Inbox
    const prefillIdea = localStorage.getItem('venued_prefill_idea');
    if (prefillIdea) {
      setActiveTab('ideas');
      setIdeaName(prefillIdea);
      localStorage.removeItem('venued_prefill_idea');
    }
  }, [activeTab]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setIsTimerActive(true);
    setDumpSaved(false);
    setAiInsight('');
  };

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveDump = () => {
    if (!dumpText.trim()) return;

    const dumpId = Date.now().toString();
    setCurrentDumpId(dumpId);

    // Generate AI insight based on dump content
    const wordCount = dumpText.split(/\s+/).length;
    const hasQuestions = dumpText.includes('?');
    const mentionsWork = dumpText.toLowerCase().includes('work') || dumpText.toLowerCase().includes('project');
    const mentionsStress = dumpText.toLowerCase().includes('stress') || dumpText.toLowerCase().includes('overwhelm') || dumpText.toLowerCase().includes('anxious');

    let insight = '';
    if (wordCount > 100) {
      insight = "🧠 Wow, you had a LOT on your mind! That's the beauty of brain dumps - getting it OUT of your head creates space for clarity. Notice any patterns in what came out?";
    } else if (hasQuestions) {
      insight = "💡 I noticed some questions in there. Those questions are often your subconscious pointing you toward what matters. Which question feels most urgent to answer?";
    } else if (mentionsStress) {
      insight = "🤘 Sounds like you're carrying some weight. Remember: acknowledging stress is the first step to releasing it. What's ONE small thing you could let go of today?";
    } else if (mentionsWork) {
      insight = "📋 Looks like work is on your mind. Consider: which ONE thing from this dump, if completed, would make everything else easier or unnecessary?";
    } else {
      insight = "✨ Great job getting that out of your head! Now your brain has more bandwidth. What's the ONE action you want to take based on this dump?";
    }

    // Save to localStorage with initial AI insight
    const dumps = JSON.parse(localStorage.getItem('venued_brain_dumps') || '[]');
    dumps.unshift({
      id: dumpId,
      content: dumpText,
      timestamp: new Date().toISOString(),
      aiInsight: insight,
      action: '',
      conversation: [],
    });
    localStorage.setItem('venued_brain_dumps', JSON.stringify(dumps.slice(0, 50)));
    setSavedDumps(dumps.slice(0, 50));
    setDumpSaved(true);
    setAiInsight(insight);
    setDumpConversation([]);
  };

  const handleSaveIdea = () => {
    if (!ideaName.trim()) return;

    const ideaId = Date.now().toString();
    setCurrentIdeaId(ideaId);

    // Generate AI suggestion - highly contextual based on what user entered
    let suggestion = '';
    if (ideaProblem && ideaAudience) {
      suggestion = `Love it! "${ideaName}" solving "${ideaProblem}" for ${ideaAudience}.\n\nYour first 3 moves:\n\n1️⃣ VALIDATE: Find 3 people who are ${ideaAudience}. Ask them: "How do you currently handle ${ideaProblem.toLowerCase().includes('help') ? ideaProblem : `the problem of ${ideaProblem}`}?"\n\n2️⃣ DIFFERENTIATE: Search "${ideaProblem} solution" - who else is doing this? What's YOUR angle?\n\n3️⃣ PROTOTYPE: What's the simplest version you could show someone this week?\n\nWhich step feels most important right now?`;
    } else if (ideaProblem) {
      suggestion = `"${ideaName}" tackling "${ideaProblem}" - solid foundation!\n\n🎯 Missing piece: WHO has this problem most urgently? When you can name them specifically, marketing becomes obvious.\n\nThink about:\n• Who's frustrated by this daily?\n• Who would PAY to solve this?\n• Who's YOUR people (you understand their world)?\n\nDescribe your ideal customer in one sentence.`;
    } else if (ideaAudience) {
      suggestion = `"${ideaName}" for ${ideaAudience} - great target!\n\n🔍 Missing piece: What PROBLEM does ${ideaAudience} need solved?\n\nResearch mission:\n• Hang out where ${ideaAudience} complains online\n• Ask 3 of them: "What's your biggest frustration with [related area]?"\n• Look for the pain they'd pay to fix\n\nWhat do you THINK their biggest pain is?`;
    } else {
      suggestion = `"${ideaName}" captured! 💡\n\nTo develop this further:\n\n❓ WHO is this for? (Be specific - "everyone" = no one)\n❓ WHAT problem does it solve? (Pain points > nice-to-haves)\n❓ WHY you? What makes you the right person to build this?\n\nAnswer these and your path forward becomes clearer. Which question can you answer right now?`;
    }

    const ideas = JSON.parse(localStorage.getItem('venued_ideas') || '[]');
    ideas.unshift({
      id: ideaId,
      name: ideaName,
      problem: ideaProblem,
      audience: ideaAudience,
      timestamp: new Date().toISOString(),
      aiSuggestion: suggestion,
      conversation: [],
    });
    localStorage.setItem('venued_ideas', JSON.stringify(ideas.slice(0, 50)));
    setIdeaSaved(true);
    setSavedIdeas(ideas.slice(0, 50));
    setIdeaAiSuggestion(suggestion);
    setIdeaConversation([]);

    setTimeout(() => {
      setIdeaName('');
      setIdeaProblem('');
      setIdeaAudience('');
      setIdeaSaved(false);
    }, 5000);
  };

  const handleSavePivot = () => {
    if (!pivotLeaving.trim() && !pivotHeading.trim()) return;

    const pivotId = Date.now().toString();
    setCurrentPivotId(pivotId);

    // Generate AI suggestion for pivot - highly contextual
    let suggestion = '';
    if (pivotLeaving && pivotHeading && pivotWhy) {
      suggestion = `Powerful pivot! "${pivotLeaving}" → "${pivotHeading}"\n\nYour anchor: "${pivotWhy}"\n\n🎯 Your 90-day roadmap:\n\nWEEK 1: Tell 3 people about this shift. Accountability accelerates action.\n\nWEEK 2-4: What skills from "${pivotLeaving}" transfer to "${pivotHeading}"? List them.\n\nDAY 90: Check-in. Is "${pivotHeading}" feeling right?\n\nWhat's your biggest uncertainty about this move?`;
    } else if (pivotLeaving && pivotHeading) {
      suggestion = `Clear pivot! Moving from "${pivotLeaving}" to "${pivotHeading}".\n\n🤔 Before diving in, answer:\n\n• WHY this change? (Write it down - this keeps you grounded when it gets hard)\n\n• What PROOF do you have that "${pivotHeading}" is right for you?\n\n• What will you MISS about "${pivotLeaving}"?\n\nUnderstanding your "why" prevents second-guessing later. What's driving this pivot?`;
    } else if (pivotHeading) {
      suggestion = `Heading toward "${pivotHeading}" - exciting!\n\n📝 To make this real:\n\n1. What are you leaving behind? (Name it to release it)\n2. What's your first action toward "${pivotHeading}" this week?\n3. Who's already succeeding in "${pivotHeading}" that you could learn from?\n\nNew directions need concrete first steps. What's yours?`;
    } else {
      suggestion = `Letting go of "${pivotLeaving}" takes courage.\n\n🙏 Before moving on:\n\n• What did "${pivotLeaving}" teach you?\n• What skills/connections will you take with you?\n• What are you grateful for from this chapter?\n\nHonoring the past makes space for the future. Where are you heading next?`;
    }

    const pivots = JSON.parse(localStorage.getItem('venued_pivots') || '[]');
    pivots.unshift({
      id: pivotId,
      leaving: pivotLeaving,
      heading: pivotHeading,
      why: pivotWhy,
      timestamp: new Date().toISOString(),
      aiSuggestion: suggestion,
      conversation: [],
    });
    localStorage.setItem('venued_pivots', JSON.stringify(pivots.slice(0, 50)));
    setPivotSaved(true);
    setSavedPivots(pivots.slice(0, 50));
    setPivotAiSuggestion(suggestion);
    setPivotConversation([]);

    setTimeout(() => {
      setPivotLeaving('');
      setPivotHeading('');
      setPivotWhy('');
      setPivotSaved(false);
    }, 5000);
  };

  const handleDeleteIdea = (id: string) => {
    const ideas = savedIdeas.filter(i => i.id !== id);
    localStorage.setItem('venued_ideas', JSON.stringify(ideas));
    setSavedIdeas(ideas);
  };

  const handleDeletePivot = (id: string) => {
    const pivots = savedPivots.filter(p => p.id !== id);
    localStorage.setItem('venued_pivots', JSON.stringify(pivots));
    setSavedPivots(pivots);
  };

  const handleDeleteDump = (id: string) => {
    const dumps = savedDumps.filter(d => d.id !== id);
    localStorage.setItem('venued_brain_dumps', JSON.stringify(dumps));
    setSavedDumps(dumps);
  };

  const handleDumpFollowUp = () => {
    if (!dumpUserInput.trim()) return;

    // Add user message to conversation
    const newConversation = [...dumpConversation, { role: 'user' as const, text: dumpUserInput }];
    setDumpConversation(newConversation);
    const userMsg = dumpUserInput.toLowerCase();
    const userInputOriginal = dumpUserInput;
    setDumpUserInput('');

    // Generate AI response - using dump content for context
    setTimeout(() => {
      let response = '';

      // Extract key themes from the dump
      const dumpLower = dumpText.toLowerCase();
      const mentionsWork = dumpLower.includes('work') || dumpLower.includes('project') || dumpLower.includes('job') || dumpLower.includes('client');
      const mentionsRelationships = dumpLower.includes('friend') || dumpLower.includes('family') || dumpLower.includes('partner') || dumpLower.includes('relationship');
      const mentionsHealth = dumpLower.includes('health') || dumpLower.includes('sleep') || dumpLower.includes('exercise') || dumpLower.includes('tired');
      const mentionsMoney = dumpLower.includes('money') || dumpLower.includes('finance') || dumpLower.includes('pay') || dumpLower.includes('cost');

      // Find first few significant words from dump for context
      const dumpWords = dumpText.split(/\s+/).slice(0, 15).join(' ');
      const dumpSnippet = dumpWords.length > 50 ? dumpWords.substring(0, 50) + '...' : dumpWords;

      if (userMsg.includes('yes') || userMsg.includes('help') || userMsg.includes('break')) {
        if (mentionsWork) {
          response = `Let's break down what you wrote about work:\n\n1️⃣ What's the SINGLE most important work task?\n2️⃣ What's blocking you from starting it?\n3️⃣ What's a 5-minute version of that task?\n\nFor VARIANT brains, starting is the hardest part. Once you're in motion, momentum takes over.\n\nWhat's blocking you right now?`;
        } else if (mentionsRelationships) {
          response = `Sounds like relationships are on your mind. Let's untangle:\n\n1️⃣ What do you NEED from this situation?\n2️⃣ What can you CONTROL vs what can't you?\n3️⃣ What's ONE conversation you could have?\n\nOften the action is simpler than the spiral. What would feel like relief?`;
        } else {
          response = `Looking at what you dumped ("${dumpSnippet}"):\n\n1️⃣ What's the FIRST physical action? (Not "think about" - an actual VERB)\n2️⃣ Can you do it in 5 minutes? If not, make it smaller.\n3️⃣ What tool/resource do you need to start?\n\nMomentum > Motivation. What's your tiny first step?`;
        }
      } else if (userMsg.includes('overwhelm') || userMsg.includes('too much') || userMsg.includes('stressed') || userMsg.includes('anxiety')) {
        response = `Your brain dumped a lot - that means it was carrying a lot. That's heavy!\n\n🧘 Right now: 3 deep breaths. Seriously, do it.\n\n📝 From everything you wrote, what's the ONE thing that if handled would bring the most relief?\n\n⏱️ Give that ONE thing just 10 minutes. Set a timer.\n\nYou don't have to solve "${dumpSnippet}" all at once. What's the relief task?`;
      } else if (userMsg.includes('no') || userMsg.includes('later') || userMsg.includes('not now')) {
        response = `Totally valid. Your dump about "${dumpSnippet}" is saved.\n\nSometimes the dump itself is the action - getting it OUT of your head creates space.\n\nCome back when you're ready. 🤘`;
      } else if (userMsg.includes('priority') || userMsg.includes('first') || userMsg.includes('start')) {
        response = `From your dump, here's how to prioritize:\n\n🔥 URGENT + IMPORTANT: What has a deadline or consequence?\n⭐ IMPORTANT + NOT URGENT: What moves you toward your goals?\n⏰ URGENT + NOT IMPORTANT: Can someone else do this?\n🗑️ NEITHER: Delete it from your mental load.\n\nLooking at "${dumpSnippet}" - which category does your biggest concern fall into?`;
      } else {
        // Treat user input as action/response and be contextual
        response = `Got it! "${userInputOriginal}"\n\nRelating this to what you dumped ("${dumpSnippet}"):\n\n✅ Does this action address the ROOT cause or just a symptom?\n\n⏱️ When will you do this? (Vague = never for VARIANT brains)\n\n🎯 How will you know it's "done enough"?\n\nWant to break this down further, or are you ready to move?`;
      }

      const fullConversation = [...newConversation, { role: 'ai' as const, text: response }];
      setDumpConversation(fullConversation);

      // Save conversation to localStorage
      if (currentDumpId) {
        const dumps = JSON.parse(localStorage.getItem('venued_brain_dumps') || '[]');
        const updatedDumps = dumps.map((d: any) =>
          d.id === currentDumpId ? { ...d, conversation: fullConversation, action: dumpAction } : d
        );
        localStorage.setItem('venued_brain_dumps', JSON.stringify(updatedDumps));
        setSavedDumps(updatedDumps);
      }
    }, 800);
  };

  const handleIdeaFollowUp = () => {
    if (!ideaUserInput.trim()) return;

    // Add user message to conversation
    const newConversation = [...ideaConversation, { role: 'user' as const, text: ideaUserInput }];
    setIdeaConversation(newConversation);
    const userMsg = ideaUserInput.toLowerCase();
    setIdeaUserInput('');

    // Generate AI response based on context - using actual idea content
    setTimeout(() => {
      let response = '';
      const ideaContext = ideaName ? `"${ideaName}"` : 'your idea';
      const audienceContext = ideaAudience || 'your target audience';
      const problemContext = ideaProblem || '';

      if (userMsg.includes('validate') || userMsg.includes('1') || userMsg.includes('talk')) {
        response = `Great choice starting with validation for ${ideaContext}!\n\nHere's your validation script:\n\n📝 "Hey, I'm exploring a solution for [${problemContext || 'the problem you described'}]. Do you experience this? How do you currently handle it?"\n\n🎯 Talk to 3-5 people from ${audienceContext}. Don't pitch - just LISTEN.\n\n📊 Track: What words do THEY use? What frustrates them most?\n\nWho's the FIRST person you could reach out to today?`;
      } else if (userMsg.includes('prototype') || userMsg.includes('2') || userMsg.includes('build') || userMsg.includes('create')) {
        response = `Let's prototype ${ideaContext}! For ${audienceContext}, I'd suggest:\n\n🎨 SIMPLEST: A one-page Google Doc describing what it does\n\n📱 QUICK: A Figma/Canva mockup of the key screen\n\n🌐 BETTER: A simple landing page with "Sign up for early access"\n\nRemember: The goal isn't perfection - it's something you can SHOW people. What's your comfort level with these options?`;
      } else if (userMsg.includes('test') || userMsg.includes('3') || userMsg.includes('feedback')) {
        response = `Testing time for ${ideaContext}! Share your prototype with ${audienceContext} and ask:\n\n✅ "What's your first impression?"\n✅ "What's confusing?"\n✅ "Would you use this? Why/why not?"\n✅ "What would make this a MUST-HAVE?"\n\n⚠️ Warning: Friends will be nice. You want HONEST feedback from people who'd actually PAY.\n\nHow many people have you shown it to so far?`;
      } else if (userMsg.includes('competitor') || userMsg.includes('market') || userMsg.includes('research')) {
        response = `Let's research the competitive landscape for ${ideaContext}:\n\n🔍 Search: "${problemContext ? problemContext : 'your problem'} solution" - what comes up?\n\n📊 Check reviews of similar products - what do users complain about?\n\n💡 Your differentiation for ${audienceContext} might be:\n• Simpler/faster\n• More affordable\n• Better for a specific niche\n• Different business model\n\nWhat do you think makes YOUR approach different?`;
      } else if (userMsg.includes('no') || userMsg.includes('later') || userMsg.includes('not now')) {
        response = `No pressure! ${ideaContext} is saved in your SAVED tab whenever you're ready.\n\nSometimes stepping away helps clarity emerge. When you return, start with: "What ONE thing would move this forward?"\n\n🤘`;
      } else if (userMsg.includes('stuck') || userMsg.includes('overwhelm') || userMsg.includes('too much')) {
        response = `Feeling stuck on ${ideaContext}? That's normal!\n\n🧘 Take a breath. You don't need to figure it ALL out.\n\n📌 Pick just ONE thing:\n• Talk to ONE person from ${audienceContext}\n• Draw ONE sketch of your solution\n• Write ONE paragraph about ${problemContext || 'the problem'}\n\nWhat's the tiniest step you could take in the next 10 minutes?`;
      } else {
        // Use the user's actual input to craft a contextual response
        response = `Interesting point about "${ideaUserInput}"!\n\nThinking about ${ideaContext}${problemContext ? ` (solving: ${problemContext})` : ''} for ${audienceContext}:\n\n🤔 How does this relate to what your audience actually needs?\n\n💡 Could this be your unique angle - something competitors aren't doing?\n\n🎯 What would you need to test to know if this direction is right?\n\nTell me more about what you're thinking!`;
      }

      const fullConversation = [...newConversation, { role: 'ai' as const, text: response }];
      setIdeaConversation(fullConversation);

      // Save conversation to localStorage
      if (currentIdeaId) {
        const ideas = JSON.parse(localStorage.getItem('venued_ideas') || '[]');
        const updatedIdeas = ideas.map((i: any) =>
          i.id === currentIdeaId ? { ...i, conversation: fullConversation } : i
        );
        localStorage.setItem('venued_ideas', JSON.stringify(updatedIdeas));
        setSavedIdeas(updatedIdeas);
      }
    }, 800);
  };

  const handlePivotFollowUp = () => {
    if (!pivotUserInput.trim()) return;

    // Add user message to conversation
    const newConversation = [...pivotConversation, { role: 'user' as const, text: pivotUserInput }];
    setPivotConversation(newConversation);
    const userMsg = pivotUserInput.toLowerCase();
    setPivotUserInput('');

    // Generate AI response - using actual pivot content
    setTimeout(() => {
      let response = '';
      const leavingContext = pivotLeaving || 'what you\'re leaving behind';
      const headingContext = pivotHeading || 'your new direction';
      const whyContext = pivotWhy || '';

      if (userMsg.includes('90') || userMsg.includes('evaluate') || userMsg.includes('check')) {
        response = `At your 90-day checkpoint for pivoting to "${headingContext}", evaluate:\n\n📊 PROGRESS:\n• What concrete steps have you taken?\n• What's working? What isn't?\n• Are you closer to your vision?\n\n💭 FEELINGS:\n• Do you still feel excited about ${headingContext}?\n• What do you miss about ${leavingContext}?\n${whyContext ? `• Does your original "why" (${whyContext}) still resonate?` : ''}\n\n🎯 DECISION:\n• Continue full speed?\n• Adjust the approach?\n• Pivot again? (That's okay too!)\n\nWhat specific metrics will tell you this pivot is working?`;
      } else if (userMsg.includes('tell') || userMsg.includes('announce') || userMsg.includes('people')) {
        response = `Announcing your pivot from "${leavingContext}" to "${headingContext}":\n\n👥 WHO TO TELL:\n• 1 person who'll be your cheerleader\n• 1 person who'll give honest feedback\n• 1 person already in ${headingContext} space\n\n💬 SCRIPT:\n"I'm making a change. I'm moving from [${leavingContext}] toward [${headingContext}]${whyContext ? ` because ${whyContext}` : ''}. I'd love your support/advice."\n\n⚡ Do this BEFORE you feel ready. Public commitment creates momentum.\n\nWho's your first call?`;
      } else if (userMsg.includes('skill') || userMsg.includes('learn') || userMsg.includes('need')) {
        response = `Skills for your pivot to "${headingContext}":\n\n📝 LIST:\n• What skills does ${headingContext} require that you don't have yet?\n• What skills from ${leavingContext} can you transfer?\n• What's the ONE skill that would unlock the most?\n\n🎯 ACTION:\n• YouTube tutorial today\n• Book/course this week\n• Find a mentor this month\n\nYou don't need ALL the skills before starting. What's the most crucial one?`;
      } else if (userMsg.includes('scared') || userMsg.includes('afraid') || userMsg.includes('uncertain') || userMsg.includes('doubt')) {
        response = `Fear about pivoting from "${leavingContext}" to "${headingContext}" is NORMAL.\n\n🧠 Your brain is trying to protect you. Thank it, then remind it:\n\n✅ You've handled hard things before\n✅ Staying stuck has its own risks\n${whyContext ? `✅ Your "why" is real: ${whyContext}` : '✅ You have good reasons for this change'}\n✅ Pivots can be reversed if needed\n\n💪 Courage isn't the absence of fear - it's action DESPITE fear.\n\nWhat's the worst that could realistically happen? And could you handle it?`;
      } else if (userMsg.includes('no') || userMsg.includes('later') || userMsg.includes('not now')) {
        response = `No rush. Your pivot reflection (${leavingContext} → ${headingContext}) is saved.\n\nMajor changes deserve processing time. When you're ready, I'll be here.\n\n🤘`;
      } else if (userMsg.includes('stuck') || userMsg.includes('overwhelm')) {
        response = `Overwhelmed by your pivot to "${headingContext}"?\n\n🧘 Breathe. You don't have to figure it all out today.\n\n📌 ONE thing for each:\n• TODAY: Write down why ${headingContext} matters to you\n• THIS WEEK: Have one conversation about your new direction\n• THIS MONTH: Take one small action toward ${headingContext}\n\nWhat's the tiniest step that still feels meaningful?`;
      } else {
        // Context-aware response using user's actual input
        response = `Interesting thought about "${pivotUserInput}"!\n\nConsidering your pivot (${leavingContext} → ${headingContext})${whyContext ? ` driven by: ${whyContext}` : ''}:\n\n🤔 How does this connect to your new direction?\n\n💡 Is this something to explore, or something to release?\n\n🎯 What action does this thought point you toward?\n\nI'm curious - tell me more about where this is coming from.`;
      }

      const fullConversation = [...newConversation, { role: 'ai' as const, text: response }];
      setPivotConversation(fullConversation);

      // Save conversation to localStorage
      if (currentPivotId) {
        const pivots = JSON.parse(localStorage.getItem('venued_pivots') || '[]');
        const updatedPivots = pivots.map((p: any) =>
          p.id === currentPivotId ? { ...p, conversation: fullConversation } : p
        );
        localStorage.setItem('venued_pivots', JSON.stringify(updatedPivots));
        setSavedPivots(updatedPivots);
      }
    }, 800);
  };

  const handleUpdateIdea = () => {
    if (!editingIdea) return;

    const ideas = savedIdeas.map(i =>
      i.id === editingIdea.id ? editingIdea : i
    );
    localStorage.setItem('venued_ideas', JSON.stringify(ideas));
    setSavedIdeas(ideas);
    setEditingIdea(null);
  };

  const handleUpdatePivot = () => {
    if (!editingPivot) return;

    const pivots = savedPivots.map(p =>
      p.id === editingPivot.id ? editingPivot : p
    );
    localStorage.setItem('venued_pivots', JSON.stringify(pivots));
    setSavedPivots(pivots);
    setEditingPivot(null);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'dump', label: 'DUMP', color: '#00F0E9' },
          { id: 'ideas', label: 'IDEAS', color: '#FF008E' },
          { id: 'pivots', label: 'PIVOTS', color: '#00A29D' },
          { id: 'saved', label: `SAVED (${savedDumps.length + savedIdeas.length + savedPivots.length})`, color: '#C9005C' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
              activeTab === tab.id
                ? 'text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            style={activeTab === tab.id ? { backgroundColor: tab.color } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dump' && (
        <div className="p-6 rounded-xl border-2 border-neon-cyan/30 bg-neon-cyan/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Brain Dump</h3>
            <div className="flex gap-2">
              {[2, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  onClick={() => startTimer(mins * 60)}
                  className="px-3 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20"
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {isTimerActive && (
            <div className="text-2xl font-bold text-neon-cyan mb-4 text-center">
              {formatTime(timeLeft)} - GO!
            </div>
          )}

          <textarea
            value={dumpText}
            onChange={(e) => setDumpText(e.target.value)}
            placeholder="Just start typing. Don't think, just dump everything out of your brain..."
            className="w-full h-48 px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none resize-none mb-4"
          />

          <button
            onClick={handleSaveDump}
            disabled={!dumpText.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neon-cyan text-black font-bold hover:bg-white transition-all disabled:opacity-50"
          >
            {dumpSaved ? '✓ Saved!' : '💾 Save Dump'}
          </button>

          {aiInsight && (
            <div className="mt-4 p-4 rounded-lg bg-[#3d3d3d]/60 border border-neon-cyan/30">
              <p className="text-sm font-semibold text-neon-cyan mb-2">🧠 AI Insight:</p>
              <p className="text-white text-sm whitespace-pre-line mb-4">{aiInsight}</p>

              {/* Conversation history */}
              {dumpConversation.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-neon-cyan/20 pt-4">
                  {dumpConversation.map((msg, idx) => (
                    <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <span className={`inline-block px-3 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-neon-cyan/20 text-neon-cyan'
                          : 'bg-white/10 text-white'
                      }`}>
                        {msg.role === 'ai' && <span className="text-neon-cyan font-semibold">🧠 </span>}
                        <span className="whitespace-pre-line">{msg.text}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up input */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={dumpUserInput}
                  onChange={(e) => setDumpUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDumpFollowUp()}
                  placeholder="Reply to AI... (your action, or ask a question)"
                  className="flex-1 px-3 py-2 bg-[#3d3d3d]/80 border border-neon-cyan/30 rounded-lg text-white text-sm placeholder-gray-500 focus:border-neon-cyan focus:outline-none"
                />
                <button
                  onClick={handleDumpFollowUp}
                  disabled={!dumpUserInput.trim()}
                  className="px-4 py-2 bg-neon-cyan text-black font-semibold rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ideas' && (
        <div className="p-6 rounded-xl border-2 border-magenta/30 bg-magenta/10">
          <h3 className="text-lg font-bold text-white mb-4">Capture an Idea</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={ideaName}
              onChange={(e) => setIdeaName(e.target.value)}
              placeholder="Idea name"
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
            />
            <textarea
              value={ideaProblem}
              onChange={(e) => setIdeaProblem(e.target.value)}
              placeholder="What problem does it solve?"
              className="w-full h-24 px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none resize-none"
            />
            <input
              type="text"
              value={ideaAudience}
              onChange={(e) => setIdeaAudience(e.target.value)}
              placeholder="Who's it for?"
              className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
            />
            <button
              onClick={handleSaveIdea}
              disabled={!ideaName.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-magenta text-black font-bold hover:bg-white transition-all disabled:opacity-50"
            >
              {ideaSaved ? '✓ Saved!' : '💾 Save Idea'}
            </button>
          </div>
          {ideaAiSuggestion && (
            <div className="mt-4 p-4 rounded-lg bg-[#3d3d3d]/60 border border-magenta/30">
              <p className="text-sm font-semibold text-magenta mb-2">🧠 AI Suggestion:</p>
              <p className="text-white text-sm whitespace-pre-line">{ideaAiSuggestion}</p>

              {/* Conversation history */}
              {ideaConversation.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-magenta/20 pt-4">
                  {ideaConversation.map((msg, idx) => (
                    <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <span className={`inline-block px-3 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-magenta/20 text-magenta'
                          : 'bg-white/10 text-white'
                      }`}>
                        {msg.role === 'ai' && <span className="text-magenta font-semibold">🧠 </span>}
                        <span className="whitespace-pre-line">{msg.text}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up input */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={ideaUserInput}
                  onChange={(e) => setIdeaUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleIdeaFollowUp()}
                  placeholder="Reply to AI... (yes, no, or ask a question)"
                  className="flex-1 px-3 py-2 bg-[#3d3d3d]/80 border border-magenta/30 rounded-lg text-white text-sm placeholder-gray-500 focus:border-magenta focus:outline-none"
                />
                <button
                  onClick={handleIdeaFollowUp}
                  disabled={!ideaUserInput.trim()}
                  className="px-4 py-2 bg-magenta text-black font-semibold rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pivots' && (
        <div className="p-6 rounded-xl border-2 border-white/30 bg-dark-grey-azure/30">
          <h3 className="text-lg font-bold text-white mb-4">Reflect on a Pivot</h3>
          <div className="space-y-4">
            <textarea
              value={pivotLeaving}
              onChange={(e) => setPivotLeaving(e.target.value)}
              placeholder="What I'm leaving behind..."
              className="w-full h-20 px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/50 focus:outline-none resize-none"
            />
            <textarea
              value={pivotHeading}
              onChange={(e) => setPivotHeading(e.target.value)}
              placeholder="Where I'm heading..."
              className="w-full h-20 px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/50 focus:outline-none resize-none"
            />
            <textarea
              value={pivotWhy}
              onChange={(e) => setPivotWhy(e.target.value)}
              placeholder="Why this is important..."
              className="w-full h-20 px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/50 focus:outline-none resize-none"
            />
            <button
              onClick={handleSavePivot}
              disabled={!pivotLeaving.trim() && !pivotHeading.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              {pivotSaved ? '✓ Saved!' : '💾 Save Pivot'}
            </button>
          </div>
          {pivotAiSuggestion && (
            <div className="mt-4 p-4 rounded-lg bg-[#3d3d3d]/60 border border-white/30">
              <p className="text-sm font-semibold text-white mb-2">🧠 AI Suggestion:</p>
              <p className="text-white text-sm whitespace-pre-line">{pivotAiSuggestion}</p>

              {/* Conversation history */}
              {pivotConversation.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-white/20 pt-4">
                  {pivotConversation.map((msg, idx) => (
                    <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <span className={`inline-block px-3 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-neon-cyan/20 text-neon-cyan'
                          : 'bg-white/10 text-white'
                      }`}>
                        {msg.role === 'ai' && <span className="text-neon-cyan font-semibold">🧠 </span>}
                        <span className="whitespace-pre-line">{msg.text}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up input */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={pivotUserInput}
                  onChange={(e) => setPivotUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePivotFollowUp()}
                  placeholder="Reply to AI... (yes, no, or ask a question)"
                  className="flex-1 px-3 py-2 bg-[#3d3d3d]/80 border border-white/30 rounded-lg text-white text-sm placeholder-gray-500 focus:border-neon-cyan focus:outline-none"
                />
                <button
                  onClick={handlePivotFollowUp}
                  disabled={!pivotUserInput.trim()}
                  className="px-4 py-2 bg-neon-cyan text-black font-semibold rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Your Saved Items</h3>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All', count: savedDumps.length + savedIdeas.length + savedPivots.length },
              { id: 'dumps', label: 'Brain Dumps', count: savedDumps.length, color: '#00F0E9' },
              { id: 'ideas', label: 'Ideas', count: savedIdeas.length, color: '#FF008E' },
              { id: 'pivots', label: 'Pivots', count: savedPivots.length, color: '#00A29D' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSavedFilter(filter.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                  savedFilter === filter.id
                    ? 'text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                style={savedFilter === filter.id ? { backgroundColor: filter.color || '#C9005C' } : {}}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Empty State */}
          {(savedFilter === 'all' && savedDumps.length + savedIdeas.length + savedPivots.length === 0) ||
           (savedFilter === 'dumps' && savedDumps.length === 0) ||
           (savedFilter === 'ideas' && savedIdeas.length === 0) ||
           (savedFilter === 'pivots' && savedPivots.length === 0) ? (
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-center">
              <p className="text-gray-400">No saved items yet</p>
              <p className="text-sm text-gray-500">Start capturing your thoughts in the DUMP, IDEAS, or PIVOTS tabs!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Brain Dumps */}
              {(savedFilter === 'all' || savedFilter === 'dumps') && savedDumps.map((dump: any) => (
                <button
                  key={`dump-${dump.id}`}
                  onClick={() => setEditingDump({...dump})}
                  className="w-full text-left p-4 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 hover:border-neon-cyan/60 hover:bg-neon-cyan/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-neon-cyan/20 text-neon-cyan rounded mb-2">BRAIN DUMP</span>
                      <p className="text-sm text-white line-clamp-2">{dump.content}</p>
                      {dump.conversation && dump.conversation.length > 0 && (
                        <p className="text-xs text-neon-cyan mt-2">💬 {dump.conversation.length} messages</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(dump.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span
                      onClick={(e) => { e.stopPropagation(); handleDeleteDump(dump.id); }}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      ×
                    </span>
                  </div>
                </button>
              ))}

              {/* Ideas */}
              {(savedFilter === 'all' || savedFilter === 'ideas') && savedIdeas.map((idea: any) => (
                <button
                  key={`idea-${idea.id}`}
                  onClick={() => setEditingIdea({...idea})}
                  className="w-full text-left p-4 rounded-xl border border-magenta/30 bg-magenta/10 hover:border-magenta/60 hover:bg-magenta/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-magenta/20 text-magenta rounded mb-2">IDEA</span>
                      <h4 className="font-bold text-white">{idea.name}</h4>
                      {idea.problem && <p className="text-sm text-gray-300 mt-1 line-clamp-1">{idea.problem}</p>}
                      {idea.audience && <p className="text-xs text-gray-400 mt-1">For: {idea.audience}</p>}
                      {idea.conversation && idea.conversation.length > 0 && (
                        <p className="text-xs text-magenta mt-2">💬 {idea.conversation.length} messages</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(idea.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span
                      onClick={(e) => { e.stopPropagation(); handleDeleteIdea(idea.id); }}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      ×
                    </span>
                  </div>
                </button>
              ))}

              {/* Pivots */}
              {(savedFilter === 'all' || savedFilter === 'pivots') && savedPivots.map((pivot: any) => (
                <button
                  key={`pivot-${pivot.id}`}
                  onClick={() => setEditingPivot({...pivot})}
                  className="w-full text-left p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:border-teal-500/60 hover:bg-teal-500/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-teal-500/20 text-teal-400 rounded mb-2">PIVOT</span>
                      {pivot.heading && <h4 className="font-bold text-white">{pivot.heading}</h4>}
                      {pivot.leaving && <p className="text-sm text-gray-300 mt-1">From: {pivot.leaving}</p>}
                      {pivot.why && <p className="text-xs text-gray-400 mt-1 line-clamp-1">Why: {pivot.why}</p>}
                      {pivot.conversation && pivot.conversation.length > 0 && (
                        <p className="text-xs text-teal-400 mt-2">💬 {pivot.conversation.length} messages</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(pivot.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span
                      onClick={(e) => { e.stopPropagation(); handleDeletePivot(pivot.id); }}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      ×
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Dump Modal */}
      {editingDump && (
        <div className="fixed inset-0 bg-black/90 z-[100] overflow-y-auto">
          <div className="min-h-full pt-20 pb-8 px-4 flex items-start justify-center">
            <div className="max-w-lg w-full rounded-2xl border-2 border-neon-cyan bg-dark-grey-azure p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-supernova text-neon-cyan">Brain Dump</h2>
                <button
                  onClick={() => setEditingDump(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Dump Content</label>
                  <textarea
                    value={editingDump.content}
                    onChange={(e) => setEditingDump({...editingDump, content: e.target.value})}
                    rows={5}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none resize-none"
                  />
                </div>

                {editingDump.aiInsight && (
                  <div className="p-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                    <p className="text-sm font-semibold text-neon-cyan mb-2">🧠 AI Insight:</p>
                    <p className="text-white text-sm">{editingDump.aiInsight}</p>
                  </div>
                )}

                {editingDump.conversation && editingDump.conversation.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <p className="text-sm font-semibold text-neon-cyan">💬 Conversation History:</p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {editingDump.conversation.map((msg: any, idx: number) => (
                        <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
                          <span className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${
                            msg.role === 'user'
                              ? 'bg-neon-cyan/20 text-neon-cyan'
                              : 'bg-white/10 text-white'
                          }`}>
                            {msg.role === 'ai' && <span className="text-neon-cyan font-semibold">🧠 </span>}
                            <span className="whitespace-pre-line">{msg.text}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingDump(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const dumps = savedDumps.map(d =>
                      d.id === editingDump.id ? editingDump : d
                    );
                    localStorage.setItem('venued_brain_dumps', JSON.stringify(dumps));
                    setSavedDumps(dumps);
                    setEditingDump(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-neon-cyan text-black font-bold hover:bg-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Idea Modal */}
      {editingIdea && (
        <div className="fixed inset-0 bg-black/90 z-[100] overflow-y-auto">
          <div className="min-h-full pt-20 pb-8 px-4 flex items-start justify-center">
            <div className="max-w-lg w-full rounded-2xl border-2 border-magenta bg-dark-grey-azure p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-supernova text-magenta">Edit Idea</h2>
                <button
                  onClick={() => setEditingIdea(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Idea Name</label>
                  <input
                    type="text"
                    value={editingIdea.name}
                    onChange={(e) => setEditingIdea({...editingIdea, name: e.target.value})}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Problem it solves</label>
                  <textarea
                    value={editingIdea.problem || ''}
                    onChange={(e) => setEditingIdea({...editingIdea, problem: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Target audience</label>
                  <input
                    type="text"
                    value={editingIdea.audience || ''}
                    onChange={(e) => setEditingIdea({...editingIdea, audience: e.target.value})}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                  />
                </div>

                {/* Conversation History */}
                {editingIdea.conversation && editingIdea.conversation.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <label className="block text-sm font-semibold text-magenta mb-3">💬 Conversation History</label>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {editingIdea.conversation.map((msg: any, idx: number) => (
                        <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
                          <span className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${
                            msg.role === 'user'
                              ? 'bg-magenta/20 text-magenta'
                              : 'bg-white/10 text-white'
                          }`}>
                            {msg.role === 'ai' && <span className="text-magenta font-semibold">🧠 </span>}
                            <span className="whitespace-pre-line">{msg.text}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingIdea(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateIdea}
                  className="flex-1 py-3 rounded-xl bg-magenta text-black font-bold hover:bg-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pivot Modal */}
      {editingPivot && (
        <div className="fixed inset-0 bg-black/90 z-[100] overflow-y-auto">
          <div className="min-h-full pt-20 pb-8 px-4 flex items-start justify-center">
            <div className="max-w-lg w-full rounded-2xl border-2 border-neon-cyan bg-dark-grey-azure p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-supernova text-neon-cyan">Edit Pivot</h2>
                <button
                  onClick={() => setEditingPivot(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">What I'm leaving behind</label>
                  <textarea
                    value={editingPivot.leaving || ''}
                    onChange={(e) => setEditingPivot({...editingPivot, leaving: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Where I'm heading</label>
                  <textarea
                    value={editingPivot.heading || ''}
                    onChange={(e) => setEditingPivot({...editingPivot, heading: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Why this matters</label>
                  <textarea
                    value={editingPivot.why || ''}
                    onChange={(e) => setEditingPivot({...editingPivot, why: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none resize-none"
                  />
                </div>

                {/* Conversation History */}
                {editingPivot.conversation && editingPivot.conversation.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <label className="block text-sm font-semibold text-neon-cyan mb-3">💬 Conversation History</label>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {editingPivot.conversation.map((msg: any, idx: number) => (
                        <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
                          <span className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${
                            msg.role === 'user'
                              ? 'bg-neon-cyan/20 text-neon-cyan'
                              : 'bg-white/10 text-white'
                          }`}>
                            {msg.role === 'ai' && <span className="text-neon-cyan font-semibold">🧠 </span>}
                            <span className="whitespace-pre-line">{msg.text}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingPivot(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePivot}
                  className="flex-1 py-3 rounded-xl bg-neon-cyan text-black font-bold hover:bg-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TuneUpModule() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [taskName, setTaskName] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  // Hyperfocus Logging State
  const [showHyperfocusForm, setShowHyperfocusForm] = useState(false);
  const [hyperfocusActivity, setHyperfocusActivity] = useState('');
  const [hyperfocusTrigger, setHyperfocusTrigger] = useState('');
  const [hyperfocusDuration, setHyperfocusDuration] = useState('');
  const [hyperfocusNotes, setHyperfocusNotes] = useState('');
  const [hyperfocusLogs, setHyperfocusLogs] = useState<any[]>([]);
  const [editingHyperfocus, setEditingHyperfocus] = useState<any>(null);

  // Time Blindness Estimation State
  const [showTimeEstimator, setShowTimeEstimator] = useState(false);
  const [estimatorTask, setEstimatorTask] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [estimatorRunning, setEstimatorRunning] = useState(false);
  const [estimatorStartTime, setEstimatorStartTime] = useState<number | null>(null);
  const [actualTime, setActualTime] = useState<number | null>(null);
  const [estimatorElapsed, setEstimatorElapsed] = useState(0);
  const [timeEstimates, setTimeEstimates] = useState<any[]>([]);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);

  // Load saved data
  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('venued_focus_sessions') || '[]');
    setRecentSessions(sessions.slice(0, 5));
    setHyperfocusLogs(JSON.parse(localStorage.getItem('venued_hyperfocus_logs') || '[]'));
    setTimeEstimates(JSON.parse(localStorage.getItem('venued_time_estimates') || '[]'));

    // Calculate today's stats
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s: any) => s.date === today);
    setTodayMinutes(todaySessions.reduce((sum: number, s: any) => sum + s.duration, 0));
    setTotalSessions(sessions.length);
  }, []);

  // Estimator timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (estimatorRunning && estimatorStartTime) {
      interval = setInterval(() => {
        setEstimatorElapsed(Math.floor((Date.now() - estimatorStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [estimatorRunning, estimatorStartTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Session complete!
          setIsRunning(false);
          setSessionComplete(true);

          // Log the session
          const sessions = JSON.parse(localStorage.getItem('venued_focus_sessions') || '[]');
          sessions.unshift({
            id: Date.now().toString(),
            taskName: taskName || 'Focus Session',
            duration: selectedDuration,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem('venued_focus_sessions', JSON.stringify(sessions.slice(0, 100)));

          setTotalSessions(prev => prev + 1);
          setTodayMinutes(prev => prev + selectedDuration);
          setRecentSessions(sessions.slice(0, 5));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, selectedDuration, taskName]);

  const handleStart = () => {
    setSessionComplete(false);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(selectedDuration);
    setSeconds(0);
    setSessionComplete(false);
  };

  const handleDurationChange = (mins: number) => {
    setSelectedDuration(mins);
    if (!isRunning) {
      setMinutes(mins);
      setSeconds(0);
    }
  };

  // Hyperfocus handlers
  const handleSaveHyperfocus = () => {
    if (!hyperfocusActivity.trim()) return;
    const log = {
      id: Date.now().toString(),
      activity: hyperfocusActivity,
      trigger: hyperfocusTrigger,
      duration: hyperfocusDuration,
      notes: hyperfocusNotes,
      timestamp: new Date().toISOString(),
    };
    const logs = [log, ...hyperfocusLogs].slice(0, 50);
    localStorage.setItem('venued_hyperfocus_logs', JSON.stringify(logs));
    setHyperfocusLogs(logs);
    setHyperfocusActivity('');
    setHyperfocusTrigger('');
    setHyperfocusDuration('');
    setHyperfocusNotes('');
    setShowHyperfocusForm(false);
  };

  const handleUpdateHyperfocus = () => {
    if (!editingHyperfocus) return;
    const logs = hyperfocusLogs.map(l => l.id === editingHyperfocus.id ? editingHyperfocus : l);
    localStorage.setItem('venued_hyperfocus_logs', JSON.stringify(logs));
    setHyperfocusLogs(logs);
    setEditingHyperfocus(null);
  };

  const handleDeleteHyperfocus = (id: string) => {
    const logs = hyperfocusLogs.filter(l => l.id !== id);
    localStorage.setItem('venued_hyperfocus_logs', JSON.stringify(logs));
    setHyperfocusLogs(logs);
  };

  // Time Estimator handlers
  const handleStartEstimator = () => {
    if (!estimatorTask.trim() || !estimatedTime) return;
    setEstimatorRunning(true);
    setEstimatorStartTime(Date.now());
    setEstimatorElapsed(0);
    setActualTime(null);
  };

  const handleStopEstimator = () => {
    setEstimatorRunning(false);
    const elapsed = Math.floor((Date.now() - (estimatorStartTime || 0)) / 60000); // in minutes
    setActualTime(elapsed);

    // Save estimate
    const estimate = {
      id: Date.now().toString(),
      task: estimatorTask,
      estimated: parseInt(estimatedTime),
      actual: elapsed,
      accuracy: Math.round((parseInt(estimatedTime) / Math.max(elapsed, 1)) * 100),
      timestamp: new Date().toISOString(),
    };
    const estimates = [estimate, ...timeEstimates].slice(0, 50);
    localStorage.setItem('venued_time_estimates', JSON.stringify(estimates));
    setTimeEstimates(estimates);
  };

  const handleResetEstimator = () => {
    setEstimatorRunning(false);
    setEstimatorStartTime(null);
    setEstimatorElapsed(0);
    setActualTime(null);
    setEstimatorTask('');
    setEstimatedTime('');
  };

  const handleUpdateEstimate = () => {
    if (!editingEstimate) return;
    const estimates = timeEstimates.map(e => e.id === editingEstimate.id ? editingEstimate : e);
    localStorage.setItem('venued_time_estimates', JSON.stringify(estimates));
    setTimeEstimates(estimates);
    setEditingEstimate(null);
  };

  const handleDeleteEstimate = (id: string) => {
    const estimates = timeEstimates.filter(e => e.id !== id);
    localStorage.setItem('venued_time_estimates', JSON.stringify(estimates));
    setTimeEstimates(estimates);
  };

  const formatElapsed = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${String(s).padStart(2, '0')}`;
  };

  // Calculate average accuracy
  const avgAccuracy = timeEstimates.length > 0
    ? Math.round(timeEstimates.reduce((sum, e) => sum + e.accuracy, 0) / timeEstimates.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-magenta bg-magenta/10 text-center">
          <p className="text-xs text-gray-400">Today</p>
          <p className="text-xl font-bold text-magenta">{todayMinutes}m</p>
        </div>
        <div className="p-4 rounded-xl border border-neon-cyan bg-neon-cyan/10 text-center">
          <p className="text-xs text-gray-400">Sessions</p>
          <p className="text-xl font-bold text-neon-cyan">{totalSessions}</p>
        </div>
        <div className="p-4 rounded-xl border border-vivid-yellow-green bg-vivid-yellow-green/10 text-center">
          <p className="text-xs text-gray-400">Streak</p>
          <p className="text-xl font-bold text-vivid-yellow-green">🤘</p>
        </div>
      </div>

      {/* Task Input */}
      <div className="p-4 rounded-xl border-2 border-white/10 bg-white/5">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="What are you focusing on? (optional)"
          className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
          disabled={isRunning}
        />
      </div>

      {/* Duration Presets */}
      <div className="flex justify-center gap-2 flex-wrap">
        {[5, 15, 25, 45, 60].map((mins) => (
          <button
            key={mins}
            onClick={() => handleDurationChange(mins)}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedDuration === mins
                ? 'bg-magenta text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            } disabled:opacity-50`}
          >
            {mins}m
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="p-8 rounded-xl border-2 border-magenta/30 bg-gradient-to-br from-magenta/10 to-neon-cyan/10 text-center">
        <div className={`text-7xl font-supernova text-white mb-6 ${isRunning ? 'animate-pulse' : ''}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {sessionComplete && (
          <div className="mb-6 p-4 rounded-lg bg-vivid-yellow-green/20 border border-vivid-yellow-green/50">
            <p className="text-vivid-yellow-green font-bold text-lg">🤘 Session Complete!</p>
            <p className="text-white text-sm">You focused for {selectedDuration} minutes. Great work!</p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-10 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-magenta to-neon-cyan text-black hover:shadow-[0_0_40px_rgba(255,0,142,0.6)] transition-all"
            >
              {sessionComplete ? '🤘 Go Again!' : '▶ Start Focus'}
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsRunning(false)}
                className="px-8 py-4 rounded-full font-bold bg-neon-cyan text-black hover:bg-white transition-all"
              >
                ⏸ Pause
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-4 rounded-full font-bold bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 transition-all"
              >
                ⏹ Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="p-4 rounded-xl border-2 border-white/10 bg-white/5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {recentSessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-[#3d3d3d]/60">
                <span className="text-white text-sm">{session.taskName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-magenta font-semibold">{session.duration}m</span>
                  <span className="text-xs text-gray-500">
                    {new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ HYPERFOCUS LOGGING SECTION ============ */}
      <div className="p-4 rounded-xl border-2 border-vivid-pink/30 bg-vivid-pink/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-vivid-pink">🔥 Hyperfocus Log</h3>
          <button
            onClick={() => setShowHyperfocusForm(!showHyperfocusForm)}
            className="px-4 py-2 rounded-lg bg-vivid-pink/20 text-vivid-pink font-semibold hover:bg-vivid-pink/30 transition-all text-sm"
          >
            {showHyperfocusForm ? 'Cancel' : '+ Log Session'}
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">Track past hyperfocus sessions to understand your patterns</p>

        {/* Hyperfocus Form */}
        {showHyperfocusForm && (
          <div className="space-y-3 mb-4 p-4 rounded-lg bg-[#3d3d3d]/60">
            <div>
              <label className="block text-xs font-semibold text-white mb-1">What did you focus on? *</label>
              <input
                type="text"
                value={hyperfocusActivity}
                onChange={(e) => setHyperfocusActivity(e.target.value)}
                placeholder="e.g., Coding, Research, Creative project..."
                className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-vivid-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white mb-1">What triggered it?</label>
              <input
                type="text"
                value={hyperfocusTrigger}
                onChange={(e) => setHyperfocusTrigger(e.target.value)}
                placeholder="e.g., Deadline pressure, New idea, Interesting problem..."
                className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-vivid-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white mb-1">How long? (approx)</label>
              <input
                type="text"
                value={hyperfocusDuration}
                onChange={(e) => setHyperfocusDuration(e.target.value)}
                placeholder="e.g., 3 hours, All afternoon..."
                className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-vivid-pink focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white mb-1">Notes / Insights</label>
              <textarea
                value={hyperfocusNotes}
                onChange={(e) => setHyperfocusNotes(e.target.value)}
                placeholder="What did you notice? How did you feel? What interrupted you?"
                rows={2}
                className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-vivid-pink focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={handleSaveHyperfocus}
              disabled={!hyperfocusActivity.trim()}
              className="w-full py-2 rounded-lg bg-vivid-pink text-black font-semibold hover:bg-white transition-all disabled:opacity-50"
            >
              Save Log
            </button>
          </div>
        )}

        {/* Hyperfocus Logs List */}
        {hyperfocusLogs.length > 0 && (
          <div className="space-y-2">
            {hyperfocusLogs.slice(0, 5).map((log: any) => (
              <button
                key={log.id}
                onClick={() => setEditingHyperfocus({...log})}
                className="w-full text-left p-3 rounded-lg bg-[#3d3d3d]/60 hover:bg-[#3d3d3d]/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{log.activity}</p>
                    {log.duration && <p className="text-xs text-vivid-pink">{log.duration}</p>}
                    {log.trigger && <p className="text-xs text-gray-400">Trigger: {log.trigger}</p>}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Hyperfocus Modal */}
      {editingHyperfocus && (
        <div className="fixed inset-0 bg-black/90 z-[100] overflow-y-auto">
          <div className="min-h-full pt-20 pb-8 px-4 flex items-start justify-center">
            <div className="max-w-md w-full rounded-2xl border-2 border-vivid-pink bg-dark-grey-azure p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-supernova text-vivid-pink">Edit Hyperfocus Log</h2>
                <button onClick={() => setEditingHyperfocus(null)} className="p-2 text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Activity</label>
                  <input
                    type="text"
                    value={editingHyperfocus.activity}
                    onChange={(e) => setEditingHyperfocus({...editingHyperfocus, activity: e.target.value})}
                    className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-vivid-pink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Trigger</label>
                  <input
                    type="text"
                    value={editingHyperfocus.trigger || ''}
                    onChange={(e) => setEditingHyperfocus({...editingHyperfocus, trigger: e.target.value})}
                    className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-vivid-pink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingHyperfocus.duration || ''}
                    onChange={(e) => setEditingHyperfocus({...editingHyperfocus, duration: e.target.value})}
                    className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-vivid-pink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Notes</label>
                  <textarea
                    value={editingHyperfocus.notes || ''}
                    onChange={(e) => setEditingHyperfocus({...editingHyperfocus, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-vivid-pink focus:outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { handleDeleteHyperfocus(editingHyperfocus.id); setEditingHyperfocus(null); }}
                  className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10"
                >
                  Delete
                </button>
                <button
                  onClick={handleUpdateHyperfocus}
                  className="flex-1 py-2 rounded-lg bg-vivid-pink text-black font-semibold hover:bg-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ TIME BLINDNESS ESTIMATION SECTION ============ */}
      <div className="p-4 rounded-xl border-2 border-electric-purple/30 bg-electric-purple/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-electric-purple">⏱️ Time Blindness Trainer</h3>
          {avgAccuracy > 0 && (
            <span className="px-3 py-1 rounded-full bg-electric-purple/20 text-electric-purple text-sm font-semibold">
              Avg: {avgAccuracy}% accurate
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-4">Improve time estimation by tracking estimated vs actual time</p>

        {/* Estimator Interface */}
        <div className="p-4 rounded-lg bg-[#3d3d3d]/60 mb-4">
          {!estimatorRunning && actualTime === null ? (
            // Setup Phase
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">What task are you about to do?</label>
                <input
                  type="text"
                  value={estimatorTask}
                  onChange={(e) => setEstimatorTask(e.target.value)}
                  placeholder="e.g., Write email, Complete form, Read article..."
                  className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-electric-purple focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white mb-1">How long do you THINK it will take? (minutes)</label>
                <input
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="e.g., 15"
                  min="1"
                  className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-electric-purple focus:outline-none"
                />
              </div>
              <button
                onClick={handleStartEstimator}
                disabled={!estimatorTask.trim() || !estimatedTime}
                className="w-full py-3 rounded-lg bg-electric-purple text-black font-bold hover:bg-white transition-all disabled:opacity-50"
              >
                Start Timer & Do Task
              </button>
            </div>
          ) : estimatorRunning ? (
            // Running Phase
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Doing: {estimatorTask}</p>
              <p className="text-4xl font-supernova text-electric-purple mb-2">{formatElapsed(estimatorElapsed)}</p>
              <p className="text-sm text-gray-400 mb-4">Estimated: {estimatedTime} minutes</p>
              <button
                onClick={handleStopEstimator}
                className="px-8 py-3 rounded-lg bg-vivid-yellow-green text-black font-bold hover:bg-white transition-all"
              >
                ✓ Done!
              </button>
            </div>
          ) : (
            // Results Phase
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Task: {estimatorTask}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-electric-purple/20">
                  <p className="text-xs text-gray-400">Estimated</p>
                  <p className="text-2xl font-bold text-electric-purple">{estimatedTime}m</p>
                </div>
                <div className="p-3 rounded-lg bg-vivid-yellow-green/20">
                  <p className="text-xs text-gray-400">Actual</p>
                  <p className="text-2xl font-bold text-vivid-yellow-green">{actualTime}m</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg mb-4 ${
                parseInt(estimatedTime) >= (actualTime || 0) ? 'bg-vivid-yellow-green/20' : 'bg-vivid-pink/20'
              }`}>
                <p className="text-sm font-semibold">
                  {parseInt(estimatedTime) >= (actualTime || 0)
                    ? `🎉 Nice! You overestimated by ${parseInt(estimatedTime) - (actualTime || 0)} minutes`
                    : `⏰ Learning moment! Task took ${(actualTime || 0) - parseInt(estimatedTime)} more minutes than expected`
                  }
                </p>
              </div>
              <button
                onClick={handleResetEstimator}
                className="px-8 py-3 rounded-lg bg-electric-purple text-black font-bold hover:bg-white transition-all"
              >
                Try Another Task
              </button>
            </div>
          )}
        </div>

        {/* Time Estimates History */}
        {timeEstimates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-400">Recent Estimates</h4>
            {timeEstimates.slice(0, 5).map((est: any) => (
              <button
                key={est.id}
                onClick={() => setEditingEstimate({...est})}
                className="w-full text-left p-3 rounded-lg bg-[#3d3d3d]/60 hover:bg-[#3d3d3d]/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{est.task}</p>
                    <p className="text-xs text-gray-400">
                      Est: {est.estimated}m → Actual: {est.actual}m
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    est.accuracy >= 80 ? 'bg-vivid-yellow-green/20 text-vivid-yellow-green' :
                    est.accuracy >= 50 ? 'bg-neon-cyan/20 text-neon-cyan' :
                    'bg-vivid-pink/20 text-vivid-pink'
                  }`}>
                    {est.accuracy}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Estimate Modal */}
      {editingEstimate && (
        <div className="fixed inset-0 bg-black/90 z-[100] overflow-y-auto">
          <div className="min-h-full pt-20 pb-8 px-4 flex items-start justify-center">
            <div className="max-w-md w-full rounded-2xl border-2 border-electric-purple bg-dark-grey-azure p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-supernova text-electric-purple">Edit Estimate</h2>
                <button onClick={() => setEditingEstimate(null)} className="p-2 text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Task</label>
                  <input
                    type="text"
                    value={editingEstimate.task}
                    onChange={(e) => setEditingEstimate({...editingEstimate, task: e.target.value})}
                    className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-electric-purple focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">Estimated (min)</label>
                    <input
                      type="number"
                      value={editingEstimate.estimated}
                      onChange={(e) => setEditingEstimate({...editingEstimate, estimated: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-electric-purple focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">Actual (min)</label>
                    <input
                      type="number"
                      value={editingEstimate.actual}
                      onChange={(e) => setEditingEstimate({...editingEstimate, actual: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-[#3d3d3d]/80 border border-white/10 rounded-lg text-white text-sm focus:border-electric-purple focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { handleDeleteEstimate(editingEstimate.id); setEditingEstimate(null); }}
                  className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10"
                >
                  Delete
                </button>
                <button
                  onClick={handleUpdateEstimate}
                  className="flex-1 py-2 rounded-lg bg-electric-purple text-black font-semibold hover:bg-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OutroModule() {
  const [thought, setThought] = useState('');
  const [thoughtSource, setThoughtSource] = useState('');
  const [userReframe, setUserReframe] = useState('');
  const [aiReframe, setAiReframe] = useState('');
  const [actionSuggestion, setActionSuggestion] = useState('');
  const [showAiResponse, setShowAiResponse] = useState(false);
  const [savedLogs, setSavedLogs] = useState<any[]>([]);

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('venued_outro_logs') || '[]');
    setSavedLogs(logs.slice(0, 5));
  }, []);

  const handleGetReframe = () => {
    if (!thought.trim()) return;
    setShowAiResponse(true);

    // Generate contextual AI reframe based on thought and source
    const lowerThought = thought.toLowerCase();
    const lowerSource = thoughtSource.toLowerCase();

    let reframe = '';
    let action = '';

    if (lowerSource.includes('past') || lowerSource.includes('failure') || lowerSource.includes('mistake')) {
      reframe = `This thought comes from your past, but you're not the same person you were then. "${thought}" is outdated data. The you of TODAY has more experience, more tools, more resilience. What would you tell a friend who made that same mistake?`;
      action = "Write down ONE thing you've learned since that experience that proves you've grown.";
    } else if (lowerSource.includes('comparison') || lowerSource.includes('other') || lowerSource.includes('everyone')) {
      reframe = `Comparing your behind-the-scenes to everyone else's highlight reel is a losing game. "${thought}" ignores that everyone struggles - they just don't post about it. Your path is uniquely yours.`;
      action = "Unfollow or mute one account that triggers comparison feelings. Do it now.";
    } else if (lowerThought.includes('never') || lowerThought.includes('always') || lowerThought.includes('can\'t')) {
      reframe = `Notice those absolute words - "never", "always", "can't". Your brain is catastrophizing. Let's reality-check: Has this REALLY been true 100% of the time? Probably not. "${thought}" is a feeling, not a fact.`;
      action = "Write down ONE exception - one time when this thought WASN'T true.";
    } else if (lowerThought.includes('should') || lowerThought.includes('must') || lowerThought.includes('have to')) {
      reframe = `"Should" is a guilt word disguised as motivation. Who says you "should"? Replace "${thought}" with "I could..." or "I want to..." and feel the pressure lift. You get to choose.`;
      action = "Rewrite this thought starting with 'I choose to...' or 'I could...'";
    } else {
      reframe = `That thought is your brain trying to protect you from disappointment. Thank it for caring, then remind it: you've handled hard things before. "${thought}" is just one possible story - and probably not the most accurate one.`;
      action = "What's the BEST possible outcome if this thought is wrong? Visualize it for 30 seconds.";
    }

    // Add user's own reframe if provided
    if (userReframe.trim()) {
      reframe += `\n\n💪 YOUR reframe: "${userReframe}" - This shows you already have the wisdom inside you. Trust that voice more.`;
    }

    setAiReframe(reframe);
    setActionSuggestion(action);
  };

  const handleSaveLog = () => {
    const log = {
      id: Date.now().toString(),
      thought,
      source: thoughtSource,
      userReframe,
      aiReframe,
      action: actionSuggestion,
      timestamp: new Date().toISOString(),
    };

    const logs = JSON.parse(localStorage.getItem('venued_outro_logs') || '[]');
    logs.unshift(log);
    localStorage.setItem('venued_outro_logs', JSON.stringify(logs.slice(0, 50)));
    setSavedLogs(logs.slice(0, 5));

    // Reset form
    setThought('');
    setThoughtSource('');
    setUserReframe('');
    setAiReframe('');
    setActionSuggestion('');
    setShowAiResponse(false);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="p-6 rounded-xl border-2 border-white/10 bg-white/5">
        <h3 className="text-lg font-bold text-white mb-4">What negative thought needs rewriting?</h3>
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="e.g., I'll never finish this project on time, I'm not good enough, Everyone else has it together..."
          className="w-full h-24 px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none resize-none mb-4"
        />

        <h3 className="text-lg font-bold text-white mb-4">Where does this thought come from? (optional)</h3>
        <input
          type="text"
          value={thoughtSource}
          onChange={(e) => setThoughtSource(e.target.value)}
          placeholder="e.g., Past failure, comparison to others, fear of judgment..."
          className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none mb-4"
        />

        <h3 className="text-lg font-bold text-white mb-4">How would YOU reframe it? (try first!)</h3>
        <textarea
          value={userReframe}
          onChange={(e) => setUserReframe(e.target.value)}
          placeholder="Challenge yourself - what would you tell a friend who had this thought?"
          className="w-full h-20 px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none resize-none mb-4"
        />

        <button
          onClick={handleGetReframe}
          disabled={!thought.trim()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-magenta text-black font-bold hover:shadow-[0_0_30px_rgba(0,240,233,0.5)] transition-all disabled:opacity-50"
        >
          🎵 Rewrite the Lyric
        </button>
      </div>

      {/* AI Response */}
      {showAiResponse && aiReframe && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border-2 border-neon-cyan/30 bg-neon-cyan/10">
            <h3 className="text-lg font-bold text-neon-cyan mb-3">🎤 New Lyric:</h3>
            <p className="text-white whitespace-pre-line">{aiReframe}</p>
          </div>

          {actionSuggestion && (
            <div className="p-4 rounded-xl border-2 border-vivid-yellow-green/30 bg-vivid-yellow-green/10">
              <h4 className="font-bold text-vivid-yellow-green mb-2">🎯 Now Do This:</h4>
              <p className="text-white">{actionSuggestion}</p>
            </div>
          )}

          <button
            onClick={handleSaveLog}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-magenta text-black font-bold hover:bg-white transition-all"
          >
            💾 Save This Reframe
          </button>
        </div>
      )}

      {/* Recent Reframes */}
      {savedLogs.length > 0 && (
        <div className="p-4 rounded-xl border-2 border-white/10 bg-white/5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Reframes</h3>
          <div className="space-y-2">
            {savedLogs.map((log: any) => (
              <div key={log.id} className="p-3 rounded-lg bg-[#3d3d3d]/60 border border-white/10">
                <p className="text-gray-400 text-sm italic">"{log.thought}"</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UnpluggedModule() {
  const doubles = [
    {
      name: 'JANIE',
      style: 'calm, steady, gentle',
      icon: '💜',
      color: '#9D4EDD',
      personality: 'supportive',
      greetings: [
        "Hey lovely, I'm right here with you. Let's do this together, nice and easy.",
        "Take a breath. I'm here. We'll work through this one step at a time.",
        "You've got this. I'm just going to be here, quietly supporting you."
      ],
      boosts: [
        "You're doing beautifully. Just keep going at your own pace.",
        "Remember, progress isn't always visible. You're still moving forward.",
        "I see you working hard. I'm proud of you, even if it feels slow.",
        "It's okay to take breaks. I'll still be here when you're ready."
      ]
    },
    {
      name: 'ANGIE',
      style: 'high energy, enthusiastic',
      icon: '⚡',
      color: '#FF008E',
      personality: 'energetic',
      greetings: [
        "LET'S GOOOO! We're gonna CRUSH this! I'm so pumped to work with you!",
        "YES! You showed up! That's already a WIN! Now let's make magic happen!",
        "Okay okay okay - I'm READY! Are you ready? Let's DO THIS THING!"
      ],
      boosts: [
        "YOU'RE KILLING IT! Seriously, look at you GO!",
        "That was AWESOME! Keep that energy, you're on FIRE!",
        "Don't stop now - you've got MOMENTUM! Ride that wave!",
        "I believe in you SO MUCH right now! You're unstoppable!"
      ]
    },
    {
      name: 'IRIS',
      style: 'grounded, wise, patient',
      icon: '⏳',
      color: '#00A29D',
      personality: 'wise',
      greetings: [
        "Welcome. Let's create a space of focus together. I'm here.",
        "Ah, you've chosen to work. That's the first step. Now, let's begin.",
        "Good to see you. Remember, every journey starts with one task."
      ],
      boosts: [
        "You're exactly where you need to be. Trust the process.",
        "Notice how far you've come since you started. That's growth.",
        "The mind wanders - that's its nature. Gently return to your task.",
        "Progress over perfection. You're doing meaningful work."
      ]
    },
    {
      name: 'LOLA',
      style: 'competitive, motivator',
      icon: '🔥',
      color: '#D3FF2C',
      personality: 'competitive',
      greetings: [
        "Alright, let's see what you've got! I bet you can finish more than you think.",
        "Challenge accepted? Let's make this session COUNT!",
        "Time to prove to yourself what you're capable of. Game on!"
      ],
      boosts: [
        "Is that all you've got? I KNOW you can do better! Push harder!",
        "Boom! That's what I'm talking about! Keep that momentum!",
        "You're in the zone now - don't let up! Champions don't quit!",
        "Beat your last session! I dare you! Show me what you're made of!"
      ]
    },
  ];

  const [selectedDouble, setSelectedDouble] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(0);
  const [chatMessages, setChatMessages] = useState<{sender: string; message: string; timestamp: Date}[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [showCreateDouble, setShowCreateDouble] = useState(false);
  const [customDoubles, setCustomDoubles] = useState<any[]>([]);
  const [newDoubleName, setNewDoubleName] = useState('');
  const [newDoubleStyle, setNewDoubleStyle] = useState('');
  const [newDoubleIcon, setNewDoubleIcon] = useState('');

  // Load custom doubles
  useEffect(() => {
    const saved = localStorage.getItem('venued_custom_doubles');
    if (saved) {
      setCustomDoubles(JSON.parse(saved));
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isSessionActive) {
      setIsSessionActive(false);
      const currentDouble = [...doubles, ...customDoubles].find(d => d.name === selectedDouble);
      if (currentDouble) {
        addMessage(currentDouble.name, "Session complete! You did it! Take a breather, you've earned it. 🤘");
      }
    }
    return () => clearInterval(interval);
  }, [isSessionActive, timeLeft, selectedDouble]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addMessage = (sender: string, message: string) => {
    setChatMessages(prev => [...prev, { sender, message, timestamp: new Date() }]);
  };

  const startSession = () => {
    const currentDouble = [...doubles, ...customDoubles].find(d => d.name === selectedDouble);
    if (!currentDouble) return;

    setTimeLeft(sessionMinutes * 60);
    setIsSessionActive(true);
    setChatMessages([]);

    // Send greeting
    const greeting = currentDouble.greetings
      ? currentDouble.greetings[Math.floor(Math.random() * currentDouble.greetings.length)]
      : `Hey! I'm ${currentDouble.name}. Let's do this together!`;
    addMessage(currentDouble.name, greeting);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setTimeLeft(0);
    const currentDouble = [...doubles, ...customDoubles].find(d => d.name === selectedDouble);
    if (currentDouble) {
      addMessage(currentDouble.name, "No worries, we can pick this up again whenever you're ready!");
    }
  };

  const handleBoost = () => {
    const currentDouble = [...doubles, ...customDoubles].find(d => d.name === selectedDouble);
    if (!currentDouble) return;

    const boost = currentDouble.boosts
      ? currentDouble.boosts[Math.floor(Math.random() * currentDouble.boosts.length)]
      : "You're doing great! Keep it up!";
    addMessage(currentDouble.name, boost);
  };

  const handleSendMessage = () => {
    if (!userMessage.trim() || !selectedDouble) return;

    addMessage('You', userMessage);
    const currentDouble = [...doubles, ...customDoubles].find(d => d.name === selectedDouble);

    // Generate personality-based response
    setTimeout(() => {
      let response = '';
      const lowerMsg = userMessage.toLowerCase();

      if (lowerMsg.includes('stuck') || lowerMsg.includes('help') || lowerMsg.includes('can\'t')) {
        if (currentDouble?.personality === 'supportive') {
          response = "I hear you. It's okay to feel stuck. Let's just focus on the tiniest next step. What's one small thing you could do right now?";
        } else if (currentDouble?.personality === 'energetic') {
          response = "STUCK?! Nah, you're just pausing before your BREAKTHROUGH! Let's shake it off - stand up, do 5 jumping jacks, then come back FRESH!";
        } else if (currentDouble?.personality === 'wise') {
          response = "Feeling stuck is often a sign you need a different approach, not more effort. Step back. What's really blocking you?";
        } else if (currentDouble?.personality === 'competitive') {
          response = "Stuck is just another obstacle to DEMOLISH! What's standing in your way? Let's strategize and CRUSH IT!";
        } else {
          response = "I'm here for you! Let's break this down into smaller pieces and tackle them one at a time.";
        }
      } else if (lowerMsg.includes('tired') || lowerMsg.includes('break')) {
        if (currentDouble?.personality === 'supportive') {
          response = "Listen to your body. A short break can do wonders. Take 5 minutes, then come back refreshed.";
        } else if (currentDouble?.personality === 'energetic') {
          response = "Quick power break! Stretch, grab water, do a little dance - then we're BACK IN ACTION!";
        } else if (currentDouble?.personality === 'wise') {
          response = "Rest is not laziness - it's wisdom. Take the break you need. I'll be here.";
        } else if (currentDouble?.personality === 'competitive') {
          response = "Okay, quick tactical break - but don't get too comfortable! Champions rest strategically!";
        } else {
          response = "Take a break if you need it! I'll be right here when you're ready to continue.";
        }
      } else if (lowerMsg.includes('done') || lowerMsg.includes('finished') || lowerMsg.includes('completed')) {
        if (currentDouble?.personality === 'supportive') {
          response = "Wonderful! I'm so proud of you. You showed up and did the work. That takes strength. 💜";
        } else if (currentDouble?.personality === 'energetic') {
          response = "YESSSSS! YOU DID IT!!! I KNEW YOU COULD! *virtual high five* 🎉";
        } else if (currentDouble?.personality === 'wise') {
          response = "Well done. Take a moment to acknowledge your accomplishment. You've grown today.";
        } else if (currentDouble?.personality === 'competitive') {
          response = "BOOM! VICTORY! Write that down in your win column! Now... ready for the next challenge? 😏";
        } else {
          response = "Amazing work! You did it! Give yourself some credit!";
        }
      } else {
        if (currentDouble?.personality === 'supportive') {
          response = "I hear you. Keep going, you're doing great. I'm right here with you.";
        } else if (currentDouble?.personality === 'energetic') {
          response = "Awesome! Keep that energy flowing! You've got this!";
        } else if (currentDouble?.personality === 'wise') {
          response = "Noted. Stay present with your task. The answers will come.";
        } else if (currentDouble?.personality === 'competitive') {
          response = "Cool cool - now back to WINNING! Let's GO!";
        } else {
          response = "Thanks for sharing! Let's keep working together!";
        }
      }

      addMessage(currentDouble?.name || 'Double', response);
    }, 500);

    setUserMessage('');
  };

  const handleCreateDouble = () => {
    if (!newDoubleName.trim()) return;

    const newDouble = {
      name: newDoubleName.toUpperCase(),
      style: newDoubleStyle || 'your personal style',
      icon: newDoubleIcon || '⭐',
      color: '#9D4EDD',
      personality: 'supportive',
      greetings: [`Hey! I'm ${newDoubleName}, your custom double. Ready to work together?`],
      boosts: ["You're doing great! Keep it up!", "Nice work! Keep going!", "You've got this!"]
    };

    const updated = [...customDoubles, newDouble];
    setCustomDoubles(updated);
    localStorage.setItem('venued_custom_doubles', JSON.stringify(updated));

    setNewDoubleName('');
    setNewDoubleStyle('');
    setNewDoubleIcon('');
    setShowCreateDouble(false);
  };

  const allDoubles = [...doubles, ...customDoubles];
  const currentDouble = allDoubles.find(d => d.name === selectedDouble);

  return (
    <div className="space-y-6">
      {/* Session Active View */}
      {isSessionActive && currentDouble && (
        <div className="space-y-4">
          {/* Timer */}
          <div className="p-6 rounded-xl border-2 border-white/20 bg-[#3d3d3d]/80 text-center">
            <div className="text-5xl font-supernova text-white mb-2 animate-pulse">
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-400">Working with {currentDouble.name}</p>
            <button
              onClick={endSession}
              className="mt-4 px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              End Session
            </button>
          </div>

          {/* Chat Box */}
          <div className="rounded-xl border-2 border-white/20 bg-[#3d3d3d]/80 overflow-hidden">
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      msg.sender === 'You'
                        ? 'bg-magenta/30 text-white'
                        : 'border border-white/20 bg-white/5 text-white'
                    }`}
                    style={msg.sender !== 'You' ? { borderColor: currentDouble.color } : {}}
                  >
                    {msg.sender !== 'You' && (
                      <p className="text-xs font-bold mb-1" style={{ color: currentDouble.color }}>
                        {currentDouble.icon} {msg.sender}
                      </p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="border-t border-white/10 p-3 flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Say something to your double..."
                className="flex-1 px-4 py-2 bg-[#3d3d3d]/80 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-lg bg-magenta text-black font-semibold hover:bg-white transition-all"
              >
                Send
              </button>
            </div>
          </div>

          {/* Boost Button */}
          <button
            onClick={handleBoost}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(255,0,142,0.5)] transition-all"
          >
            🤘 NEED A BOOST?
          </button>
        </div>
      )}

      {/* Selection View */}
      {!isSessionActive && (
        <>
          {/* Doubles Grid */}
          <div className="grid grid-cols-2 gap-4">
            {allDoubles.map((double) => (
              <button
                key={double.name}
                onClick={() => setSelectedDouble(double.name)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedDouble === double.name
                    ? 'border-magenta bg-magenta/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <div className="text-3xl mb-2">{double.icon}</div>
                <h4 className="text-lg font-bold text-white">{double.name}</h4>
                <p className="text-sm text-gray-400">{double.style}</p>
              </button>
            ))}

            {/* Double Yourself Button */}
            <button
              onClick={() => setShowCreateDouble(true)}
              className="p-6 rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:border-white/40 transition-all text-center"
            >
              <div className="text-3xl mb-2">➕</div>
              <h4 className="text-lg font-bold text-white">Double Yourself</h4>
              <p className="text-sm text-gray-400">Create your own</p>
            </button>
          </div>

          {/* Create Double Modal */}
          {showCreateDouble && (
            <div className="p-6 rounded-xl border-2 border-neon-cyan/30 bg-neon-cyan/10">
              <h3 className="text-lg font-bold text-white mb-4">Create Your Double</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newDoubleName}
                  onChange={(e) => setNewDoubleName(e.target.value)}
                  placeholder="Double name (e.g., ALEX)"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none"
                />
                <input
                  type="text"
                  value={newDoubleStyle}
                  onChange={(e) => setNewDoubleStyle(e.target.value)}
                  placeholder="Their vibe (e.g., chill but focused)"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none"
                />
                <input
                  type="text"
                  value={newDoubleIcon}
                  onChange={(e) => setNewDoubleIcon(e.target.value)}
                  placeholder="Pick an emoji (e.g., 🎸)"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateDouble}
                    disabled={!newDoubleName.trim()}
                    className="px-6 py-3 rounded-xl bg-neon-cyan text-black font-bold hover:bg-white transition-all disabled:opacity-50"
                  >
                    Create Double
                  </button>
                  <button
                    onClick={() => setShowCreateDouble(false)}
                    className="px-6 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Start Session */}
          {selectedDouble && !showCreateDouble && (
            <div className="p-6 rounded-xl border-2 border-magenta/30 bg-magenta/10">
              <h3 className="text-lg font-bold text-white mb-4">
                Start a session with {selectedDouble}
              </h3>

              {/* Duration Selection */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setSessionMinutes(mins)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      sessionMinutes === mins
                        ? 'bg-magenta text-black'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <button
                onClick={startSession}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(255,0,142,0.5)] transition-all"
              >
                🤘 LET'S DOUBLE UP!
              </button>
            </div>
          )}

          {/* Coming Soon Banner */}
          <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
            <p className="text-neon-cyan font-semibold text-center">
              🚀 Coming Soon - Double Up with REAL VENUED members!
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function RetuneModule() {
  const resets = [
    {
      name: "Just Chillin'",
      color: '#00F0E9',
      description: 'Relax and decompress',
      icon: '🧊',
      duration: 300,
      instructions: [
        "Find a comfortable position - sitting, lying down, whatever feels good.",
        "Close your eyes if that feels comfortable.",
        "Breathe naturally. No special technique needed.",
        "Let your thoughts come and go like clouds passing by.",
        "There's nothing to do, nowhere to be. Just... chill.",
        "When the timer ends, gently open your eyes."
      ],
      science: "Rest activates your parasympathetic nervous system - the 'rest and digest' mode. This counteracts the fight-or-flight response that VARIANT brains often get stuck in. Even brief periods of intentional rest can lower cortisol and restore mental clarity.",
      watchMe: "SUPERNova demonstrates: Sitting comfortably, eyes closed, breathing slowly and naturally. No movement, no tension - just pure relaxation."
    },
    {
      name: 'Shaken Not Stirred',
      color: '#FF008E',
      description: 'Physical shake-out reset',
      icon: '🫨',
      duration: 120,
      instructions: [
        "Stand up and give yourself some space.",
        "Start shaking your hands gently - like you're air-drying them.",
        "Let the shake travel up to your arms, then shoulders.",
        "Shake your whole body - legs, hips, torso.",
        "Make it weird! Jump, wiggle, be ridiculous. No one's watching!",
        "Shake for the full 2 minutes, then stand still and notice how you feel."
      ],
      science: "Shaking releases stored tension and trauma from the body. Animals do this naturally after stress (watch a dog shake after a scary moment). It discharges excess adrenaline and resets your nervous system. VARIANT brains benefit hugely from physical release.",
      watchMe: "SUPERNova demonstrates: Starting with gentle hand shakes, building to full body movement, jumping and wiggling freely with no self-consciousness."
    },
    {
      name: 'And Breathe...',
      color: '#C9005C',
      description: '4-7-8 breathing technique',
      icon: '💨',
      duration: 240,
      instructions: [
        "Sit or lie down comfortably.",
        "Place the tip of your tongue against the roof of your mouth.",
        "Exhale completely through your mouth with a whoosh sound.",
        "Inhale quietly through your nose for 4 seconds.",
        "Hold your breath for 7 seconds.",
        "Exhale completely through mouth for 8 seconds.",
        "Repeat this cycle 4 times."
      ],
      science: "The 4-7-8 technique activates the vagus nerve and shifts your body from sympathetic (stressed) to parasympathetic (calm) mode. The extended exhale triggers a relaxation response. Regular practice can reduce anxiety and improve sleep quality.",
      watchMe: "SUPERNova demonstrates: Inhaling through nose (4 counts), holding breath (7 counts), exhaling slowly through mouth (8 counts). Shoulders relaxed, posture comfortable."
    },
    {
      name: 'Ground Rules',
      color: '#00A29D',
      description: '5-4-3-2-1 sensory grounding',
      icon: '🌍',
      duration: 180,
      instructions: [
        "Look around and name 5 things you can SEE.",
        "Notice 4 things you can TOUCH (feel your clothes, the chair, etc.).",
        "Identify 3 things you can HEAR right now.",
        "Find 2 things you can SMELL (or like the smell of).",
        "Name 1 thing you can TASTE (or like to taste).",
        "Breathe. You are here. You are present. You are safe."
      ],
      science: "Grounding interrupts the anxiety loop by forcing your brain to process sensory information. This engages your prefrontal cortex and disengages the amygdala (fear center). It's especially effective for VARIANT brains that get caught in spiraling thoughts.",
      watchMe: "SUPERNova demonstrates: Looking around deliberately, touching nearby objects, listening intently, sniffing the air, focusing on present moment awareness."
    },
    {
      name: "It's A Movement",
      color: '#D3FF2C',
      description: 'Dance it out! Movement therapy',
      icon: '💃',
      duration: 180,
      instructions: [
        "Put on your favorite song (or use the timer without music).",
        "Start moving however feels natural - no rules!",
        "Let your body lead. Don't think, just move.",
        "Get bigger! Take up space! Be dramatic!",
        "Express whatever you're feeling through movement.",
        "When done, stand still and feel the buzz in your body."
      ],
      science: "Movement releases endorphins, dopamine, and serotonin - the feel-good chemicals VARIANT brains often struggle to produce consistently. Dancing specifically integrates rhythm, which helps regulate the nervous system and improves mood more effectively than stationary exercise.",
      watchMe: "SUPERNova demonstrates: Starting with small sways, building to bigger movements, arms flowing, feet stepping, fully expressing through movement with joy."
    },
  ];

  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [todayResets, setTodayResets] = useState(0);
  const [totalResets, setTotalResets] = useState(0);

  // Load stats
  useEffect(() => {
    const stats = JSON.parse(localStorage.getItem('venued_retune_stats') || '{}');
    const today = new Date().toISOString().split('T')[0];
    setTodayResets(stats[today] || 0);
    setTotalResets(Object.values(stats).reduce((sum: number, val) => sum + (val as number), 0));
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Log completion
      const stats = JSON.parse(localStorage.getItem('venued_retune_stats') || '{}');
      const today = new Date().toISOString().split('T')[0];
      stats[today] = (stats[today] || 0) + 1;
      localStorage.setItem('venued_retune_stats', JSON.stringify(stats));
      setTodayResets(stats[today]);
      setTotalResets(prev => prev + 1);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openProtocol = (protocol: typeof resets[0]) => {
    setActiveProtocol(protocol.name);
    setTimeLeft(protocol.duration);
    setIsRunning(false); // Don't auto-start
  };

  const startProtocol = () => {
    setIsRunning(true);
  };

  const cancelProtocol = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setActiveProtocol(null);
  };

  const currentProtocol = resets.find(r => r.name === activeProtocol);

  return (
    <div className="space-y-6">
      {/* Counter Boxes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-neon-cyan bg-neon-cyan/10 text-center">
          <p className="text-xs text-gray-400 uppercase">Today's Resets</p>
          <p className="text-3xl font-supernova text-neon-cyan">{todayResets}</p>
        </div>
        <div className="p-4 rounded-xl border border-magenta bg-magenta/10 text-center">
          <p className="text-xs text-gray-400 uppercase">Total Resets</p>
          <p className="text-3xl font-supernova text-magenta">{totalResets}</p>
        </div>
      </div>

      {/* Description Box */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-gray-300 text-sm font-josefin">
          Your nervous system needs regular resets - especially with a VARIANT brain. These protocols are scientifically-backed techniques to help you regulate, recharge, and get back to feeling like yourself. Pick one based on what you need right now.
        </p>
      </div>

      {/* Protocol Overlay */}
      {activeProtocol && currentProtocol && (
        <div className="fixed inset-0 bg-black/95 z-[100] overflow-y-auto">
          <div className="min-h-full pt-20 pb-8 px-4 flex items-start justify-center">
            <div className="max-w-lg w-full rounded-2xl border-2 bg-[#1a1a1a] p-6" style={{ borderColor: currentProtocol.color }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{currentProtocol.icon}</span>
                <h2 className="text-2xl font-supernova" style={{ color: currentProtocol.color }}>
                  {currentProtocol.name}
                </h2>
              </div>
              <button
                onClick={cancelProtocol}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div
                className={`text-6xl font-supernova mb-2 ${isRunning ? 'animate-pulse' : ''}`}
                style={{ color: currentProtocol.color }}
              >
                {formatTime(timeLeft)}
              </div>
              {timeLeft === 0 && (
                <p className="text-vivid-yellow-green font-bold">✓ Reset Complete!</p>
              )}
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Instructions:</h3>
              <ol className="space-y-2">
                {currentProtocol.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: currentProtocol.color, color: 'black' }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-white text-sm">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Watch Me - Coming Soon */}
            <div className="w-full p-3 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 mb-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">👁️</span>
                <span className="text-neon-cyan font-semibold">Watch Me Demo</span>
                <span className="px-2 py-0.5 rounded-full bg-neon-cyan/30 text-neon-cyan text-xs font-bold">COMING SOON</span>
              </div>
            </div>

            {/* Science Section */}
            <div className="p-4 rounded-xl bg-magenta/10 border border-magenta/30 mb-6">
              <h4 className="text-sm font-bold text-magenta mb-2">🧠 The Science:</h4>
              <p className="text-white text-sm">{currentProtocol.science}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isRunning && timeLeft === currentProtocol.duration ? (
                <button
                  onClick={startProtocol}
                  className="flex-1 p-4 rounded-xl font-bold text-black"
                  style={{ backgroundColor: currentProtocol.color }}
                >
                  ▶ Start
                </button>
              ) : !isRunning && timeLeft === 0 ? (
                <button
                  onClick={() => {
                    setTimeLeft(currentProtocol.duration);
                    setIsRunning(true);
                  }}
                  className="flex-1 p-4 rounded-xl font-bold text-black"
                  style={{ backgroundColor: currentProtocol.color }}
                >
                  ▶ Start Again
                </button>
              ) : isRunning ? (
                <button
                  onClick={() => setIsRunning(false)}
                  className="flex-1 p-4 rounded-xl bg-white/20 text-white font-bold hover:bg-white/30 transition-all"
                >
                  ⏸ Pause
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(true)}
                  className="flex-1 p-4 rounded-xl font-bold text-black"
                  style={{ backgroundColor: currentProtocol.color }}
                >
                  ▶ Resume
                </button>
              )}
              <button
                onClick={cancelProtocol}
                className="px-6 py-4 rounded-xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Protocol List */}
      <div className="space-y-3">
        {resets.map((reset) => (
          <button
            key={reset.name}
            onClick={() => openProtocol(reset)}
            className="w-full p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-white/30 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{reset.icon}</span>
              <div>
                <h4 className="font-bold text-white group-hover:text-white" style={{ color: reset.color }}>
                  {reset.name}
                </h4>
                <p className="text-sm text-gray-400">{reset.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{Math.floor(reset.duration / 60)}m</span>
              <span className="text-gray-400 group-hover:text-white transition-colors">Start →</span>
            </div>
          </button>
        ))}
      </div>

      {/* Neuroscience Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-magenta/10 to-neon-cyan/10 border border-white/10">
        <p className="text-white text-sm font-josefin text-center">
          🧠 <strong>Why this matters:</strong> VARIANT brains often struggle with nervous system regulation. These protocols aren't just "relaxation" - they're scientifically-backed techniques that physically reset your stress response and restore cognitive function. Regular resets = better focus, mood, and performance.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
        <p className="text-neon-cyan font-semibold text-center">
          🚀 Coming Soon: dAItani Dippers mini program - guided reset sessions!
        </p>
      </div>
    </div>
  );
}

function AmplifyModule() {
  const [revenueEntries, setRevenueEntries] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({ source: '', amount: '', type: 'income', notes: '' });
  const [viewMode, setViewMode] = useState<'log' | 'insights'>('log');

  useEffect(() => {
    const saved = localStorage.getItem('venued_revenue');
    if (saved) {
      setRevenueEntries(JSON.parse(saved));
    }
  }, []);

  const handleAddEntry = () => {
    if (!newEntry.amount || !newEntry.source) return;

    const entry = {
      id: Date.now().toString(),
      source: newEntry.source,
      amount: parseFloat(newEntry.amount),
      type: newEntry.type,
      notes: newEntry.notes,
      date: new Date().toISOString(),
    };

    const updated = [entry, ...revenueEntries];
    setRevenueEntries(updated);
    localStorage.setItem('venued_revenue', JSON.stringify(updated));
    setNewEntry({ source: '', amount: '', type: 'income', notes: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = revenueEntries.filter(e => e.id !== id);
    setRevenueEntries(updated);
    localStorage.setItem('venued_revenue', JSON.stringify(updated));
  };

  // Calculate stats
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyEntries = revenueEntries.filter(e => e.date.startsWith(thisMonth));
  const totalIncome = monthlyEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = monthlyEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netRevenue = totalIncome - totalExpenses;

  // Calculate income sources breakdown
  const sourceTotals: Record<string, number> = {};
  revenueEntries.filter(e => e.type === 'income').forEach(e => {
    sourceTotals[e.source] = (sourceTotals[e.source] || 0) + e.amount;
  });
  const topSources = Object.entries(sourceTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-vivid-yellow-green bg-vivid-yellow-green/10 text-center">
          <p className="text-xs text-gray-400 uppercase">This Month</p>
          <p className="text-2xl font-supernova text-vivid-yellow-green">
            £{totalIncome.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">Income</p>
        </div>
        <div className="p-4 rounded-xl border border-magenta bg-magenta/10 text-center">
          <p className="text-xs text-gray-400 uppercase">Expenses</p>
          <p className="text-2xl font-supernova text-magenta">
            £{totalExpenses.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">This Month</p>
        </div>
        <div className="p-4 rounded-xl border border-neon-cyan bg-neon-cyan/10 text-center">
          <p className="text-xs text-gray-400 uppercase">Net</p>
          <p className={`text-2xl font-supernova ${netRevenue >= 0 ? 'text-neon-cyan' : 'text-red-400'}`}>
            £{netRevenue.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">Profit/Loss</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('log')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'log' ? 'bg-vivid-yellow-green text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Revenue Log
        </button>
        <button
          onClick={() => setViewMode('insights')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'insights' ? 'bg-vivid-yellow-green text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Insights
        </button>
      </div>

      {viewMode === 'log' && (
        <>
          {/* Add Entry */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-vivid-yellow-green/30 text-vivid-yellow-green font-semibold hover:bg-vivid-yellow-green/10 transition-all"
            >
              + Log Revenue or Expense
            </button>
          ) : (
            <div className="p-4 rounded-xl border-2 border-vivid-yellow-green/30 bg-vivid-yellow-green/10">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewEntry({ ...newEntry, type: 'income' })}
                    className={`flex-1 py-2 rounded-lg font-semibold ${
                      newEntry.type === 'income' ? 'bg-vivid-yellow-green text-black' : 'bg-white/10 text-white'
                    }`}
                  >
                    💰 Income
                  </button>
                  <button
                    onClick={() => setNewEntry({ ...newEntry, type: 'expense' })}
                    className={`flex-1 py-2 rounded-lg font-semibold ${
                      newEntry.type === 'expense' ? 'bg-magenta text-black' : 'bg-white/10 text-white'
                    }`}
                  >
                    💸 Expense
                  </button>
                </div>
                <input
                  type="text"
                  value={newEntry.source}
                  onChange={(e) => setNewEntry({ ...newEntry, source: e.target.value })}
                  placeholder="Source (e.g., Client Project, Coaching, Course Sales)"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-vivid-yellow-green focus:outline-none"
                />
                <input
                  type="number"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  placeholder="Amount (£)"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-vivid-yellow-green focus:outline-none"
                />
                <input
                  type="text"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Notes (optional)"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-vivid-yellow-green focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddEntry}
                    disabled={!newEntry.amount || !newEntry.source}
                    className="flex-1 py-3 rounded-xl bg-vivid-yellow-green text-black font-bold hover:bg-white transition-all disabled:opacity-50"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewEntry({ source: '', amount: '', type: 'income', notes: '' });
                    }}
                    className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Entry List */}
          <div className="space-y-2">
            {revenueEntries.length === 0 ? (
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-center">
                <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No entries yet</p>
                <p className="text-sm text-gray-500">Start logging your revenue and expenses!</p>
              </div>
            ) : (
              revenueEntries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.type === 'income' ? '💰' : '💸'}</span>
                    <div>
                      <p className="text-white font-semibold">{entry.source}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {entry.notes && ` • ${entry.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${entry.type === 'income' ? 'text-vivid-yellow-green' : 'text-magenta'}`}>
                      {entry.type === 'income' ? '+' : '-'}£{entry.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {viewMode === 'insights' && (
        <div className="space-y-4">
          {/* Top Income Sources */}
          <div className="p-4 rounded-xl border border-vivid-yellow-green/30 bg-vivid-yellow-green/10">
            <h3 className="font-bold text-white mb-3">🏆 Top Revenue Sources</h3>
            {topSources.length === 0 ? (
              <p className="text-gray-400 text-sm">Log some income to see your top sources!</p>
            ) : (
              <div className="space-y-2">
                {topSources.map(([source, total], idx) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-vivid-yellow-green font-bold">{idx + 1}.</span>
                      <span className="text-white">{source}</span>
                    </div>
                    <span className="text-vivid-yellow-green font-semibold">£{total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="p-4 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10">
            <h3 className="font-bold text-neon-cyan mb-3">🧠 AI Insights</h3>
            {revenueEntries.length < 5 ? (
              <p className="text-white text-sm">Add at least 5 entries to unlock AI insights about your revenue patterns!</p>
            ) : (
              <div className="space-y-2 text-white text-sm">
                {netRevenue >= 0 ? (
                  <p>✅ You're in profit this month! Keep that momentum going.</p>
                ) : (
                  <p>⚠️ You're running at a loss this month. Review your expenses or boost that income!</p>
                )}
                {topSources.length > 0 && (
                  <p>💡 Your top income source is "{topSources[0][0]}" - consider doubling down here!</p>
                )}
                {totalExpenses > totalIncome * 0.5 && (
                  <p>🔍 Your expenses are over 50% of income. Worth reviewing if all are necessary.</p>
                )}
              </div>
            )}
          </div>

          {/* Motivational */}
          <div className="p-4 rounded-xl bg-magenta/10 border border-magenta/30">
            <p className="text-white text-sm text-center font-josefin">
              🤘 Remember: Revenue isn't just about the numbers - it's about building a sustainable business that works WITH your VARIANT brain, not against it!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function GigHighlightsModule() {
  const [stats, setStats] = useState({
    focusSessions: 0,
    totalFocusMinutes: 0,
    tasksCompleted: 0,
    retuneResets: 0,
    brainDumps: 0,
    ideasCapture: 0,
    reframes: 0,
  });
  const [peakHour, setPeakHour] = useState<number | null>(null);
  const [peakDay, setPeakDay] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Gather stats from all modules
    const focusSessions = JSON.parse(localStorage.getItem('venued_focus_sessions') || '[]');
    const crewTasks = JSON.parse(localStorage.getItem('venued_crew_tasks') || '[]');
    const retuneStats = JSON.parse(localStorage.getItem('venued_retune_stats') || '{}');
    const brainDumps = JSON.parse(localStorage.getItem('venued_brain_dumps') || '[]');
    const ideas = JSON.parse(localStorage.getItem('venued_ideas') || '[]');
    const reframes = JSON.parse(localStorage.getItem('venued_outro_logs') || '[]');

    // Calculate totals
    const totalFocusMinutes = focusSessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
    const totalRetuneResets = Object.values(retuneStats).reduce((sum: number, val) => sum + (val as number), 0);
    const completedTasks = crewTasks.filter((t: any) => t.completed).length;

    setStats({
      focusSessions: focusSessions.length,
      totalFocusMinutes,
      tasksCompleted: completedTasks,
      retuneResets: totalRetuneResets,
      brainDumps: brainDumps.length,
      ideasCapture: ideas.length,
      reframes: reframes.length,
    });

    // Calculate peak hour from focus sessions
    if (focusSessions.length > 0) {
      const hourCounts: Record<number, number> = {};
      focusSessions.forEach((s: any) => {
        if (s.timestamp) {
          const hour = new Date(s.timestamp).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });
      const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
      if (topHour) setPeakHour(parseInt(topHour[0]));
    }

    // Calculate peak day
    const allActivities = [
      ...focusSessions.map((s: any) => s.timestamp),
      ...brainDumps.map((d: any) => d.timestamp),
      ...ideas.map((i: any) => i.timestamp),
      ...reframes.map((r: any) => r.timestamp),
    ].filter(Boolean);

    if (allActivities.length > 0) {
      const dayCounts: Record<string, number> = {};
      allActivities.forEach((timestamp: string) => {
        const day = new Date(timestamp).toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
      if (topDay) setPeakDay(topDay[0]);
    }

    // Calculate streak (consecutive days with activity)
    const activityDates = new Set(
      allActivities.map((t: string) => new Date(t).toISOString().split('T')[0])
    );
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    setStreak(currentStreak);
  }, []);

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am';
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return '12pm';
    return `${hour - 12}pm`;
  };

  const totalActivity = stats.focusSessions + stats.brainDumps + stats.ideasCapture + stats.reframes + stats.retuneResets;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-magenta bg-magenta/10 text-center">
          <p className="text-3xl font-supernova text-magenta">{stats.focusSessions}</p>
          <p className="text-xs text-gray-400">Focus Sessions</p>
        </div>
        <div className="p-4 rounded-xl border border-neon-cyan bg-neon-cyan/10 text-center">
          <p className="text-3xl font-supernova text-neon-cyan">{Math.floor(stats.totalFocusMinutes / 60)}h</p>
          <p className="text-xs text-gray-400">Total Focus Time</p>
        </div>
        <div className="p-4 rounded-xl border border-vivid-yellow-green bg-vivid-yellow-green/10 text-center">
          <p className="text-3xl font-supernova text-vivid-yellow-green">{stats.tasksCompleted}</p>
          <p className="text-xs text-gray-400">Tasks Done</p>
        </div>
        <div className="p-4 rounded-xl border border-vivid-pink bg-vivid-pink/10 text-center">
          <p className="text-3xl font-supernova text-vivid-pink">{streak}</p>
          <p className="text-xs text-gray-400">Day Streak</p>
        </div>
      </div>

      {/* Pattern Insights */}
      <div className="p-6 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10">
        <h3 className="font-bold text-neon-cyan mb-4">🎸 Your Gig Highlights</h3>

        {totalActivity < 5 ? (
          <p className="text-white text-sm">
            Keep using VENUED to unlock your productivity patterns! Complete 5+ activities to see insights.
          </p>
        ) : (
          <div className="space-y-4">
            {peakHour !== null && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-white font-semibold">Peak Performance Hour: {formatHour(peakHour)}</p>
                  <p className="text-sm text-gray-400">You do your best focus work around this time!</p>
                </div>
              </div>
            )}

            {peakDay && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-white font-semibold">Power Day: {peakDay}</p>
                  <p className="text-sm text-gray-400">Your most productive day of the week!</p>
                </div>
              </div>
            )}

            {stats.retuneResets > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧘</span>
                <div>
                  <p className="text-white font-semibold">{stats.retuneResets} Resets Completed</p>
                  <p className="text-sm text-gray-400">You're taking care of your nervous system!</p>
                </div>
              </div>
            )}

            {stats.reframes > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎵</span>
                <div>
                  <p className="text-white font-semibold">{stats.reframes} Thoughts Reframed</p>
                  <p className="text-sm text-gray-400">You're rewriting your mental lyrics!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Breakdown */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5">
        <h3 className="font-bold text-white mb-4">📊 Activity Breakdown</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#3d3d3d]/60">
            <span className="text-gray-400">Brain Dumps</span>
            <span className="text-white font-bold">{stats.brainDumps}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#3d3d3d]/60">
            <span className="text-gray-400">Ideas Captured</span>
            <span className="text-white font-bold">{stats.ideasCapture}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#3d3d3d]/60">
            <span className="text-gray-400">Reframes</span>
            <span className="text-white font-bold">{stats.reframes}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#3d3d3d]/60">
            <span className="text-gray-400">Resets</span>
            <span className="text-white font-bold">{stats.retuneResets}</span>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      {totalActivity >= 10 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-magenta/10 to-neon-cyan/10 border border-white/10">
          <p className="text-white text-sm font-josefin text-center">
            🧠 <strong>Pattern Detected:</strong> {
              stats.focusSessions > stats.retuneResets
                ? "You're crushing it on focus time! Don't forget to reset and recharge regularly."
                : stats.retuneResets > stats.focusSessions
                ? "Great job taking care of yourself! Now channel that energy into some focused work sessions."
                : "Nice balance between focus and self-care! Keep that momentum going!"
            }
          </p>
        </div>
      )}

      {/* Coming Soon */}
      <div className="p-4 rounded-xl bg-magenta/10 border border-magenta/30">
        <p className="text-magenta font-semibold text-center">
          🚀 Coming Soon: Weekly reports, trend charts, and productivity leaderboards!
        </p>
      </div>
    </div>
  );
}

function ExciteModule() {
  const achievements = [
    // Focus achievements
    { id: 'first-focus', name: 'First Note', description: 'Complete your first focus session', category: 'focus', icon: '🎵', threshold: 1, stat: 'focusSessions' },
    { id: 'focus-5', name: 'Opening Act', description: 'Complete 5 focus sessions', category: 'focus', icon: '🎸', threshold: 5, stat: 'focusSessions' },
    { id: 'focus-25', name: 'Headliner', description: 'Complete 25 focus sessions', category: 'focus', icon: '🎤', threshold: 25, stat: 'focusSessions' },
    { id: 'focus-100', name: 'Rock Legend', description: 'Complete 100 focus sessions', category: 'focus', icon: '👑', threshold: 100, stat: 'focusSessions' },
    { id: 'focus-hour', name: 'Marathon Session', description: 'Log 60+ minutes in a single day', category: 'focus', icon: '⏰', threshold: 60, stat: 'dailyFocusMinutes' },

    // Task achievements
    { id: 'first-task', name: 'Soundcheck', description: 'Complete your first task', category: 'tasks', icon: '✅', threshold: 1, stat: 'tasksCompleted' },
    { id: 'task-10', name: 'Getting Warmed Up', description: 'Complete 10 tasks', category: 'tasks', icon: '🤘', threshold: 10, stat: 'tasksCompleted' },
    { id: 'task-50', name: 'On Fire', description: 'Complete 50 tasks', category: 'tasks', icon: '🔥', threshold: 50, stat: 'tasksCompleted' },
    { id: 'task-100', name: 'Unstoppable', description: 'Complete 100 tasks', category: 'tasks', icon: '💎', threshold: 100, stat: 'tasksCompleted' },

    // Wellness achievements
    { id: 'first-reset', name: 'Self Care Starter', description: 'Complete your first reset', category: 'wellness', icon: '🧘', threshold: 1, stat: 'retuneResets' },
    { id: 'reset-10', name: 'Reset Regular', description: 'Complete 10 resets', category: 'wellness', icon: '🌟', threshold: 10, stat: 'retuneResets' },
    { id: 'first-reframe', name: 'Lyric Rewriter', description: 'Reframe your first negative thought', category: 'wellness', icon: '🎵', threshold: 1, stat: 'reframes' },
    { id: 'reframe-10', name: 'Mind Bender', description: 'Reframe 10 thoughts', category: 'wellness', icon: '🧠', threshold: 10, stat: 'reframes' },

    // Streak achievements
    { id: 'streak-3', name: 'Hat Trick', description: 'Use VENUED 3 days in a row', category: 'streak', icon: '3️⃣', threshold: 3, stat: 'streak' },
    { id: 'streak-7', name: 'Week Warrior', description: 'Use VENUED 7 days in a row', category: 'streak', icon: '7️⃣', threshold: 7, stat: 'streak' },
    { id: 'streak-30', name: 'Month Monster', description: 'Use VENUED 30 days in a row', category: 'streak', icon: '📅', threshold: 30, stat: 'streak' },

    // Creative achievements
    { id: 'first-idea', name: 'Idea Spark', description: 'Capture your first idea', category: 'creative', icon: '💡', threshold: 1, stat: 'ideas' },
    { id: 'idea-10', name: 'Idea Machine', description: 'Capture 10 ideas', category: 'creative', icon: '🚀', threshold: 10, stat: 'ideas' },
    { id: 'first-dump', name: 'Brain Releaser', description: 'Complete your first brain dump', category: 'creative', icon: '📝', threshold: 1, stat: 'brainDumps' },
  ];

  const [stats, setStats] = useState({
    focusSessions: 0,
    dailyFocusMinutes: 0,
    tasksCompleted: 0,
    retuneResets: 0,
    reframes: 0,
    streak: 0,
    ideas: 0,
    brainDumps: 0,
  });
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Gather stats from all modules
    const focusSessions = JSON.parse(localStorage.getItem('venued_focus_sessions') || '[]');
    const crewTasks = JSON.parse(localStorage.getItem('venued_crew_tasks') || '[]');
    const retuneStats = JSON.parse(localStorage.getItem('venued_retune_stats') || '{}');
    const brainDumps = JSON.parse(localStorage.getItem('venued_brain_dumps') || '[]');
    const ideas = JSON.parse(localStorage.getItem('venued_ideas') || '[]');
    const reframes = JSON.parse(localStorage.getItem('venued_outro_logs') || '[]');

    // Calculate daily focus minutes (today)
    const today = new Date().toISOString().split('T')[0];
    const todayFocus = focusSessions
      .filter((s: any) => s.date === today)
      .reduce((sum: number, s: any) => sum + (s.duration || 0), 0);

    // Calculate streak
    const allTimestamps = [
      ...focusSessions.map((s: any) => s.timestamp),
      ...brainDumps.map((d: any) => d.timestamp),
      ...ideas.map((i: any) => i.timestamp),
      ...reframes.map((r: any) => r.timestamp),
    ].filter(Boolean);

    const activityDates = new Set(
      allTimestamps.map((t: string) => new Date(t).toISOString().split('T')[0])
    );

    let currentStreak = 0;
    const todayDate = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    const totalRetuneResets = Object.values(retuneStats).reduce((sum: number, val) => sum + (val as number), 0);

    setStats({
      focusSessions: focusSessions.length,
      dailyFocusMinutes: todayFocus,
      tasksCompleted: crewTasks.filter((t: any) => t.completed).length,
      retuneResets: totalRetuneResets,
      reframes: reframes.length,
      streak: currentStreak,
      ideas: ideas.length,
      brainDumps: brainDumps.length,
    });
  }, []);

  const isUnlocked = (achievement: typeof achievements[0]) => {
    const statValue = stats[achievement.stat as keyof typeof stats] || 0;
    return statValue >= achievement.threshold;
  };

  const getProgress = (achievement: typeof achievements[0]) => {
    const statValue = stats[achievement.stat as keyof typeof stats] || 0;
    return Math.min(100, (statValue / achievement.threshold) * 100);
  };

  const unlockedCount = achievements.filter(isUnlocked).length;
  const categories = ['focus', 'tasks', 'wellness', 'streak', 'creative'];

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked' && !isUnlocked(a)) return false;
    if (filter === 'locked' && isUnlocked(a)) return false;
    if (selectedCategory && a.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="p-6 rounded-xl border-2 border-magenta/30 bg-gradient-to-br from-magenta/10 to-neon-cyan/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Achievements Unlocked</p>
            <p className="text-4xl font-supernova text-white">
              {unlockedCount} <span className="text-gray-500 text-2xl">/ {achievements.length}</span>
            </p>
          </div>
          <div className="text-6xl">{unlockedCount >= 10 ? '🏆' : unlockedCount >= 5 ? '🥈' : unlockedCount >= 1 ? '🥉' : '🎯'}</div>
        </div>
        <div className="mt-4 h-3 bg-[#3d3d3d]/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-magenta to-neon-cyan transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'unlocked', 'locked'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-magenta text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
            !selectedCategory ? 'bg-neon-cyan text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize transition-all ${
              selectedCategory === cat ? 'bg-neon-cyan text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredAchievements.map((achievement) => {
          const unlocked = isUnlocked(achievement);
          const progress = getProgress(achievement);

          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                unlocked
                  ? 'border-magenta/50 bg-magenta/10'
                  : 'border-white/10 bg-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold ${unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.name}
                    </h4>
                    {unlocked && <span className="text-magenta text-xs">✓ UNLOCKED</span>}
                  </div>
                  <p className="text-sm text-gray-400">{achievement.description}</p>

                  {!unlocked && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-[#3d3d3d]/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/30 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats[achievement.stat as keyof typeof stats] || 0} / {achievement.threshold}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-center">
          <p className="text-gray-400">No achievements match your filter</p>
        </div>
      )}

      {/* Coming Soon */}
      <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
        <p className="text-neon-cyan font-semibold text-center">
          🚀 Coming Soon: Leaderboards, achievement sharing, and community challenges!
        </p>
      </div>

      {/* Motivational */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-magenta/10 to-neon-cyan/10 border border-white/10">
        <p className="text-white text-sm font-josefin text-center">
          🤘 Every achievement is proof that your VARIANT brain is capable of amazing things. Keep rocking!
        </p>
      </div>
    </div>
  );
}
