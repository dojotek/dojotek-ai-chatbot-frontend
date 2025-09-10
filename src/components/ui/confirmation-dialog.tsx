"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full h-full bg-white md:w-auto md:h-auto md:min-w-120 md:max-w-lg md:mx-4 md:rounded-lg md:shadow-lg">
        {/* Mobile: Full screen */}
        <div className="flex h-full flex-col md:h-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b md:rounded-t-lg md:p-6">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6">
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 md:rounded-b-lg md:p-6 md:bg-white">
            <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-3">
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "w-full px-8 py-2.5 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 md:w-auto",
                  variant === "destructive"
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                )}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 md:w-auto"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
