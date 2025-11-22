import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      <div className="text-center text-white px-6">
        <div className="text-8xl mb-6">✨</div>
        <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">
          SUPERNova AI
        </h1>
        <p className="text-2xl mb-8 opacity-90">
          Your no-bullshit business coach for midlife entrepreneurs
        </p>
        <Link
          href="/supernova"
          className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
        >
          Launch SUPERNova 🚀
        </Link>
        <div className="mt-12 text-sm opacity-75">
          <p>Body • Brain • Business</p>
          <p className="mt-2">Direct. Sweary. Anti-bullshit.</p>
        </div>
      </div>
    </div>
  );
}
