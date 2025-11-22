import { ListChecks, Plus, Sparkles } from 'lucide-react';

export default function Setlist() {
  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ListChecks className="w-10 h-10 text-electric-purple" />
              <h1 className="text-5xl font-black text-white tracking-tight">
                Setlist
              </h1>
            </div>
            <button className="group flex items-center gap-2 px-6 py-3 bg-neon-pink rounded-full text-black font-bold hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,27,141,0.4)] hover:shadow-[0_0_30px_rgba(255,27,141,0.6)]">
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl">
            Build your projects like a rockstar setlist. Every milestone is a hit song. Every task is part of the show.
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-electric-purple to-neon-pink mt-4" />
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 to-electric-purple/20 blur-3xl" />
            <div className="relative p-12 rounded-3xl border border-white/10 bg-black/80 backdrop-blur-sm">
              <Sparkles className="w-16 h-16 text-electric-purple mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4 text-center">
                Your Stage Awaits
              </h2>
              <p className="text-gray-400 text-center max-w-md mb-8">
                No projects yet. Time to plan your next big launch. Every headliner started with an empty stage.
              </p>
              <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-pink to-electric-purple rounded-full text-white font-bold hover:shadow-[0_0_40px_rgba(255,27,141,0.6)] transition-all duration-300">
                <Plus className="w-5 h-5" />
                Create Your First Project
              </button>
            </div>
          </div>
        </div>

        {/* Future: Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
          {/* Project cards will go here */}
        </div>
      </div>
    </div>
  );
}
