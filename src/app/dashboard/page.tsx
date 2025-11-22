"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysSinceJoined, setDaysSinceJoined] = useState(0);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);

        // Calculate days since joined
        const joinDate = new Date(data.user.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysSinceJoined(diffDays);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const accountTypes: Record<string, { label: string; color: string }> = {
    FREE: { label: "Free Account", color: "bg-gray-100 text-gray-700" },
    UPGRADE: { label: "Upgrade Member", color: "bg-yellow-100 text-yellow-700" },
    MEMBER: { label: "Premium Member", color: "bg-green-100 text-green-700" },
  };

  const accountType = accountTypes[user.role] || accountTypes.FREE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">The dAItaniverse</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Welcome back, {user.name || user.email.split("@")[0]}!
          </h2>
          <p className="text-xl text-pink-100">
            Your rockstar journey continues here
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Account Type Card */}
          <div className="bg-white/95 rounded-2xl shadow-2xl p-6">
            <div className="text-sm text-gray-500 mb-2">Account Type</div>
            <div
              className={`inline-block px-4 py-2 rounded-full font-bold ${accountType.color}`}
            >
              {accountType.label}
            </div>
            {user.role === "FREE" && (
              <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-lg transition-all">
                Upgrade Now
              </button>
            )}
          </div>

          {/* Days Since Joined Card */}
          <div className="bg-white/95 rounded-2xl shadow-2xl p-6">
            <div className="text-sm text-gray-500 mb-2">Member Since</div>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {daysSinceJoined}
            </div>
            <div className="text-gray-600">
              {daysSinceJoined === 1 ? "day" : "days"} ago
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white/95 rounded-2xl shadow-2xl p-6">
            <div className="text-sm text-gray-500 mb-4">Quick Actions</div>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/supernova")}
                className="w-full px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg font-semibold transition-all text-left"
              >
                Launch SUPERNova AI
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold transition-all text-left"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* SUPERNova AI Tile */}
          <button
            onClick={() => router.push("/supernova")}
            className="bg-white/95 rounded-2xl shadow-2xl p-8 hover:scale-105 transition-all duration-300 text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-all">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              SUPERNova AI
            </h3>
            <p className="text-gray-600 text-sm">
              Chat with your AI companion for Body, Brain, and Business guidance
            </p>
          </button>

          {/* Content Library Tile */}
          <div className="bg-white/95 rounded-2xl shadow-2xl p-8 opacity-60 cursor-not-allowed text-left relative">
            <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
              Coming Soon
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Content Library
            </h3>
            <p className="text-gray-600 text-sm">
              Access exclusive courses, guides, and resources
            </p>
          </div>

          {/* Programs Tile */}
          <div className="bg-white/95 rounded-2xl shadow-2xl p-8 opacity-60 cursor-not-allowed text-left relative">
            <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
              Coming Soon
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Programs</h3>
            <p className="text-gray-600 text-sm">
              Join structured programs to level up your skills
            </p>
          </div>

          {/* Profile Settings Tile */}
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white/95 rounded-2xl shadow-2xl p-8 hover:scale-105 transition-all duration-300 text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-all">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Profile Settings
            </h3>
            <p className="text-gray-600 text-sm">
              Manage your account and preferences
            </p>
          </button>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 bg-white/95 rounded-2xl shadow-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to level up your rockstar journey?
          </h3>
          <p className="text-gray-600 mb-6">
            Start chatting with SUPERNova AI to get personalized guidance for your Body, Brain, and Business goals.
          </p>
          <button
            onClick={() => router.push("/supernova")}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Launch SUPERNova AI
          </button>
        </div>
      </div>
    </div>
  );
}
