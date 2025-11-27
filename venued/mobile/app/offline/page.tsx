import { WifiOff, RefreshCw } from 'lucide-react';

export default function Offline() {
  return (
    <div className="min-h-screen bg-black pt-20 px-4 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-pink/20 to-electric-purple/20 border-2 border-neon-pink/30 flex items-center justify-center mx-auto mb-8">
          <WifiOff className="w-12 h-12 text-neon-pink" />
        </div>

        <h1 className="text-4xl font-black text-white mb-4">You're Offline</h1>

        <p className="text-xl text-gray-400 mb-8">
          No internet connection. But don't worry - VENUED works offline!
        </p>

        <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10 mb-8">
          <h3 className="text-lg font-bold text-white mb-2">What Still Works:</h3>
          <ul className="text-left text-gray-300 space-y-2">
            <li>• View all your projects and tasks</li>
            <li>• Add new tasks and projects</li>
            <li>• Update task status</li>
            <li>• Use all ADHD tools</li>
            <li>• Everything syncs when you're back online</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-gradient-to-r from-neon-pink to-electric-purple rounded-xl text-white font-bold hover:shadow-[0_0_30px_rgba(255,27,141,0.6)] transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        <p className="text-sm text-gray-600 mt-6">
          All your data is stored locally and safe
        </p>
      </div>
    </div>
  );
}
