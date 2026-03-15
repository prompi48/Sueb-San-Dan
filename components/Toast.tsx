import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border-2 animate-bounce-short
      ${type === 'success' ? 'bg-[#276F50] border-white text-white' : 'bg-red-600 border-white text-white'}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="font-prompt font-medium">{message}</span>
    </div>
  );
};