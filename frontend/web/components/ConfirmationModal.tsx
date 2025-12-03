// components/ConfirmationModal.tsx
'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, Info, Trash2 } from 'lucide-react';

export type ModalVariant = 'danger' | 'warning' | 'info';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-600" />,
      iconBg: 'bg-red-100',
      buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      iconBg: 'bg-yellow-100',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-100',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  };

  const config = variantConfig[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`${config.iconBg} p-2 rounded-lg`}>
                {config.icon}
              </div>
              <h3 id="modal-title" className="text-xl font-bold text-gray-900">
                {title}
              </h3>
            </div>
            {!isLoading && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-6 ml-14">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg text-white transition font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.buttonClass}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};