import { Music, TrendingUp, Clock, Star } from 'lucide-react';

export default function Backstage() {
  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-10 h-10 text-neon-pink" />
            <h1 className="text-5xl font-black text-white tracking-tight">
              Backstage
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl">
            Your command center. See what's happening, what's next, and what needs your attention.
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-pink to-electric-purple mt-4" />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stat Card 1 */}
          <div className="p-6 rounded-xl border border-neon-pink/30 bg-gradient-to-br from-neon-pink/10 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-neon-pink" />
              <span className="text-3xl font-black text-white">0</span>
            </div>
            <p className="text-gray-400 font-medium">Active Projects</p>
          </div>

          {/* Stat Card 2 */}
          <div className="p-6 rounded-xl border border-electric-purple/30 bg-gradient-to-br from-electric-purple/10 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-electric-purple" />
              <span className="text-3xl font-black text-white">0</span>
            </div>
            <p className="text-gray-400 font-medium">Tasks Completed</p>
          </div>

          {/* Stat Card 3 */}
          <div className="p-6 rounded-xl border border-neon-green/30 bg-gradient-to-br from-neon-green/10 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-neon-green" />
              <span className="text-3xl font-black text-white">0</span>
            </div>
            <p className="text-gray-400 font-medium">Hours Logged</p>
          </div>

          {/* Stat Card 4 */}
          <div className="p-6 rounded-xl border border-white/30 bg-gradient-to-br from-white/10 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <Music className="w-8 h-8 text-white" />
              <span className="text-3xl font-black text-white">0</span>
            </div>
            <p className="text-gray-400 font-medium">Milestones Hit</p>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="flex items-center justify-center h-48 text-gray-500">
              <p className="text-center">
                No activity yet.<br />Start your first project to see the magic happen.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Upcoming Deadlines</h2>
            <div className="flex items-center justify-center h-48 text-gray-500">
              <p className="text-center">
                No deadlines set.<br />You're in control of your timeline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
