import { Calendar, MapPin, Clock, Flag } from 'lucide-react';

export default function Tour() {
  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-10 h-10 text-neon-pink" />
            <h1 className="text-5xl font-black text-white tracking-tight">
              Tour
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl">
            Your project timeline. See the full tour schedule from kickoff to grand finale.
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-pink to-electric-purple mt-4" />
        </div>

        {/* Timeline Visualization */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-pink via-electric-purple to-neon-green" />

          {/* Timeline Items */}
          <div className="space-y-12 relative">
            {/* Sample Timeline Item - Start */}
            <div className="flex gap-8 items-start">
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-neon-pink flex items-center justify-center shadow-[0_0_20px_rgba(255,27,141,0.6)]">
                  <Flag className="w-8 h-8 text-black" />
                </div>
              </div>
              <div className="flex-1 p-6 rounded-xl border border-neon-pink/30 bg-neon-pink/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-4 h-4 text-neon-pink" />
                  <span className="text-sm text-gray-400 font-medium">Kickoff</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Project Launch</h3>
                <p className="text-gray-400">
                  The beginning of your journey. Every tour starts with a first show.
                </p>
              </div>
            </div>

            {/* Sample Timeline Item - Milestone */}
            <div className="flex gap-8 items-start opacity-50">
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-electric-purple flex items-center justify-center shadow-[0_0_20px_rgba(157,78,221,0.6)]">
                  <MapPin className="w-8 h-8 text-black" />
                </div>
              </div>
              <div className="flex-1 p-6 rounded-xl border border-electric-purple/30 bg-electric-purple/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-4 h-4 text-electric-purple" />
                  <span className="text-sm text-gray-400 font-medium">Milestone</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">First Major Milestone</h3>
                <p className="text-gray-400">
                  Key checkpoints on your tour. Celebrate every venue you conquer.
                </p>
              </div>
            </div>

            {/* Sample Timeline Item - End */}
            <div className="flex gap-8 items-start opacity-30">
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-neon-green flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.6)]">
                  <Flag className="w-8 h-8 text-black" />
                </div>
              </div>
              <div className="flex-1 p-6 rounded-xl border border-neon-green/30 bg-neon-green/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-4 h-4 text-neon-green" />
                  <span className="text-sm text-gray-400 font-medium">Grand Finale</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Project Complete</h3>
                <p className="text-gray-400">
                  The final show. Ship it and take a bow. You earned it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Message */}
        <div className="mt-16 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Your Tour Schedule Is Empty
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Start a project and map out your milestones. Watch your timeline come to life as you build.
          </p>
        </div>
      </div>
    </div>
  );
}
