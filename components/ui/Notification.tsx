import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onDismiss: () => void;
}

const typeClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const iconClasses = {
  success: 'fa-check-circle',
  error: 'fa-exclamation-triangle',
  info: 'fa-info-circle',
  warning: 'fa-exclamation-circle',
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 text-white rounded-lg shadow-lg animate-slide-in-up ${typeClasses[type]} print:hidden`}
    >
      <i className={`fas ${iconClasses[type]}`}></i>
      <span>{message}</span>
    </div>
  );
};

// Add this to your index.html's <head> inside a <style> tag or a linked CSS file:
// @keyframes slide-in-up {
//   from { transform: translateY(100px); opacity: 0; }
//   to { transform: translateY(0); opacity: 1; }
// }
// .animate-slide-in-up {
//   animation: slide-in-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
// }