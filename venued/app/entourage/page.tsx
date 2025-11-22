import { Sparkles, Brain, Zap, Target, Clock, Heart } from 'lucide-react';

export default function Entourage() {
  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-electric-purple" />
            <h1 className="text-5xl font-black text-white tracking-tight">
              Entourage
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl">
            Your ADHD support crew. Tools and strategies designed for neurodivergent brains who build amazing things.
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-electric-purple to-neon-pink mt-4" />
        </div>

        {/* Support Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Tool 1 - Focus Mode */}
          <div className="group p-8 rounded-2xl border border-neon-pink/30 bg-gradient-to-br from-neon-pink/10 to-transparent hover:border-neon-pink hover:shadow-[0_0_30px_rgba(255,27,141,0.3)] transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-neon-pink/20 flex items-center justify-center mb-6 group-hover:bg-neon-pink/30 transition-colors">
              <Target className="w-7 h-7 text-neon-pink" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Focus Mode</h3>
            <p className="text-gray-400 mb-4">
              Block distractions and zero in on one task. Because multitasking is a lie.
            </p>
            <button className="text-neon-pink font-semibold hover:text-white transition-colors">
              Activate →
            </button>
          </div>

          {/* Tool 2 - Break Timer */}
          <div className="group p-8 rounded-2xl border border-electric-purple/30 bg-gradient-to-br from-electric-purple/10 to-transparent hover:border-electric-purple hover:shadow-[0_0_30px_rgba(157,78,221,0.3)] transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-electric-purple/20 flex items-center justify-center mb-6 group-hover:bg-electric-purple/30 transition-colors">
              <Clock className="w-7 h-7 text-electric-purple" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Break Timer</h3>
            <p className="text-gray-400 mb-4">
              Pomodoro for rockstars. Work in sprints. Rest between sets. Avoid burnout.
            </p>
            <button className="text-electric-purple font-semibold hover:text-white transition-colors">
              Start Timer →
            </button>
          </div>

          {/* Tool 3 - Energy Tracker */}
          <div className="group p-8 rounded-2xl border border-neon-green/30 bg-gradient-to-br from-neon-green/10 to-transparent hover:border-neon-green hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-neon-green/20 flex items-center justify-center mb-6 group-hover:bg-neon-green/30 transition-colors">
              <Zap className="w-7 h-7 text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Energy Tracker</h3>
            <p className="text-gray-400 mb-4">
              Match tasks to your energy levels. Do heavy lifting when you're charged up.
            </p>
            <button className="text-neon-green font-semibold hover:text-white transition-colors">
              Log Energy →
            </button>
          </div>

          {/* Tool 4 - Brain Dump */}
          <div className="group p-8 rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-transparent hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Brain Dump</h3>
            <p className="text-gray-400 mb-4">
              Get those racing thoughts out of your head. Clear mental space to focus.
            </p>
            <button className="text-white font-semibold hover:text-neon-pink transition-colors">
              Start Dumping →
            </button>
          </div>

          {/* Tool 5 - Win Log */}
          <div className="group p-8 rounded-2xl border border-neon-pink/20 bg-gradient-to-br from-neon-pink/5 to-transparent hover:border-neon-pink/40 hover:shadow-[0_0_30px_rgba(255,27,141,0.2)] transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-neon-pink/10 flex items-center justify-center mb-6 group-hover:bg-neon-pink/20 transition-colors">
              <Heart className="w-7 h-7 text-neon-pink" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Win Log</h3>
            <p className="text-gray-400 mb-4">
              Celebrate every victory, no matter how small. Progress is progress.
            </p>
            <button className="text-neon-pink font-semibold hover:text-white transition-colors">
              Add Win →
            </button>
          </div>

          {/* Tool 6 - Accountability */}
          <div className="group p-8 rounded-2xl border border-electric-purple/20 bg-gradient-to-br from-electric-purple/5 to-transparent hover:border-electric-purple/40 hover:shadow-[0_0_30px_rgba(157,78,221,0.2)] transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-electric-purple/10 flex items-center justify-center mb-6 group-hover:bg-electric-purple/20 transition-colors">
              <Sparkles className="w-7 h-7 text-electric-purple" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Accountability</h3>
            <p className="text-gray-400 mb-4">
              Share your goals. Get support. Stay on track with your crew.
            </p>
            <button className="text-electric-purple font-semibold hover:text-white transition-colors">
              Set Up →
            </button>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-r from-neon-pink/10 via-electric-purple/10 to-neon-green/10 backdrop-blur-sm text-center">
          <Sparkles className="w-10 h-10 text-electric-purple mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Built for Your Brain
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            These tools aren't just features—they're your backstage crew. They understand ADHD because they were built with it in mind. Use what works. Skip what doesn't. This is your show.
          </p>
        </div>
      </div>
    </div>
  );
}
