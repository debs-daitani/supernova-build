'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Rocket, Target, Calendar, Brain, Users, Star, Check, Play } from 'lucide-react';
import { generateDemoData, isDemoDataLoaded } from '@/lib/demoData';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [demoLoaded, setDemoLoaded] = useState(false);

  useEffect(() => {
    setDemoLoaded(isDemoDataLoaded());
  }, []);

  const handleLoadDemo = () => {
    generateDemoData();
    setDemoLoaded(true);
    router.push('/backstage');
  };

  const features = [
    {
      icon: Calendar,
      title: 'BACKSTAGE',
      subtitle: 'Project Dashboard',
      description: 'Your command center. See all projects at a glance, track progress, manage priorities.',
      color: 'neon-pink',
    },
    {
      icon: Star,
      title: 'SETLIST',
      subtitle: 'Project Builder',
      description: 'Build your project like a setlist. Drag-and-drop phases, add tasks, plan your show.',
      color: 'electric-purple',
    },
    {
      icon: Users,
      title: 'CREW',
      subtitle: 'Task Manager',
      description: 'Your daily task crew. Energy matching, focus timer, quick wins for momentum.',
      color: 'neon-green',
    },
    {
      icon: Calendar,
      title: 'TOUR',
      subtitle: 'Timeline View',
      description: 'Strategic week view with ADHD reality checks. See workload, avoid burnout, stay on track.',
      color: 'blue-400',
    },
    {
      icon: Brain,
      title: 'ENTOURAGE',
      subtitle: 'ADHD Support Tools',
      description: '8 specialized tools: time blindness tracker, hyperfocus logger, energy tracker, and more.',
      color: 'yellow-400',
    },
  ];

  const benefits = [
    'Time blindness? Track your actual vs estimated times',
    'Hyperfocus tracking with trigger identification',
    'Energy level matching for optimal task scheduling',
    'Executive function helpers for decision paralysis',
    'Brain dump space for clearing mental clutter',
    'Dopamine menu with gamified rewards',
    'Body doubling simulator for accountability',
    'Pattern insights with personalized recommendations',
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-electric-purple/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Logo/Title */}
          <div className="mb-8">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter mb-4">
              <span className="inline-block bg-gradient-to-r from-neon-pink via-electric-purple to-neon-pink bg-clip-text text-transparent animate-pulse">
                VENUED
              </span>
            </h1>
            <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-neon-pink to-transparent" />
          </div>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 tracking-wide">
            Strategic project planning for ADHD brains who build like rockstars
          </p>

          {/* Sub-tagline */}
          <p className="text-lg sm:text-xl text-gray-400 mb-12 font-medium">
            Plan your projects like a tour. Execute like a headliner.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!demoLoaded ? (
              <button
                onClick={handleLoadDemo}
                className="group inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-black bg-neon-pink rounded-full hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(255,27,141,0.5)] hover:shadow-[0_0_50px_rgba(255,27,141,0.8)]"
              >
                <Play className="w-6 h-6" />
                Try Demo
              </button>
            ) : (
              <Link
                href="/backstage"
                className="group inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-black bg-neon-pink rounded-full hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(255,27,141,0.5)] hover:shadow-[0_0_50px_rgba(255,27,141,0.8)]"
              >
                Get VENUED
                <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            <Link
              href="/backstage"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/10 rounded-full hover:bg-white/20 transition-all border-2 border-white/20 hover:border-white/40"
            >
              Start Fresh
            </Link>
          </div>

          {/* Secondary text */}
          <p className="mt-8 text-sm text-gray-500 uppercase tracking-widest font-semibold">
            Get VENUED. Get it Done.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-4">
          Your Backstage Crew
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Five powerful sections working together to help you ship your projects
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`group p-8 rounded-2xl border-2 border-${feature.color}/20 bg-black/50 backdrop-blur-sm hover:border-${feature.color}/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,27,141,0.2)]`}
              >
                <div className={`w-14 h-14 rounded-full bg-${feature.color}/20 flex items-center justify-center mb-4 group-hover:bg-${feature.color}/30 transition-colors`}>
                  <Icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">{feature.title}</h3>
                <p className={`text-sm text-${feature.color} font-semibold mb-3`}>{feature.subtitle}</p>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADHD Benefits Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 border-2 border-electric-purple/30">
          <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-4">
            Built for ADHD Brains
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Not just features—actual tools that understand how your brain works
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                <Check className="w-6 h-6 text-neon-green flex-shrink-0 mt-1" />
                <span className="text-white">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-16">
          How It Works
        </h2>

        <div className="space-y-12">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-neon-pink flex items-center justify-center text-black font-black text-xl flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Plan Your Show</h3>
              <p className="text-gray-400">
                Use Setlist to build your project. Break it into phases, add tasks, set energy levels. The builder makes it easy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-electric-purple flex items-center justify-center text-white font-black text-xl flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Schedule Your Crew</h3>
              <p className="text-gray-400">
                Move tasks to your daily schedule. Match them to your energy levels. Use the focus timer. Get stuff done.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center text-black font-black text-xl flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Track & Optimize</h3>
              <p className="text-gray-400">
                Use Entourage tools to understand your patterns. Time blindness tracker, hyperfocus logger, energy tracking. Learn what works for YOUR brain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
          Ready to Get VENUED?
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          Free. Offline-capable. Built for your brain.
        </p>

        {!demoLoaded ? (
          <button
            onClick={handleLoadDemo}
            className="group inline-flex items-center gap-3 px-12 py-6 text-2xl font-bold text-black bg-gradient-to-r from-neon-pink to-electric-purple rounded-full hover:shadow-[0_0_50px_rgba(255,27,141,0.8)] transition-all duration-300 transform hover:scale-105"
          >
            <Play className="w-7 h-7" />
            Try Demo Now
          </button>
        ) : (
          <Link
            href="/backstage"
            className="group inline-flex items-center gap-3 px-12 py-6 text-2xl font-bold text-black bg-gradient-to-r from-neon-pink to-electric-purple rounded-full hover:shadow-[0_0_50px_rgba(255,27,141,0.8)] transition-all duration-300 transform hover:scale-105"
          >
            Open Backstage
            <Rocket className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="relative border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © 2025 VENUED. Built for ADHD brains, by ADHD brains.
            </div>
            <div className="flex gap-6">
              <Link href="/backstage" className="text-gray-500 hover:text-neon-pink transition-colors">
                Backstage
              </Link>
              <Link href="/setlist" className="text-gray-500 hover:text-electric-purple transition-colors">
                Setlist
              </Link>
              <Link href="/crew" className="text-gray-500 hover:text-neon-green transition-colors">
                Crew
              </Link>
              <Link href="/tour" className="text-gray-500 hover:text-blue-400 transition-colors">
                Tour
              </Link>
              <Link href="/entourage" className="text-gray-500 hover:text-yellow-400 transition-colors">
                Entourage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
