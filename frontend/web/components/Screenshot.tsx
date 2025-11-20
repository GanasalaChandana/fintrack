'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import Image from 'next/image';

interface Screenshot {
  id: number;
  title: string;
  description: string;
  image: string;
  alt: string;
}

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoMode, setVideoMode] = useState(false);

  // Demo screenshots - replace with your actual images
  const screenshots: Screenshot[] = [
    {
      id: 1,
      title: 'Interactive Dashboard',
      description: 'View your financial health at a glance with real-time charts and analytics',
      image: '/screenshots/dashboard.png', // Add your images to public/screenshots/
      alt: 'FinTrack Dashboard showing income and expense charts'
    },
    {
      id: 2,
      title: 'Smart CSV Import',
      description: 'Import transactions from any bank with automatic categorization',
      image: '/screenshots/import.png',
      alt: 'CSV import interface with drag and drop functionality'
    },
    {
      id: 3,
      title: 'Detailed Reports',
      description: 'Generate comprehensive financial reports and export to PDF or Excel',
      image: '/screenshots/reports.png',
      alt: 'Monthly financial report with charts and tables'
    },
    {
      id: 4,
      title: 'Transaction Management',
      description: 'Easily categorize, filter, and search through all your transactions',
      image: '/screenshots/transactions.png',
      alt: 'Transaction list with filtering and search options'
    },
    {
      id: 5,
      title: 'Budget Tracking',
      description: 'Set budgets by category and track your progress in real-time',
      image: '/screenshots/budgets.png',
      alt: 'Budget tracking interface with progress bars'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-advance slides
  useEffect(() => {
    if (!isOpen || videoMode) return;

    const interval = setInterval(nextSlide, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [isOpen, videoMode, currentIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl max-w-6xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition shadow-lg z-10"
          aria-label="Close demo"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-4 border-b border-slate-700">
          <button
            onClick={() => setVideoMode(false)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !videoMode
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Screenshots
          </button>
          <button
            onClick={() => setVideoMode(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              videoMode
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Video Demo
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {videoMode ? (
            // Video Mode
            <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center">
              {/* Replace with actual video player when you have a video */}
              {process.env.NEXT_PUBLIC_DEMO_VIDEO_URL ? (
                <iframe
                  src={process.env.NEXT_PUBLIC_DEMO_VIDEO_URL}
                  className="w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center">
                  <Play className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Demo video coming soon!</p>
                  <p className="text-sm text-gray-500">
                    In the meantime, explore our screenshots or try the free trial
                  </p>
                  <a
                    href="/login?mode=signup"
                    className="inline-block mt-4 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full text-white font-semibold hover:shadow-lg transition"
                  >
                    Start Free Trial
                  </a>
                </div>
              )}
            </div>
          ) : (
            // Screenshot Carousel Mode
            <div className="relative">
              {/* Main Image */}
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4 relative">
                {screenshots[currentIndex].image.startsWith('/screenshots/') ? (
                  // Placeholder for when images don't exist yet
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-6xl font-bold text-white">
                        {currentIndex + 1}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {screenshots[currentIndex].title}
                      </h3>
                      <p className="text-gray-400">
                        {screenshots[currentIndex].description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={screenshots[currentIndex].image}
                    alt={screenshots[currentIndex].alt}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition"
                aria-label="Next screenshot"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Info */}
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {screenshots[currentIndex].title}
                </h3>
                <p className="text-gray-400">
                  {screenshots[currentIndex].description}
                </p>
              </div>

              {/* Thumbnails / Dots */}
              <div className="flex items-center justify-center gap-2">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all ${
                      index === currentIndex
                        ? 'w-8 h-2 bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
                    } rounded-full`}
                    aria-label={`Go to screenshot ${index + 1}`}
                  />
                ))}
              </div>

              {/* Counter */}
              <p className="text-center text-gray-500 text-sm mt-2">
                {currentIndex + 1} / {screenshots.length}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <a
              href="/login?mode=signup"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-full text-center font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition text-white"
            >
              Start Free Trial
            </a>
            <button
              onClick={onClose}
              className="flex-1 border-2 border-purple-400 px-6 py-3 rounded-full font-semibold hover:bg-purple-400/10 transition text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}