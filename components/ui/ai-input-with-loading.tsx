import React, { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface AIInputWithLoadingProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  isGenerating?: boolean;
}

export const AIInputWithLoading: React.FC<AIInputWithLoadingProps> = ({ onSubmit, placeholder = "Ask AI...", isGenerating = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-purple-500">
           <Sparkles size={18} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isGenerating}
          className="w-full pl-10 pr-12 py-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm text-sm font-mono dark:text-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isGenerating}
          className="absolute right-2 p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </form>
  );
};