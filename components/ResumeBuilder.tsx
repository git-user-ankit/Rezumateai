import React, { useState, useRef, useEffect, useCallback } from 'react';
import { initialResumeData, ResumeData, Experience, Education } from '../types';
import ResumePreview from './ResumePreview';
import { ArrowLeft, Save, ChevronDown, ChevronUp, Plus, Trash2, Wand2, Loader2, Send, Eye, PenLine, Palette, Upload, Download, Sparkles, Zap, Type, MessageSquare, Crown, Undo, Redo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processResumeRequest } from '../services/geminiService';
import PlanSelection from './PlanSelection';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../src/firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { ChatMessage } from '../types';

// Fix for Framer Motion type issues
const MotionDiv = motion.div as any;

interface ResumeBuilderProps {
  onBack: () => void;
  initialData?: ResumeData;
  onSave?: (data: ResumeData) => void;
}

type ViewMode = 'edit' | 'preview';

const SUGGESTIONS = [
  "Analyze my resume health",
  "Improve my professional summary",
  "Fix grammar in experience section",
  "Make achievements more quantifiable",
  "Add keywords for Software Engineer",
  "Shorten bullet points"
];

const FONT_OPTIONS = [
    { name: 'Standard (Times New Roman)', value: '"Times New Roman", serif' },
    { name: 'Modern (Calibri/Inter)', value: 'Inter, sans-serif' },
    { name: 'Clean (Arial/Roboto)', value: 'Roboto, sans-serif' },
    { name: 'Classic (Georgia)', value: 'Georgia, serif' },
    { name: 'Elegant (Garamond)', value: '"EB Garamond", serif' }
];

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onBack, initialData, onSave }) => {
  const [data, setData] = useState<ResumeData>(initialData || initialResumeData);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [isDownloading, setIsDownloading] = useState(false);
  const [healthScore, setHealthScore] = useState(82);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeId, setResumeId] = useState<string>('');
  
  // Undo/Redo State
  const [history, setHistory] = useState<ResumeData[]>([]);
  const [future, setFuture] = useState<ResumeData[]>([]);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
      {role: 'ai', text: 'Hi! I can help optimize your resume. Try asking "Analyze my resume for ATS compatibility and suggest improvements."'}
  ]);

  const { user, userProfile, updateUserProfile } = useAuth();
  const currentPlan = userProfile?.plan || 'free';
  const [isPlanSelectionOpen, setIsPlanSelectionOpen] = useState(false);
  const [planSelectionContext, setPlanSelectionContext] = useState<'resume-limit' | 'upgrade' | 'feature-locked'>('resume-limit');

  // Load user preferences on mount
  useEffect(() => {
    if (userProfile?.preferences?.selectedFont) {
        setSelectedFont(userProfile.preferences.selectedFont);
    }
    
    // Generate or use existing resume ID
    if (initialData && (initialData as any).id) {
      setResumeId((initialData as any).id);
    } else {
      // We'll generate a new ID when saving if it doesn't exist
    }

    // Check resume limit for free plan
    if (currentPlan === 'free' && user) {
      const checkLimit = async () => {
        const q = query(collection(db, 'resumes'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        setResumeCount(snapshot.size);
        if (!initialData && snapshot.size >= 3) {
          setPlanSelectionContext('resume-limit');
          setIsPlanSelectionOpen(true);
        }
      };
      checkLimit();
    }
  }, [initialData, currentPlan, user]);

  // Auto-save resume data every 5 seconds of inactivity
  useEffect(() => {
    if (!user || !data.fullName) return;

    const autoSaveTimer = setTimeout(async () => {
      const title = data.fullName ? `${data.fullName} - Resume` : 'Untitled Resume';
      
      if (resumeId) {
        await updateDoc(doc(db, 'resumes', resumeId), {
          title,
          data: data,
          score: healthScore,
          updatedAt: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, 'resumes'), {
          userId: user.uid,
          title,
          data: data,
          score: healthScore,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setResumeId(docRef.id);
      }
    }, 5000);

    return () => clearTimeout(autoSaveTimer);
  }, [data, resumeId, healthScore, user]);

  // Save font preference when changed
  useEffect(() => {
    if (user && selectedFont !== userProfile?.preferences?.selectedFont) {
        updateUserProfile({ 
            preferences: { 
                ...userProfile?.preferences,
                selectedFont 
            } 
        });
    }
  }, [selectedFont, user]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isAiLoading]);

  useEffect(() => {
      if (initialData) {
          setData(initialData);
      }
  }, [initialData]);

  // --- Undo/Redo Logic ---

  const addToHistory = useCallback((currentState: ResumeData) => {
    setHistory(prev => [...prev, currentState]);
    setFuture([]); // Clear future on new change
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    
    setFuture(prev => [data, ...prev]);
    setData(previous);
    setHistory(newHistory);
  }, [history, data]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setHistory(prev => [...prev, data]);
    setData(next);
    setFuture(newFuture);
  }, [future, data]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  /**
   * Smart state update wrapper.
   * @param updateFn - Function to update state or new state object
   * @param isTextTyping - If true, groups rapid changes into one history entry
   */
  const handleStateChange = (updateFn: (prev: ResumeData) => ResumeData, isTextTyping: boolean = false) => {
      if (isTextTyping) {
          // If we are not currently typing, snapshot the state BEFORE this new character
          if (!isTypingRef.current) {
              addToHistory(data);
              isTypingRef.current = true;
          }

          // Reset the timeout
          if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
          }

          // Set a timeout to mark "end of typing"
          typingTimeoutRef.current = setTimeout(() => {
              isTypingRef.current = false;
          }, 1000); // 1 second pause commits the text block
      } else {
          // For structural changes (add/remove items, AI generation), snapshot immediately
          addToHistory(data);
          // Also clear any pending typing timeout to ensure clean state
          if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
              isTypingRef.current = false;
          }
      }

      setData(updateFn);
  };

  const handleSaveClick = async () => {
      if (!user) return;
      setIsSaving(true);
      try {
        const title = data.fullName ? `${data.fullName} - Resume` : 'Untitled Resume';
        if (resumeId) {
          await updateDoc(doc(db, 'resumes', resumeId), {
            title,
            data: data,
            score: healthScore,
            updatedAt: serverTimestamp()
          });
        } else {
          const docRef = await addDoc(collection(db, 'resumes'), {
            userId: user.uid,
            title,
            data: data,
            score: healthScore,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          setResumeId(docRef.id);
        }
        if (onSave) {
          await onSave(data);
        }
      } catch (error) {
        console.error('Error saving resume:', error);
      } finally {
        setIsSaving(false);
      }
  }

  const generateAiContent = async (promptText: string) => {
    if (!promptText.trim()) return;

    setAiMessages(prev => [...prev, {role: 'user', text: promptText}]);
    setAiPrompt('');
    setIsAiLoading(true);

    try {
      const result = await processResumeRequest(data, promptText);

      if (result.updatedData) {
          // Snapshot state before AI applies changes
          addToHistory(data);

          // Safely merge data
          setData(prev => ({
              ...prev,
              ...result.updatedData,
              contactInfo: result.updatedData?.contactInfo || prev.contactInfo || ''
          }));
      }
      if (result.healthScore !== null && result.healthScore !== undefined) {
          setHealthScore(result.healthScore);
      }
      setAiMessages(prev => [...prev, {role: 'ai', text: result.message || "Done!"}]);
    
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      let friendlyMessage = "I'm sorry, I ran into a temporary issue. Please try asking that again.";
      setAiMessages(prev => [...prev, {role: 'ai', text: friendlyMessage}]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiEdit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAiContent(aiPrompt);
  };

  const handleAtsOptimize = () => {
      generateAiContent("Optimize my entire resume for ATS compatibility. Identify the role (e.g., Software Engineer) and incorporate relevant high-impact keywords throughout the experience and skills sections. Strengthen action verbs, improve the summary for machine parsing, and ensure all achievements are quantifiable. Update the resume data with these optimizations.");
  };

  const handleDownloadPdf = () => {
    let element = document.getElementById('resume-preview');
    if (!element) {
        alert("Please switch to Preview mode to download PDF.");
        return;
    }
    
    setIsDownloading(true);

    const opt = {
      margin:       [0.4, 0, 0.4, 0], // Reduced margin for better fit
      filename:     `${data.fullName.replace(/\s+/g, '_')}_resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.width = "8.5in";
    clone.style.height = "auto";
    clone.style.margin = "0 auto";
    clone.style.fontFamily = selectedFont;
    
    // Inject custom print styles for the clone to ensure clean page breaks
    const style = document.createElement('style');
    style.innerHTML = `
        #resume-clone-container * {
            box-sizing: border-box;
        }
        .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
        }
        ul {
            padding-left: 1.2rem;
        }
        li {
            padding-left: 0.2rem;
        }
    `;
    
    const container = document.createElement('div');
    container.id = "resume-clone-container";
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.appendChild(style);
    container.appendChild(clone);
    document.body.appendChild(container);

    if (typeof window !== 'undefined' && (window as any).html2pdf) {
        (window as any).html2pdf().set(opt).from(clone).save().then(() => {
            document.body.removeChild(container);
            setIsDownloading(false);
        }).catch((err: any) => {
            console.error(err);
            if (container.parentNode) document.body.removeChild(container);
            setIsDownloading(false);
            alert("Error generating PDF");
        });
    } else {
        alert("PDF generator not loaded");
        setIsDownloading(false);
    }
  };

  const handleSelectPlan = async (plan: 'free' | 'pro' | 'teams') => {
      try {
          await updateUserProfile({ plan });
          setIsPlanSelectionOpen(false);
      } catch (error) {
          console.error("Error updating plan:", error);
      }
  };

  const checkResumeLimit = () => {
      if (currentPlan === 'free') {
          return resumeCount >= 3;
      }
      return false;
  };

  // Wrapped Update Functions
  const updateField = (section: keyof ResumeData, value: any) => {
      handleStateChange(prev => ({ ...prev, [section]: value }), true);
  };
  
  const getContactPart = (index: number) => {
      const info = typeof data.contactInfo === 'string' ? data.contactInfo : '';
      const parts = info.split('|');
      return parts[index] ? parts[index].trim() : '';
  };
  
  const setContactPart = (index: number, value: string) => {
      const info = typeof data.contactInfo === 'string' ? data.contactInfo : '';
      const parts = info.split('|').map(s => s.trim());
      while (parts.length <= index) parts.push('');
      parts[index] = value;
      handleStateChange(prev => ({ ...prev, contactInfo: parts.join(' | ') }), true);
  };
  
  const addExperience = () => {
      handleStateChange(prev => ({ 
          ...prev, 
          experience: [{ id: Date.now().toString(), company: "New Company", role: "Role", location: "Location", duration: "Dates", points: ["Achievement"] }, ...prev.experience] 
      }), false);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
      handleStateChange(prev => ({ 
          ...prev, 
          experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e) 
      }), true);
  };

  const removeExperience = (id: string) => {
      handleStateChange(prev => ({ 
          ...prev, 
          experience: prev.experience.filter(e => e.id !== id) 
      }), false);
  };
  
  const addEducation = () => {
      handleStateChange(prev => ({ 
          ...prev, 
          education: [{ id: Date.now().toString(), school: "School", location: "Loc", degree: "Degree", year: "Year", details: ["Detail"] }, ...prev.education] 
      }), false);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
      handleStateChange(prev => ({ 
          ...prev, 
          education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e) 
      }), true);
  };

  const removeEducation = (id: string) => {
      handleStateChange(prev => ({ 
          ...prev, 
          education: prev.education.filter(e => e.id !== id) 
      }), false);
  };

  // Special handler for Skills (Array of Objects)
  const updateSkillCategory = (index: number, value: string) => {
      handleStateChange(prev => {
          const newSkills = [...prev.skills];
          newSkills[index].category = value;
          return { ...prev, skills: newSkills };
      }, true);
  };

  const updateSkillItems = (index: number, value: string) => {
      handleStateChange(prev => {
          const newSkills = [...prev.skills];
          newSkills[index].items = value;
          return { ...prev, skills: newSkills };
      }, true);
  };

  // Special handler for Additional Info
  const updateAdditionalInfoTitle = (value: string) => {
      handleStateChange(prev => ({ ...prev, additionalInfo: { ...prev.additionalInfo, title: value } }), true);
  };

  const updateAdditionalInfoPoints = (value: string) => {
      handleStateChange(prev => ({ ...prev, additionalInfo: { ...prev.additionalInfo, points: value.split('\n') } }), true);
  };

  return (
    <div className="h-screen bg-[#F9FAFB] dark:bg-black flex flex-col pt-16 overflow-hidden transition-colors duration-300">
      
      {/* Top Bar - Fixed Height */}
      <div className="h-16 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 md:px-6 shrink-0 z-40 relative">
          {/* Resume Limit Warning */}
          {currentPlan === 'free' && checkResumeLimit() && (
              <div className="absolute top-full left-0 right-0 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between text-sm shadow-md">
                  <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800 dark:text-amber-200 font-mono">
                          You've reached the 3 resume limit on the Free plan.
                      </span>
                  </div>
                  <button 
                      onClick={() => setIsPlanSelectionOpen(true)}
                      className="text-amber-800 dark:text-amber-200 font-mono font-bold hover:underline"
                  >
                      Upgrade Now
                  </button>
              </div>
          )}

          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full shrink-0"><ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
                
                {/* Rezumate AI Branding */}
                <div className="hidden sm:flex items-center">
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200 tracking-tight">Rezumate AI</span>
                </div>
                
                {/* Undo/Redo Buttons */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-2">
                    <button 
                        onClick={handleUndo} 
                        disabled={history.length === 0}
                        className="p-1.5 md:p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button 
                        onClick={handleRedo} 
                        disabled={future.length === 0}
                        className="p-1.5 md:p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0 ml-2">
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                    >
                        <Eye className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden xs:inline">Preview</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('edit')}
                        className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                    >
                        <PenLine className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden xs:inline">Edit</span>
                    </button>
                </div>
                
                {/* Font Selector */}
                <div className="relative hidden md:flex items-center shrink-0">
                    <Type className="w-3 h-3 md:w-4 md:h-4 absolute left-2 md:left-3 pointer-events-none text-gray-500 dark:text-gray-400" />
                    <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="appearance-none pl-7 md:pl-9 pr-7 md:pr-8 py-1.5 md:py-2 border border-gray-300 dark:border-gray-700 rounded-md text-xs md:text-sm font-mono hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800 dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                    >
                        {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 absolute right-2 pointer-events-none text-gray-500 dark:text-gray-400" />
                </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <button 
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-md text-xs md:text-sm font-mono hover:bg-blue-700 shadow-md transition-all hover:scale-105 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Save className="w-3 h-3 md:w-4 md:h-4 fill-current" />} <span className="hidden sm:inline">Save</span>
                </button>
                <button 
                    onClick={handleAtsOptimize}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md text-xs md:text-sm font-mono hover:from-emerald-600 hover:to-teal-600 shadow-md transition-all hover:scale-105"
                >
                    <Zap className="w-3 h-3 md:w-4 md:h-4 fill-current" /> <span className="hidden sm:inline">ATS Optimize</span>
                </button>
                <button 
                    onClick={handleDownloadPdf} 
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md text-xs md:text-sm font-mono hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                    {isDownloading ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Download className="w-3 h-3 md:w-4 md:h-4" />}
                    <span className="hidden sm:inline">PDF</span>
                </button>
          </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Scroll Pane: Editor / Preview */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 relative bg-gray-50/50 dark:bg-black">
            <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
                {viewMode === 'edit' ? (
                    <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8">
                         {/* Personal Info */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 shadow-sm transition-colors">
                            <h3 className="text-lg font-mono font-bold mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-800 pb-2 dark:text-white">Personal Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Full Name" value={data.fullName} onChange={(v) => updateField('fullName', v)} />
                                <Input label="Location" value={getContactPart(0)} onChange={(v) => setContactPart(0, v)} />
                                <Input label="Email" value={getContactPart(2)} onChange={(v) => setContactPart(2, v)} />
                                <Input label="Mobile Number" value={getContactPart(1)} onChange={(v) => setContactPart(1, v)} />
                                <Input label="Portfolio / Website" value={getContactPart(3)} onChange={(v) => setContactPart(3, v)} placeholder="e.g. https://rezumate.io/u/michael"/>
                            </div>
                        </div>

                        {/* About */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 shadow-sm transition-colors">
                            <h3 className="text-lg font-mono font-bold mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-800 pb-2 dark:text-white">About</h3>
                            <TextArea label="Short Bio" value={data.summary} onChange={(v) => updateField('summary', v)} />
                        </div>

                        {/* Experience */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 shadow-sm transition-colors">
                            <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-lg font-mono font-bold dark:text-white">Experience</h3>
                                <button onClick={addExperience} className="text-sm border border-gray-300 dark:border-gray-700 px-3 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 dark:text-white">
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                            <div className="space-y-6">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 relative group transition-colors">
                                        <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        <Input label="Job Title" value={exp.role} onChange={(v) => updateExperience(exp.id, 'role', v)} className="mb-3" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <Input label="Organization" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                                            <Input label="Location" value={exp.location} onChange={(v) => updateExperience(exp.id, 'location', v)} />
                                        </div>
                                        <Input label="Timeframe" value={exp.duration} onChange={(v) => updateExperience(exp.id, 'duration', v)} className="mb-3" />
                                        <TextArea label="Description (Bullet points)" value={exp.points.join('\n')} onChange={(v) => {
                                             handleStateChange(prev => ({
                                                ...prev,
                                                experience: prev.experience.map(e => e.id === exp.id ? { ...e, points: v.split('\n') } : e)
                                            }), true);
                                        }} rows={3} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 shadow-sm transition-colors">
                            <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-lg font-mono font-bold dark:text-white">Education</h3>
                                <button onClick={addEducation} className="text-sm border border-gray-300 dark:border-gray-700 px-3 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 dark:text-white">
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                            <div className="space-y-6">
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 relative group transition-colors">
                                        <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        <Input label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} className="mb-3" />
                                        <Input label="School" value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} className="mb-3" />
                                        <Input label="Year" value={edu.year} onChange={(v) => updateEducation(edu.id, 'year', v)} className="mb-3" />
                                        <Input label="Location" value={edu.location} onChange={(v) => updateEducation(edu.id, 'location', v)} className="mb-3" />
                                        <TextArea label="Details (Bullet points)" value={edu.details.join('\n')} onChange={(v) => {
                                             handleStateChange(prev => ({
                                                ...prev,
                                                education: prev.education.map(e => e.id === edu.id ? { ...e, details: v.split('\n') } : e)
                                            }), true);
                                        }} rows={3} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 shadow-sm transition-colors">
                            <h3 className="text-lg font-mono font-bold mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-800 pb-2 dark:text-white">Skills</h3>
                            <div className="space-y-4">
                                {data.skills.map((skill, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input label="Category" value={skill.category} onChange={(v) => updateSkillCategory(idx, v)} />
                                        <div className="md:col-span-2">
                                            <Input label="Items" value={skill.items} onChange={(v) => updateSkillItems(idx, v)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 shadow-sm transition-colors">
                            <h3 className="text-lg font-mono font-bold mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-800 pb-2 dark:text-white">Additional Section</h3>
                             <Input label="Section Title" value={data.additionalInfo.title} onChange={(v) => updateAdditionalInfoTitle(v)} className="mb-4" />
                             <TextArea label="Content (Bullet points)" value={data.additionalInfo.points.join('\n')} onChange={(v) => updateAdditionalInfoPoints(v)} />
                        </div>
                    </MotionDiv>
                ) : (
                    /* Preview Mode */
                    <div className="flex justify-center items-start min-h-screen pt-4 pb-20">
                         <ResumePreview data={data} scale={0.8} font={selectedFont} />
                    </div>
                )}
            </div>
        </div>

        {/* Right Pane: AI Assistant / Suggestions */}
        <div className="w-full lg:w-96 bg-white dark:bg-[#0A0A0A] border-l border-gray-200 dark:border-gray-800 flex flex-col h-[40vh] lg:h-auto shrink-0 transition-colors z-30">
             <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#0A0A0A]">
                <h3 className="font-bold font-mono flex items-center gap-2 dark:text-white">
                    <Sparkles className="w-4 h-4 text-purple-500" /> AI Assistant
                </h3>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full font-mono">Score: {healthScore}</div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black">
                {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs md:text-sm font-mono leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-black dark:bg-white text-white dark:text-black rounded-br-sm' 
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isAiLoading && (
                     <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl rounded-bl-sm border border-gray-200 dark:border-gray-800 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin dark:text-white" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Optimizing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-[#0A0A0A] border-t border-gray-100 dark:border-gray-800 space-y-3">
                 {/* Quick Suggestions */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {SUGGESTIONS.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => generateAiContent(s)}
                            className="whitespace-nowrap px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-[10px] md:text-xs font-mono transition-colors dark:text-gray-300"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleAiEdit} className="relative">
                    <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ask AI to fix or improve..." 
                        className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:ring-1 focus:ring-black dark:focus:ring-white outline-none bg-gray-50 dark:bg-gray-900 dark:text-white"
                        disabled={isAiLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={!aiPrompt.trim() || isAiLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 disabled:opacity-50 transition-all"
                    >
                        {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      <PlanSelection 
          isOpen={isPlanSelectionOpen}
          onClose={() => setIsPlanSelectionOpen(false)}
          onSelectPlan={handleSelectPlan}
          currentPlan={currentPlan}
          context={planSelectionContext}
      />
    </div>
  );
};

// Helper Components
const Input = ({ label, value, onChange, placeholder, className, type = "text" }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string, className?: string, type?: string }) => (
    <div className={className}>
        <label className="block text-xs font-bold font-mono text-gray-500 mb-1.5 uppercase dark:text-gray-400">{label}</label>
        <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all dark:text-white"
        />
    </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 4, className }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string, rows?: number, className?: string }) => (
    <div className={className}>
        <label className="block text-xs font-bold font-mono text-gray-500 mb-1.5 uppercase dark:text-gray-400">{label}</label>
        <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all resize-y dark:text-white"
        />
    </div>
);

export default ResumeBuilder;