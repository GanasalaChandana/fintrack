"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Shield, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnimatedHero() {
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    // Animate counters
    const animateValue = (start: number, end: number, duration: number, setter: (val: number) => void) => {
      const startTime = Date.now();
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        setter(Math.floor(start + (end - start) * easeOutQuad));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    };

    animateValue(0, 12450, 2000, setTotalUsers);
    animateValue(0, 245780, 2500, setTotalTransactions);
    animateValue(0, 3250000, 2500, setTotalSavings);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm animate-fade-in">
            <Zap className="h-4 w-4" />
            <span>AI-Powered Financial Intelligence</span>
          </div>

          {/* Main heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl animate-slide-up">
            Take Control of Your
            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Financial Future
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100 animate-slide-up-delay-1">
            Track expenses, analyze spending patterns, and make informed financial 
            decisions with ease. Join thousands managing their money smarter.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-slide-up-delay-2">
            <button
              onClick={() => router.push("/register")}
              className="group rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 inline h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => router.push("/register?mode=signin")}
              className="rounded-full border-2 border-white bg-transparent px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-purple-600"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 animate-fade-in-delay">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-4xl font-bold text-white">
                {totalUsers.toLocaleString()}+
              </div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-4xl font-bold text-white">
                {totalTransactions.toLocaleString()}+
              </div>
              <div className="text-blue-100">Transactions Tracked</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-2 text-4xl font-bold text-white">
                ${(totalSavings / 1000000).toFixed(1)}M+
              </div>
              <div className="text-blue-100">Money Saved</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float linear infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fade-in-delay { animation: fade-in 1s ease-out 0.8s both; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-slide-up-delay-1 { animation: slide-up 0.6s ease-out 0.2s both; }
        .animate-slide-up-delay-2 { animation: slide-up 0.6s ease-out 0.4s both; }
      `}</style>
    </div>
  );
}