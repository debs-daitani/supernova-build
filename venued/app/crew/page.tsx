import { Users, CheckSquare, Square, Circle } from 'lucide-react';

export default function Crew() {
  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-neon-green" />
            <h1 className="text-5xl font-black text-white tracking-tight">
              Crew
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl">
            Manage your tasks like a tour crew manages a show. Everyone has a role. Everything has a purpose.
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-green to-neon-pink mt-4" />
        </div>

        {/* Task Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* To Do Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-gray-500" />
                <h2 className="text-xl font-bold text-white">To Do</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-sm font-semibold">
                0
              </span>
            </div>
            <div className="p-8 rounded-xl border border-dashed border-gray-700 bg-gray-900/30">
              <p className="text-center text-gray-500">
                No pending tasks.<br />Ready to add some?
              </p>
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Square className="w-5 h-5 text-electric-purple" />
                <h2 className="text-xl font-bold text-white">In Progress</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-electric-purple/20 text-electric-purple text-sm font-semibold">
                0
              </span>
            </div>
            <div className="p-8 rounded-xl border border-dashed border-electric-purple/30 bg-electric-purple/5">
              <p className="text-center text-gray-500">
                Nothing in the works.<br />Time to start building!
              </p>
            </div>
          </div>

          {/* Done Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-neon-green" />
                <h2 className="text-xl font-bold text-white">Done</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-sm font-semibold">
                0
              </span>
            </div>
            <div className="p-8 rounded-xl border border-dashed border-neon-green/30 bg-neon-green/5">
              <p className="text-center text-gray-500">
                No completed tasks yet.<br />Your wins will show here!
              </p>
            </div>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="mt-12 flex justify-center">
          <button className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-neon-green to-electric-purple rounded-full text-black font-bold hover:shadow-[0_0_40px_rgba(57,255,20,0.5)] transition-all duration-300 transform hover:scale-105">
            <Circle className="w-5 h-5" />
            Add New Task
          </button>
        </div>
      </div>
    </div>
  );
}
