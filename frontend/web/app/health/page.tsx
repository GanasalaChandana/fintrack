"use client";

import { useState, useEffect } from "react";
import { Activity, Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Lightbulb } from "lucide-react";
import { transactionsAPI, budgetsAPI } from "@/lib/api";

// Types
interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  totalDebt: number;
  emergencyFund: number;
  monthlyBudget: number;
  actualSpending: number;
  onTimePayments: number;
  totalPayments: number;
}

interface ComponentScore {
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
}

interface HealthScoreResult {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  components: {
    savingsRate: ComponentScore;
    debtToIncome: ComponentScore;
    emergencyFund: ComponentScore;
    budgetAdherence: ComponentScore;
    paymentHistory: ComponentScore;
  };
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

// All the calculation functions
function calculateSavingsRate(data: FinancialData): ComponentScore {
  const savingsAmount = data.monthlyIncome - data.monthlyExpenses;
  const savingsRate = data.monthlyIncome > 0 ? (savingsAmount / data.monthlyIncome) * 100 : 0;

  let score = 0;
  let status: ComponentScore['status'] = 'poor';
  let description = '';

  if (savingsRate >= 20) {
    score = 100;
    status = 'excellent';
    description = 'Excellent! You\'re saving 20%+ of your income.';
  } else if (savingsRate >= 15) {
    score = 85;
    status = 'good';
    description = 'Good savings rate. Aim for 20% for optimal financial health.';
  } else if (savingsRate >= 10) {
    score = 70;
    status = 'fair';
    description = 'Fair savings rate. Try to increase to 15-20%.';
  } else if (savingsRate >= 5) {
    score = 50;
    status = 'fair';
    description = 'Low savings rate. Focus on increasing to at least 10%.';
  } else {
    score = 25;
    status = 'poor';
    description = 'Critical: Very low or negative savings. Review expenses.';
  }

  return { score, maxScore: 100, percentage: savingsRate, status, description };
}

function calculateDebtToIncome(data: FinancialData): ComponentScore {
  const dti = data.monthlyIncome > 0 ? (data.totalDebt / (data.monthlyIncome * 12)) * 100 : 0;

  let score = 0;
  let status: ComponentScore['status'] = 'poor';
  let description = '';

  if (dti === 0) {
    score = 100;
    status = 'excellent';
    description = 'Debt-free! Excellent financial position.';
  } else if (dti <= 36) {
    score = 90;
    status = 'excellent';
    description = 'Excellent debt-to-income ratio below 36%.';
  } else if (dti <= 43) {
    score = 75;
    status = 'good';
    description = 'Manageable debt level. Keep monitoring.';
  } else if (dti <= 50) {
    score = 50;
    status = 'fair';
    description = 'High debt level. Consider debt reduction strategies.';
  } else {
    score = 25;
    status = 'poor';
    description = 'Critical debt level. Seek debt reduction plan.';
  }

  return { score, maxScore: 100, percentage: dti, status, description };
}

function calculateEmergencyFund(data: FinancialData): ComponentScore {
  const monthsCovered = data.monthlyExpenses > 0 ? data.emergencyFund / data.monthlyExpenses : 0;

  let score = 0;
  let status: ComponentScore['status'] = 'poor';
  let description = '';

  if (monthsCovered >= 6) {
    score = 100;
    status = 'excellent';
    description = 'Excellent! You have 6+ months of expenses saved.';
  } else if (monthsCovered >= 3) {
    score = 80;
    status = 'good';
    description = 'Good emergency fund. Aim for 6 months coverage.';
  } else if (monthsCovered >= 1) {
    score = 60;
    status = 'fair';
    description = 'Build your emergency fund to 3-6 months of expenses.';
  } else if (monthsCovered > 0) {
    score = 30;
    status = 'poor';
    description = 'Critical: Emergency fund too low. Start building it.';
  } else {
    score = 0;
    status = 'poor';
    description = 'No emergency fund. This should be your top priority.';
  }

  return { score, maxScore: 100, percentage: monthsCovered * 100 / 6, status, description };
}

function calculateBudgetAdherence(data: FinancialData): ComponentScore {
  const adherence = data.monthlyBudget > 0 
    ? Math.max(0, (1 - Math.abs(data.actualSpending - data.monthlyBudget) / data.monthlyBudget)) * 100
    : 0;

  let score = 0;
  let status: ComponentScore['status'] = 'poor';
  let description = '';

  if (adherence >= 95) {
    score = 100;
    status = 'excellent';
    description = 'Excellent budget adherence!';
  } else if (adherence >= 85) {
    score = 85;
    status = 'good';
    description = 'Good budget management. Minor adjustments needed.';
  } else if (adherence >= 70) {
    score = 70;
    status = 'fair';
    description = 'Fair budget adherence. Review spending categories.';
  } else if (adherence >= 50) {
    score = 50;
    status = 'fair';
    description = 'Budget needs attention. Track spending more closely.';
  } else {
    score = 25;
    status = 'poor';
    description = 'Poor budget adherence. Revise budget or spending habits.';
  }

  return { score, maxScore: 100, percentage: adherence, status, description };
}

function calculatePaymentHistory(data: FinancialData): ComponentScore {
  const onTimeRate = data.totalPayments > 0 
    ? (data.onTimePayments / data.totalPayments) * 100
    : 100;

  let score = 0;
  let status: ComponentScore['status'] = 'poor';
  let description = '';

  if (onTimeRate === 100) {
    score = 100;
    status = 'excellent';
    description = 'Perfect payment history!';
  } else if (onTimeRate >= 95) {
    score = 90;
    status = 'excellent';
    description = 'Excellent payment history.';
  } else if (onTimeRate >= 85) {
    score = 75;
    status = 'good';
    description = 'Good payment history. Stay consistent.';
  } else if (onTimeRate >= 70) {
    score = 50;
    status = 'fair';
    description = 'Fair payment history. Avoid late payments.';
  } else {
    score = 25;
    status = 'poor';
    description = 'Poor payment history. Set up auto-pay.';
  }

  return { score, maxScore: 100, percentage: onTimeRate, status, description };
}

function calculateFinancialHealthScore(data: FinancialData): HealthScoreResult {
  const savingsRate = calculateSavingsRate(data);
  const debtToIncome = calculateDebtToIncome(data);
  const emergencyFund = calculateEmergencyFund(data);
  const budgetAdherence = calculateBudgetAdherence(data);
  const paymentHistory = calculatePaymentHistory(data);

  const totalScore = Math.round(
    savingsRate.score * 2.5 +
    debtToIncome.score * 2.5 +
    emergencyFund.score * 2.0 +
    budgetAdherence.score * 2.0 +
    paymentHistory.score * 1.0
  );

  const getGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score >= 900) return 'A';
    if (score >= 800) return 'B';
    if (score >= 700) return 'C';
    if (score >= 600) return 'D';
    return 'F';
  };

  const components = { savingsRate, debtToIncome, emergencyFund, budgetAdherence, paymentHistory };

  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  Object.entries(components).forEach(([key, component]) => {
    const labels = {
      savingsRate: { strength: 'Strong savings habits', improvement: 'Increase savings rate' },
      debtToIncome: { strength: 'Manageable debt levels', improvement: 'Reduce debt burden' },
      emergencyFund: { strength: 'Well-funded emergency savings', improvement: 'Build emergency fund' },
      budgetAdherence: { strength: 'Excellent budget discipline', improvement: 'Improve budget adherence' },
      paymentHistory: { strength: 'Consistent payment history', improvement: 'Maintain on-time payments' },
    };

    if (component.status === 'excellent' || component.status === 'good') {
      strengths.push(labels[key as keyof typeof labels].strength);
    } else {
      improvements.push(labels[key as keyof typeof labels].improvement);
    }
  });

  if (savingsRate.status === 'poor' || savingsRate.status === 'fair') {
    recommendations.push('Increase your savings rate to at least 15% of income');
    recommendations.push('Set up automatic transfers to savings on payday');
  }
  if (debtToIncome.status === 'poor' || debtToIncome.status === 'fair') {
    recommendations.push('Focus on paying down high-interest debt first');
  }
  if (emergencyFund.status === 'poor' || emergencyFund.status === 'fair') {
    recommendations.push('Build emergency fund to cover 3-6 months of expenses');
  }
  if (budgetAdherence.status === 'poor' || budgetAdherence.status === 'fair') {
    recommendations.push('Review and adjust your budget to match spending patterns');
  }
  if (paymentHistory.status === 'poor' || paymentHistory.status === 'fair') {
    recommendations.push('Set up automatic payments to avoid late fees');
  }

  return {
    totalScore,
    grade: getGrade(totalScore),
    components,
    recommendations: recommendations.slice(0, 5),
    strengths,
    improvements,
  };
}

// Component
function FinancialHealthScore({ data }: { data: FinancialData }) {
  const [score, setScore] = useState<HealthScoreResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const result = calculateFinancialHealthScore(data);
    setScore(result);

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
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
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
      <div className="bg-white rounded-2xl p-8 border-2 border-purple-200 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Health Score</h2>
          <p className="text-gray-600">Your overall financial wellness rating</p>
        </div>

        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-gray-200" />
              <circle
                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - animatedScore / 1000)}`}
                className="text-purple-600 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-black text-purple-600">{animatedScore}</div>
              <div className="text-sm text-gray-500">out of 1000</div>
            </div>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full text-6xl font-black ${getGradeColor(score.grade)}`}>
              {score.grade}
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-700">Grade</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {score.strengths.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Your Strengths</h3>
              </div>
              <ul className="space-y-1">
                {score.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.improvements.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Focus Areas</h3>
              </div>
              <ul className="space-y-1">
                {score.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown</h3>

        <div className="space-y-4">
          {Object.entries(score.components).map(([key, component]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(component.status)}`}>
                    {getStatusIcon(component.status)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-600">{component.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{component.score}</div>
                  <div className="text-xs text-gray-500">/ {component.maxScore}</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-900">Personalized Recommendations</h3>
        </div>

        <ul className="space-y-3">
          {score.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                {index + 1}
              </div>
              <p className="text-sm text-blue-900 flex-1">{recommendation}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Main Page Component
export default function HealthPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [transactions, budgets] = await Promise.all([
        transactionsAPI.getAll().catch(() => []),
        budgetsAPI.getAll().catch(() => [])
      ]);

      // Calculate income and expenses from transactions
      const income = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      
      const expenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      
      // Calculate budget totals
      const totalBudget = budgets.reduce((sum: number, b: any) => sum + (b.budgeted || b.amount || 0), 0);
      const totalSpent = budgets.reduce((sum: number, b: any) => sum + (b.spent || b.actual || 0), 0);

      // Calculate savings from transactions (assuming there's a savings category or account)
      const savingsTransactions = transactions.filter((t: any) => 
        t.category?.toLowerCase().includes('savings') || 
        t.account?.toLowerCase().includes('savings') ||
        t.type === 'savings'
      );
      const totalSavings = savingsTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

      // Calculate debt from transactions (assuming there's a debt category)
      const debtTransactions = transactions.filter((t: any) => 
        t.category?.toLowerCase().includes('debt') || 
        t.category?.toLowerCase().includes('loan') ||
        t.category?.toLowerCase().includes('credit card') ||
        t.type === 'debt'
      );
      const totalDebt = debtTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

      // Calculate emergency fund (assuming there's an emergency fund account or category)
      const emergencyTransactions = transactions.filter((t: any) => 
        t.category?.toLowerCase().includes('emergency') || 
        t.account?.toLowerCase().includes('emergency') ||
        t.type === 'emergency'
      );
      const emergencyFund = emergencyTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

      // Calculate payment history (assuming transactions have a payment status)
      const paymentTransactions = transactions.filter((t: any) => 
        t.type === 'payment' || 
        t.category?.toLowerCase().includes('bill') ||
        t.category?.toLowerCase().includes('payment')
      );
      const onTimePayments = paymentTransactions.filter((t: any) => 
        t.status === 'on-time' || 
        t.onTime === true || 
        !t.late
      ).length;
      const totalPayments = paymentTransactions.length;

      setFinancialData({
        monthlyIncome: income,
        monthlyExpenses: expenses,
        totalSavings: totalSavings,
        totalDebt: totalDebt,
        emergencyFund: emergencyFund,
        monthlyBudget: totalBudget,
        actualSpending: totalSpent,
        onTimePayments: onTimePayments,
        totalPayments: totalPayments,
      });

      // Show warning if no data
      if (transactions.length === 0 && budgets.length === 0) {
        setError('No financial data found. Please add transactions and budgets to see your health score.');
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setError('Failed to load financial data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-indigo-600" />
          <p className="text-gray-600">Calculating health score...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Health Score</h1>
              <p className="text-gray-600">Comprehensive analysis of your financial wellness</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {financialData && <FinancialHealthScore data={financialData} />}
      </main>
    </div>
  );
}