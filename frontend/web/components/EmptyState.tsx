"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  gradient?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  gradient = "from-blue-500 to-purple-500",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={`mb-6 rounded-full bg-gradient-to-br ${gradient} p-6`}>
        <Icon className="h-12 w-12 text-white" />
      </div>
      <h3 className="mb-2 text-2xl font-bold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-md text-gray-600">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
