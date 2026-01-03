// components/FinancialHealthScore.tsx
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { calculateFinancialHealthScore, type FinancialData, type HealthScoreResult } from '@/lib/utils/healthScore';

interface FinancialHealthScoreProps {
  data: FinancialData;
}

export function FinancialHealthScore({ data }: FinancialHealthScoreProps) {
  const [score, setScore] = useState<HealthScoreResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const result = calculateFinancialHealthScore(data);
    setScore(result);

    // Animate score counting up
    let current = 0;
    const increment = result.totalScore / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.totalScore) {
        setAnimatedScore(result.totalScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [data]);

  if (!score) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'B': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'C': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'D': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'F': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'fair': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5" />;
      case 'fair':
        return <AlertCircle className="w-5 h-5" />;
      case 'poor':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Financial Health Score
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your overall financial wellness rating
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 mb-6">
          {/* Score Circle */}
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - animatedScore / 1000)}`}
                className="text-purple-600 dark:text-purple-400 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-black text-purple-600 dark:text-purple-400">
                {animatedScore}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                out of 1000
              </div>
            </div>
          </div>

          {/* Grade Badge */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full text-6xl font-black ${getGradeColor(score.grade)}`}>
              {score.grade}
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
              Grade
            </p>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {/* Strengths */}
          {score.strengths.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Your Strengths
                </h3>
              </div>
              <ul className="space-y-1">
                {score.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {score.improvements.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  Focus Areas
                </h3>
              </div>
              <ul className="space-y-1">
                {score.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Score Breakdown
        </h3>

        <div className="space-y-4">
          {Object.entries(score.components).map(([key, component]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(component.status)}`}>
                    {getStatusIcon(component.status)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {component.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {component.score}
                  </div>
                  <div className="text-xs text-gray-500">
                    / {component.maxScore}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    component.status === 'excellent' || component.status === 'good'
                      ? 'bg-green-500'
                      : component.status === 'fair'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(component.score / component.maxScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Personalized Recommendations
          </h3>
        </div>

        <ul className="space-y-3">
          {score.recommendations.map((recommendation, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                {index + 1}
              </div>
              <p className="text-sm text-blue-900 dark:text-blue-100 flex-1">
                {recommendation}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}