import React from 'react';
import { X, Check, Crown, Infinity as InfinityIcon } from 'lucide-react';

interface PlanSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'free' | 'pro' | 'teams') => void;
  currentPlan: 'free' | 'pro' | 'teams';
  context: 'resume-limit' | 'upgrade' | 'feature-locked';
}

export default function PlanSelection({ isOpen, onClose, onSelectPlan, currentPlan, context }: PlanSelectionProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full p-8 shadow-2xl relative overflow-hidden border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black dark:hover:text-white z-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <X size={20} />
        </button>
        
        <div className="text-center mb-10 mt-2">
          <h2 className="text-3xl font-bold font-mono mb-3 dark:text-white tracking-tight">Upgrade to Rezumate Pro</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {context === 'resume-limit' 
              ? 'You have reached the limit of 3 free resumes.' 
              : 'Unlock AI superpowers and unlimited resumes.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 relative opacity-70 scale-95 origin-right flex flex-col">
            <h3 className="text-xl font-bold font-mono dark:text-white">Free</h3>
            <p className="text-3xl font-bold font-mono mt-2 mb-4 dark:text-white">$0</p>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Check size={16}/> 3 Resumes</li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Check size={16}/> Basic AI Analysis</li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Check size={16}/> PDF Download</li>
            </ul>
            <button disabled className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl font-bold font-mono text-sm">Current Plan</button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-black dark:border-white rounded-2xl p-6 relative bg-gray-50 dark:bg-gray-800/50 transform hover:scale-[1.02] transition-transform shadow-lg flex flex-col">
            <div className="absolute top-0 right-0 bg-black dark:bg-white text-white dark:text-black text-xs font-bold font-mono px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Popular
            </div>
            <h3 className="text-xl font-bold font-mono dark:text-white flex items-center gap-2"><Crown size={20} className="text-purple-500" /> Pro</h3>
            <p className="text-3xl font-bold font-mono mt-2 mb-4 dark:text-white">$12<span className="text-base font-normal text-gray-500">/mo</span></p>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-medium"><Check size={16} className="text-emerald-500"/> Unlimited Resumes</li>
              <li className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-medium"><Check size={16} className="text-emerald-500"/> Advanced AI Optimization</li>
              <li className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-medium"><Check size={16} className="text-emerald-500"/> Cover Letter Generator</li>
              <li className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-medium"><Check size={16} className="text-emerald-500"/> Priority Support</li>
            </ul>
            <button onClick={() => onSelectPlan('pro')} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold font-mono hover:opacity-90 transition-opacity shadow-lg">Upgrade to Pro</button>
          </div>

          {/* Lifetime Plan */}
          <div className="border border-amber-200 dark:border-amber-800 rounded-2xl p-6 relative bg-amber-50/50 dark:bg-amber-900/10 flex flex-col">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold font-mono px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Best Value
            </div>
            <h3 className="text-xl font-bold font-mono dark:text-white flex items-center gap-2 text-amber-600 dark:text-amber-400"><InfinityIcon size={20} /> Lifetime</h3>
            <p className="text-3xl font-bold font-mono mt-2 mb-4 dark:text-white">$299<span className="text-base font-normal text-gray-500">/once</span></p>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-medium"><Check size={16} className="text-amber-500"/> Unlimited Resumes</li>
              <li className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-medium"><Check size={16} className="text-amber-500"/> Advanced AI Model</li>
              <li className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-medium"><Check size={16} className="text-amber-500"/> Lifetime Updates</li>
              <li className="flex items-center gap-2 text-sm text-gray-800 dark:text-white font-medium"><Check size={16} className="text-amber-500"/> Founders Badge</li>
            </ul>
            <button onClick={() => onSelectPlan('teams')} className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold font-mono hover:opacity-90 transition-opacity shadow-lg shadow-amber-200 dark:shadow-none">Get Lifetime</button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
            <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white text-sm hover:underline font-mono">
                No thanks, I'll delete a resume instead
            </button>
        </div>
      </div>
    </div>
  );
}