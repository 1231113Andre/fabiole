"use client";
import { useEffect } from "react";

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "danger" | "warning" | "info";
  }>;
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  useEffect(() => {
    // Auto-close toasts after 5 seconds
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [toasts, onClose]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-0 right-0 p-3 z-50"
      style={{ zIndex: 1055, marginTop: "80px" }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center text-white border-0 rounded-lg shadow-lg p-4 mb-3 min-w-[300px] ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "danger"
              ? "bg-red-500"
              : toast.type === "warning"
              ? "bg-yellow-500"
              : "bg-blue-500"
          }`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="flex items-center flex-grow">
            <div className="flex items-center">
              <i
                className={`fas ${
                  toast.type === "success"
                    ? "fa-check-circle"
                    : toast.type === "danger"
                    ? "fa-exclamation-circle"
                    : toast.type === "warning"
                    ? "fa-exclamation-triangle"
                    : "fa-info-circle"
                } mr-2`}
              ></i>
              {toast.message}
            </div>
          </div>
          <button
            type="button"
            className="text-white ml-4 p-2 hover:opacity-75 cursor-pointer bg-transparent border-0"
            onClick={() => onClose(toast.id)}
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}





