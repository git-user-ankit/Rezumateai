import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Upload, FileText, BarChart3, Search, 
    Loader2, AlertCircle, X, LayoutDashboard, 
    Files, ScanLine, Settings, Trash2, MessageSquare, 
    Sparkles, ArrowRight, ChevronRight, LogOut, Crown, Menu,
    PenLine, Wand2, Globe
} from 'lucide-react';
import { analyzeResumeATS, chatWithAI, extractResumeData, generateResumeFromJobDescription } from '../services/geminiService';
import { ResumeData, initialResumeData } from '../types';
import { AIInputWithLoading } from './ui/ai-input-with-loading';
import SettingsComponent from './Settings';
import PlanSelection from './PlanSelection';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../src/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  addDoc, 
  getDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { 
  parseResumeFile, 
  isFileTypeSupported, 
  getFileTypeDisplay,
  type ParseResult 
} from '../lib/fileParser';
import {
  saveChatHistory,
  getChatHistory,
  saveAtsResult,
  getAtsResult,
  saveExtractedData as saveExtractedDataFirestore,
  getExtractedData as getExtractedDataFirestore,
  saveChatResumeId,
  getChatResumeId
} from '../src/services/firestoreService';
import { cn } from '../lib/utils';
import { 
  ChatMessage, 
  StoredResume, 
  ATSAnalysis as StoredAtsResult 
} from '../types';

const MotionDiv = motion.div as any;

interface DashboardProps {
  onNavigate: (view: 'builder', data?: ResumeData) => void;
}

interface DashboardResume {
    id: string;
    title: string;
    lastEdited: string;
    score: number;
    data: ResumeData;
}

interface Template {
    id: string;
    role: string;
    category: string;
    description: string;
    data: ResumeData;
}

// Mock initial data for resumes
const MOCK_RESUMES: DashboardResume[] = [
    { id: '1', title: "Software Engineer - Google", lastEdited: "Edited 2 mins ago", score: 92, data: initialResumeData },
    { id: '2', title: "Frontend Developer - Startup", lastEdited: "Edited 2 days ago", score: 65, data: { ...initialResumeData, fullName: "Michael Chen (Frontend)" } },
    { id: '3', title: "General Resume 2024", lastEdited: "Edited 5 days ago", score: 88, data: { ...initialResumeData, fullName: "Michael Chen (General)" } },
];

// Helper to generate template data
const createTemplateData = (role: string, summaryStart: string): ResumeData => ({
    ...initialResumeData,
    fullName: "[Your Name]",
    contactInfo: "[City, State] | [Phone] | [Email] | [LinkedIn]",
    summary: `${summaryStart} looking to leverage extensive experience in...`,
    experience: [
        {
            id: 't1',
            company: "[Previous Company]",
            role: role,
            location: "[City, State]",
            duration: "2021 - Present",
            points: [
                "Spearheaded key initiatives resulting in 20% growth...",
                "Collaborated with cross-functional teams to deliver...",
                "Optimized processes reducing operational costs by 15%..."
            ]
        }
    ],
    skills: [
        { category: "Core Skills", items: "Skill 1, Skill 2, Skill 3, Skill 4" },
        { category: "Tools", items: "Tool A, Tool B, Tool C" }
    ]
});

const TEMPLATES: Template[] = [
    // Engineering
    { id: 'eng-1', role: 'Software Engineer', category: 'Engineering', description: 'Standard format for full-stack, backend, or generalist engineers.', data: createTemplateData('Software Engineer', 'Results-oriented Software Engineer with 5+ years of experience building scalable web applications.') },
    { id: 'eng-2', role: 'Frontend Developer', category: 'Engineering', description: 'Highlighting UI/UX skills, React, and responsive design.', data: createTemplateData('Frontend Developer', 'Creative Frontend Developer passionate about crafting pixel-perfect user experiences.') },
    { id: 'eng-3', role: 'Backend Developer', category: 'Engineering', description: 'Focused on APIs, databases, and system architecture.', data: createTemplateData('Backend Developer', 'Robust Backend Developer expert in designing high-performance microservices.') },
    { id: 'eng-4', role: 'DevOps Engineer', category: 'Engineering', description: 'For cloud infrastructure, CI/CD, and automation experts.', data: createTemplateData('DevOps Engineer', 'DevOps Engineer dedicated to automating workflows and ensuring 99.9% system uptime.') },
    
    // Data
    { id: 'data-1', role: 'Data Scientist', category: 'Data', description: 'Machine learning, Python, and statistical analysis.', data: createTemplateData('Data Scientist', 'Data Scientist capable of turning complex datasets into actionable business insights.') },
    { id: 'data-2', role: 'Data Analyst', category: 'Data', description: 'SQL, Tableau, and business intelligence reporting.', data: createTemplateData('Data Analyst', 'Analytical Data Analyst with strong SQL skills and dashboarding expertise.') },
    
    // Design
    { id: 'des-1', role: 'Product Designer', category: 'Design', description: 'End-to-end product design, user research, and prototyping.', data: createTemplateData('Product Designer', 'Product Designer bridging the gap between user needs and business goals.') },
    { id: 'des-2', role: 'UI/UX Designer', category: 'Design', description: 'Wireframing, visual design, and user flows.', data: createTemplateData('UI/UX Designer', 'UI/UX Designer creating intuitive and accessible digital interfaces.') },
    
    // Product
    { id: 'prod-1', role: 'Product Manager', category: 'Product', description: 'Strategy, roadmap planning, and stakeholder management.', data: createTemplateData('Product Manager', 'Product Manager with a history of launching successful user-centric products.') },
    { id: 'prod-2', role: 'Project Manager', category: 'Product', description: 'Agile, Scrum, and resource scheduling.', data: createTemplateData('Project Manager', 'Certified PMP Project Manager skilled in leading cross-functional teams.') },
    
    // Business
    { id: 'bus-1', role: 'Business Analyst', category: 'Business', description: 'Requirements gathering and process improvement.', data: createTemplateData('Business Analyst', 'Business Analyst expert in translating business needs into technical requirements.') },
    { id: 'bus-2', role: 'Marketing Manager', category: 'Business', description: 'Campaign strategy, digital marketing, and SEO.', data: createTemplateData('Marketing Manager', 'Strategic Marketing Manager driving brand awareness and lead generation.') },
];

type Tab = 'overview' | 'resumes' | 'templates' | 'ats' | 'settings';
type SettingsTab = 'profile' | 'preferences' | 'privacy' | 'data' | 'ai' | 'billing' | 'notifications' | 'advanced';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Auth Context
  const { signOut, user, userProfile, updateUserProfile, isMockMode } = useAuth();
  
  // Load initial data from localStorage
  const [activeTab, setActiveTab] = useState<Tab>(userProfile?.preferences?.activeTab || 'overview');
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>(userProfile?.preferences?.activeSettingsTab || 'profile');
  const [resumes, setResumes] = useState<DashboardResume[]>([]);
  
  // Responsive Sidebar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Template State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [templateSearch, setTemplateSearch] = useState('');
  
  // Chat State
  const [chatResume, setChatResume] = useState<DashboardResume | null>(null);
  const [pendingChatResumeId, setPendingChatResumeId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ATS State
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState<StoredAtsResult | null>(null);
  const [extractedResumeData, setExtractedResumeData] = useState<ResumeData | null>(null);
  const [parsingProgress, setParsingProgress] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Plan Selection State
  const currentPlan = userProfile?.plan || 'free';
  const [isPlanSelectionOpen, setIsPlanSelectionOpen] = useState(false);
  const [planSelectionContext, setPlanSelectionContext] = useState<'resume-limit' | 'upgrade' | 'feature-locked'>('upgrade');

  // AI Generation State
  const [genJobDescription, setGenJobDescription] = useState('');
  const [genCountry, setGenCountry] = useState<'Global' | 'India'>('Global');
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);

  // Load data from Firestore on component mount
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'resumes'), 
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resumeList: DashboardResume[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        resumeList.push({
          id: doc.id,
          title: data.title,
          lastEdited: data.updatedAt?.toDate ? `Edited ${new Date(data.updatedAt.toDate()).toLocaleDateString()}` : 'Just now',
          score: data.score || 0,
          data: data.data
        });
      });
      setResumes(resumeList);
    }, (error) => {
      console.error("Error fetching resumes:", error);
    });

    // Load other persistent data from Firestore
    const loadOtherData = async () => {
      const savedChatMessages = await getChatHistory(user.uid);
      setChatMessages(savedChatMessages);

      const savedChatResumeId = await getChatResumeId(user.uid);
      if (savedChatResumeId) {
        setPendingChatResumeId(savedChatResumeId);
      }

      const savedAtsResults = await getAtsResult(user.uid);
      if (savedAtsResults) setAtsResult(savedAtsResults as any);

      const savedExtractedData = await getExtractedDataFirestore(user.uid);
      if (savedExtractedData) setExtractedResumeData(savedExtractedData);
      
      // Sync tabs from profile
      if (userProfile?.preferences?.activeTab) {
        setActiveTab(userProfile.preferences.activeTab);
      }
      if (userProfile?.preferences?.activeSettingsTab) {
        setActiveSettingsTab(userProfile.preferences.activeSettingsTab);
      }
    };

    loadOtherData();

    return () => unsubscribe();
  }, [user, userProfile?.uid]);

  // Resolve pending chat resume when resumes are loaded
  useEffect(() => {
    if (pendingChatResumeId && resumes.length > 0) {
      const resume = resumes.find(r => r.id === pendingChatResumeId);
      if (resume) {
        setChatResume(resume);
        setPendingChatResumeId(null);
      }
    }
  }, [resumes, pendingChatResumeId]);

  // Auto-save chat messages when they change
  useEffect(() => {
    if (chatMessages.length > 0 && user) {
      saveChatHistory(user.uid, chatMessages);
    }
  }, [chatMessages, user]);

  // Auto-save chat resume context when it changes
  useEffect(() => {
    if (user) {
      saveChatResumeId(user.uid, chatResume?.id || null);
    }
  }, [chatResume, user]);

  // Auto-save ATS results when they change
  useEffect(() => {
    if (atsResult && user) {
      saveAtsResult(user.uid, atsResult as any);
    }
  }, [atsResult, user]);

  // Auto-save extracted data when it changes
  useEffect(() => {
    if (extractedResumeData && user) {
      saveExtractedDataFirestore(user.uid, extractedResumeData);
    }
  }, [extractedResumeData, user]);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleNavClick = async (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    if (user) {
      await updateUserProfile({ 
        preferences: { 
          ...userProfile?.preferences, 
          activeTab: tab 
        } 
      });
    }
  };

  const handleDeleteResume = async (id: string) => {
      if (confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
          try {
            await deleteDoc(doc(db, 'resumes', id));
          } catch (error) {
            console.error("Error deleting resume:", error);
            alert("Failed to delete resume.");
          }
      }
  };

  const handleOpenChat = (resume: DashboardResume | null, initialPrompt?: string) => {
      setChatResume(resume);
      const initialMessage = { role: 'ai' as const, text: initialPrompt || (resume ? `Hi! I've loaded "${resume.title}". Ask me anything about it.` : "Hi! How can I help you with your interview prep today?") };
      setChatMessages([initialMessage]);
      setIsChatOpen(true);
  };

  const handleChatSubmit = async (message: string) => {
      if (!message.trim()) return;

      const userMsg = message;
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsChatLoading(true);

      try {
          const context = chatResume ? chatResume.data : undefined;
          const response = await chatWithAI(userMsg, context);
          setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
      } catch (err) {
          console.error(err);
          setChatMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error. Please check your network connection and try again." }]);
      } finally {
          setIsChatLoading(false);
      }
  };

  const handleGenerateAiResume = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!genJobDescription.trim()) return;
      setIsGeneratingResume(true);
      try {
          const data = await generateResumeFromJobDescription(genJobDescription, genCountry);
          onNavigate('builder', data);
      } catch (error) {
          console.error(error);
          alert("Failed to generate resume. Please check your API key.");
      } finally {
          setIsGeneratingResume(false);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      analyzeResume(files[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      analyzeResume(e.target.files[0]);
    }
  };

  const analyzeResume = async (file: File) => {
    setIsAnalyzing(true);
    setAtsResult(null);
    setExtractedResumeData(null);
    setAnalysisError(null);
    setParsingProgress('Checking file format...');
    
    try {
        if (!isFileTypeSupported(file)) {
            throw new Error(`Unsupported file type: ${getFileTypeDisplay(file)}. Please use PDF or Image.`);
        }

        setParsingProgress(`Reading ${getFileTypeDisplay(file)} file...`);

        // Parse file to base64
        const parseResult: ParseResult = await parseResumeFile(file, (progress, status) => {
            setParsingProgress(status);
        });
        
        if (!parseResult.success) {
            throw new Error(parseResult.error || "Failed to read file");
        }

        setParsingProgress('Analyzing resume with Gemini AI...');

        // ATS Analysis
        const analysisResult = await analyzeResumeATS(parseResult.content, file.type);
        setAtsResult({
            ...analysisResult,
            // @ts-ignore
            feedback: [
                `✅ Successfully analyzed ${parseResult.fileType}`,
                ...analysisResult.feedback
            ],
            missingKeywords: analysisResult.missingKeywords.map((k: any) => ({ keyword: k.keyword || k, suggestion: k.suggestion || '' }))
        });
        
        setParsingProgress('Extracting resume data...');

        // Data Extraction
        try {
            const extractedData = await extractResumeData(parseResult.content, file.type);
            setExtractedResumeData(extractedData);
        } catch (extractionError) {
            console.warn('AI extraction failed:', extractionError);
            // We don't fail the whole process if extraction fails, just show the ATS result
        }
        
        setParsingProgress('Complete!');
        
    } catch (error) {
        console.error('Resume analysis error:', error);
        setAnalysisError(error instanceof Error ? error.message : "Unknown error occurred during analysis");
    } finally {
        setIsAnalyzing(false);
        setParsingProgress('');
    }
  };

  const handleUpgradeClick = () => {
      setPlanSelectionContext('upgrade');
      setIsPlanSelectionOpen(true);
  };

  const handleSelectPlan = async (plan: 'free' | 'pro' | 'teams') => {
      try {
          await updateUserProfile({ plan });
          setIsPlanSelectionOpen(false);
      } catch (error) {
          console.error("Error updating plan:", error);
      }
  };

  const getFilteredTemplates = () => {
      let filtered = TEMPLATES;
      if (selectedCategory !== 'All') {
          filtered = filtered.filter(t => t.category === selectedCategory);
      }
      if (templateSearch) {
          filtered = filtered.filter(t => t.role.toLowerCase().includes(templateSearch.toLowerCase()));
      }
      return filtered;
  };

  const handleSettingsTabClick = async (tab: SettingsTab) => {
    setActiveSettingsTab(tab);
    if (user) {
      await updateUserProfile({ 
        preferences: { 
          ...userProfile?.preferences, 
          activeSettingsTab: tab 
        } 
      });
    }
  };

  return (
    <div className="h-screen w-full bg-[#F9FAFB] dark:bg-black overflow-hidden flex flex-col transition-colors duration-300 relative">
      
      {/* Top Header */}
      <header className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 z-50">
          <div className="flex items-center gap-3">
              <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold font-mono">R</span>
                </div>
                <span className="text-xl font-bold tracking-tight font-mono hidden sm:block dark:text-white">Rezumate AI</span>
              </div>
          </div>
          
          <div className="flex items-center gap-4">
               {isMockMode && (
                  <div className="hidden sm:block text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded font-mono">
                    Demo Mode
                  </div>
                )}
               <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                   {user?.email?.[0].toUpperCase() || 'U'}
               </div>
          </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`
            w-64 bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-gray-800 flex flex-col absolute md:relative h-full z-40 transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}>
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                <SidebarItem 
                    icon={<LayoutDashboard size={20} />} 
                    label="Overview" 
                    isActive={activeTab === 'overview'} 
                    onClick={() => handleNavClick('overview')} 
                />
                <SidebarItem 
                    icon={<Files size={20} />} 
                    label="My Resumes" 
                    isActive={activeTab === 'resumes'} 
                    onClick={() => handleNavClick('resumes')} 
                />
                 <SidebarItem 
                    icon={<FileText size={20} />} 
                    label="Templates" 
                    isActive={activeTab === 'templates'} 
                    onClick={() => handleNavClick('templates')} 
                />
                <SidebarItem 
                    icon={<ScanLine size={20} />} 
                    label="ATS Scanner" 
                    isActive={activeTab === 'ats'} 
                    onClick={() => handleNavClick('ats')} 
                />
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                {currentPlan === 'free' && (
                    <button 
                        onClick={handleUpgradeClick}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-mono font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
                    >
                        <Crown size={16} /> Upgrade to Pro
                    </button>
                )}
                <SidebarItem 
                  icon={<Settings size={20} />} 
                  label="Settings" 
                  isActive={activeTab === 'settings'}
                  onClick={() => handleNavClick('settings')} 
                />
                <SidebarItem icon={<LogOut size={20} />} label="Sign Out" onClick={() => signOut()} variant="danger" />
            </div>
        </aside>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
              <MotionDiv 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/50 z-30 md:hidden"
              />
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full relative" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="max-w-7xl mx-auto pb-20">
                
                {/* Tab: OVERVIEW */}
                {activeTab === 'overview' && (
                    <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-mono font-bold dark:text-white">Dashboard</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                                      Welcome back, {userProfile?.fullName || user?.email}
                                    </p>
                                    <div className={`px-2 py-1 rounded-full text-xs font-mono font-bold ${
                                        currentPlan === 'free' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                                        currentPlan === 'pro' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                                        'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                    }`}>
                                        {currentPlan.toUpperCase()} PLAN
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (currentPlan === 'free' && resumes.length >= 3) {
                                        setPlanSelectionContext('resume-limit');
                                        setIsPlanSelectionOpen(true);
                                    } else {
                                        onNavigate('builder', initialResumeData);
                                    }
                                }}
                                className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-mono text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                            >
                                <Plus className="w-4 h-4" /> New Resume
                            </button>
                        </div>

                        {/* AI Resume Generator Card */}
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 relative overflow-hidden mb-8 shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-purple-500 pointer-events-none">
                                <Sparkles size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                        <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h2 className="text-xl font-bold font-mono dark:text-white">Generate with AI</h2>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl text-sm">
                                    Don't have a resume? Just enter your desired profession or paste a job description, and we'll build a tailored resume for you.
                                </p>

                                <form onSubmit={handleGenerateAiResume}>
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold font-mono text-gray-500 uppercase mb-2 dark:text-gray-400">
                                            Profession / Job Description
                                        </label>
                                        <textarea 
                                            value={genJobDescription}
                                            onChange={(e) => setGenJobDescription(e.target.value)}
                                            placeholder="Enter a profession (e.g. 'UX Designer') or paste a full job description..."
                                            className="w-full p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white resize-none"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full md:w-auto">
                                            <label className="block text-xs font-bold font-mono text-gray-500 uppercase mb-2 dark:text-gray-400 flex items-center gap-2">
                                                <Globe size={12} /> Target Market
                                            </label>
                                            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => setGenCountry('Global')}
                                                    className={cn(
                                                        "flex-1 py-2 text-xs font-bold font-mono rounded-md transition-all",
                                                        genCountry === 'Global' 
                                                            ? 'bg-white dark:bg-gray-800 shadow text-black dark:text-white' 
                                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                    )}
                                                >
                                                    Global / US
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setGenCountry('India')}
                                                    className={cn(
                                                        "flex-1 py-2 text-xs font-bold font-mono rounded-md transition-all",
                                                        genCountry === 'India' 
                                                            ? 'bg-white dark:bg-gray-800 shadow text-black dark:text-white' 
                                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                    )}
                                                >
                                                    India IN
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={isGeneratingResume || !genJobDescription.trim()}
                                            className="w-full md:w-auto px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold font-mono shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 h-[42px]"
                                        >
                                            {isGeneratingResume ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Building...</>
                                            ) : (
                                                <><Wand2 className="w-4 h-4" /> Generate Resume</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                            <StatCard title="Total Resumes" value={`${resumes.length}${currentPlan === 'free' ? '/3' : ''}`} icon={<Files className="w-5 h-5" />} />
                            <StatCard title="Avg. Score" value={Math.round(resumes.reduce((acc, r) => acc + r.score, 0) / (resumes.length || 1)).toString()} icon={<BarChart3 className="w-5 h-5" />} trend="+5% this week" />
                            <StatCard title="Scans Remaining" value={currentPlan === 'free' ? '8' : '∞'} icon={<ScanLine className="w-5 h-5" />} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold font-mono dark:text-white">Recent Activity</h3>
                                    <button onClick={() => setActiveTab('resumes')} className="text-xs text-gray-500 hover:underline">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {resumes.slice(0, 3).map(resume => (
                                        <div key={resume.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer group" onClick={() => onNavigate('builder', resume.data)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm dark:text-white group-hover:text-blue-500 transition-colors truncate max-w-[150px] sm:max-w-none">{resume.title}</h4>
                                                    <p className="text-xs text-gray-400">{resume.lastEdited}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Upgrade Prompt */}
                            {currentPlan === 'free' && (
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-emerald-500 rounded-lg shrink-0">
                                            <Crown className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold font-mono text-emerald-900 dark:text-emerald-100 mb-2">Unlock Pro Features</h3>
                                            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                                                Create unlimited resumes, access premium templates, and get advanced AI optimization.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button 
                                                    onClick={handleUpgradeClick}
                                                    className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg font-mono text-sm font-bold hover:bg-emerald-600 transition-colors"
                                                >
                                                    Upgrade to Pro
                                                </button>
                                                <button 
                                                    onClick={() => setActiveTab('settings')}
                                                    className="flex-1 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg font-mono text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                                >
                                                    View Plans
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </MotionDiv>
                )}

                {/* Tab: RESUMES */}
                {activeTab === 'resumes' && (
                    <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-mono font-bold dark:text-white">My Resumes</h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage and optimize your documents.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    if (currentPlan === 'free' && resumes.length >= 3) {
                                        setPlanSelectionContext('resume-limit');
                                        setIsPlanSelectionOpen(true);
                                    } else {
                                        onNavigate('builder', initialResumeData);
                                    }
                                }}
                                className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-mono text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Create New
                            </button>
                        </div>

                        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {resumes.map((resume) => (
                                        <div key={resume.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold font-mono text-base md:text-lg dark:text-white mb-1 line-clamp-1">{resume.title}</h3>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                        <span>{resume.lastEdited}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className={`block sm:inline ${resume.score >= 80 ? 'text-emerald-500' : 'text-orange-500'}`}>Score: {resume.score}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
                                                <button 
                                                  onClick={() => handleOpenChat(resume)}
                                                  className="flex-1 md:flex-none justify-center px-3 py-2 text-xs font-bold font-mono border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center gap-2 transition-colors"
                                                >
                                                    <MessageSquare size={14} /> <span className="sm:hidden lg:inline">Ask AI</span>
                                                </button>
                                                <button 
                                                  onClick={() => onNavigate('builder', resume.data)}
                                                  className="flex-1 md:flex-none justify-center px-4 py-2 text-xs font-bold font-mono bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                  onClick={() => handleDeleteResume(resume.id)}
                                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                  title="Delete Resume"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                        </div>
                    </MotionDiv>
                )}

                {/* Tab: TEMPLATES */}
                {activeTab === 'templates' && (
                     <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-mono font-bold dark:text-white">Role Templates</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Jumpstart your resume with pre-filled templates.</p>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input 
                                  type="text" 
                                  placeholder="Search roles..." 
                                  value={templateSearch}
                                  onChange={(e) => setTemplateSearch(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-mono dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none"
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getFilteredTemplates().map(template => (
                                <div key={template.id} className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md hover:border-black dark:hover:border-gray-600 transition-all group flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-[10px] font-mono rounded uppercase tracking-wider">
                                            {template.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold font-mono text-lg dark:text-white mb-2">{template.role}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                                        {template.description}
                                    </p>
                                    <button 
                                      onClick={() => onNavigate('builder', template.data)}
                                      className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 group-hover:bg-gray-800 dark:group-hover:bg-gray-200 transition-colors"
                                    >
                                        Use Template <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                     </MotionDiv>
                )}

                {/* Tab: ATS */}
                {activeTab === 'ats' && (
                    <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-mono font-bold dark:text-white">ATS Scanner & Parser</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Upload your resume to check its score and edit it directly.</p>
                        </div>

                        <div className="max-w-3xl mx-auto">
                          <div 
                              className={`border-2 border-dashed rounded-2xl p-6 md:p-12 text-center transition-all duration-300 relative overflow-hidden bg-white dark:bg-[#0A0A0A] ${
                                  isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-300 dark:border-gray-800'
                              }`}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                          >
                              {isAnalyzing ? (
                                  <div className="py-12 flex flex-col items-center">
                                      <Loader2 className="w-12 h-12 animate-spin text-black dark:text-white mb-6" />
                                      <p className="font-mono text-lg dark:text-gray-300">
                                          {parsingProgress || 'Processing file...'}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-2">
                                          Please wait while Gemini AI analyzes your document...
                                      </p>
                                  </div>
                              ) : atsResult ? (
                                  <div className="text-left animate-in fade-in zoom-in duration-300">
                                      <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                                          <div>
                                              <p className="text-sm font-mono text-gray-500 uppercase mb-2">ATS Score</p>
                                              <div className={`text-4xl md:text-6xl font-bold font-mono ${atsResult.score > 80 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                                  {atsResult.score}/100
                                              </div>
                                          </div>
                                          <button onClick={() => { setAtsResult(null); setExtractedResumeData(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                              <X className="w-6 h-6 dark:text-white" />
                                          </button>
                                      </div>
                                      
                                      <div className="grid md:grid-cols-2 gap-8">
                                          <div className="space-y-4">
                                              <h4 className="font-bold text-sm font-mono uppercase dark:text-gray-400 flex items-center gap-2">
                                                  <AlertCircle size={16} /> Critical Feedback
                                              </h4>
                                              {atsResult.feedback.map((item, i) => (
                                                  <div key={i} className="p-3 bg-orange-50 dark:bg-orange-900/10 text-orange-800 dark:text-orange-200 text-sm rounded-lg border border-orange-100 dark:border-orange-900/20">
                                                      {item}
                                                  </div>
                                              ))}
                                          </div>

                                          <div className="space-y-4">
                                              <h4 className="font-bold text-sm font-mono uppercase dark:text-gray-400 flex items-center gap-2">
                                                  <Search size={16} /> Missing Keywords
                                              </h4>
                                              <div className="grid grid-cols-1 gap-2">
                                                  {/* @ts-ignore */}
                                                  {atsResult.missingKeywords.map((k, i) => (
                                                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20 text-sm">
                                                          <span className="font-bold text-red-700 dark:text-red-400">{k.keyword}</span>
                                                          <span className="text-red-600 dark:text-red-300 text-xs sm:text-sm mt-1 sm:mt-0 italic">{k.suggestion}</span>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      </div>

                                      <div className="flex gap-4 mt-8">
                                          <button 
                                              onClick={() => extractedResumeData && onNavigate('builder', extractedResumeData)}
                                              disabled={!extractedResumeData}
                                              className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg text-base font-bold font-mono hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                                          >
                                              <PenLine className="w-4 h-4" /> Edit Uploaded Resume
                                          </button>
                                      </div>
                                      {extractedResumeData && (
                                          <p className="text-[10px] text-center text-gray-400 mt-2 font-mono">
                                              Your resume has been parsed. Click 'Edit Uploaded Resume' to open it in the builder.
                                          </p>
                                      )}
                                  </div>
                              ) : (
                                  <>
                                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                          <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                      </div>
                                      <h3 className="font-bold font-mono text-xl mb-2 dark:text-white">Upload Resume to Scan & Edit</h3>
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                                          Drag & drop your resume here. Supports PDF, TXT and Images. We'll analyze the ATS score and extract the data so you can edit it instantly.
                                      </p>
                                      <label className="cursor-pointer">
                                          <input type="file" className="hidden" accept=".pdf,.txt,.jpg,.jpeg,.png" onChange={handleFileUpload} />
                                          <span className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold font-mono hover:opacity-80 transition-opacity">
                                              Select Document
                                          </span>
                                      </label>
                                      
                                      {/* Supported formats indicator */}
                                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                                          {['PDF', 'TXT', 'JPG', 'PNG'].map(format => (
                                              <span key={format} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-mono rounded">
                                                  {format}
                                              </span>
                                          ))}
                                      </div>

                                      {/* Error Message Display */}
                                      {analysisError && (
                                           <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-mono text-left">
                                               <div className="font-bold flex items-center gap-2 mb-1">
                                                  <AlertCircle size={16} /> Error
                                               </div>
                                               {analysisError}
                                           </div>
                                      )}
                                  </>
                              )}
                          </div>
                        </div>
                    </MotionDiv>
                )}

                {/* Tab: SETTINGS */}
                {activeTab === 'settings' && (
                    <SettingsComponent 
                        activeSettingsTab={activeSettingsTab}
                        setActiveSettingsTab={handleSettingsTabClick}
                    />
                )}

            </div>
        </main>
      </div>

      {/* Chat Sidebar Overlay */}
      <AnimatePresence>
          {isChatOpen && (
              <>
                  <MotionDiv 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsChatOpen(false)}
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                  />
                  <MotionDiv 
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white dark:bg-[#0A0A0A] shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-800"
                  >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/50">
                          <div>
                              <h3 className="font-bold font-mono dark:text-white">Resume Assistant</h3>
                              <p className="text-xs text-gray-500">{chatResume ? chatResume.title : "General Help"}</p>
                          </div>
                          <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                              <X size={20} className="dark:text-white" />
                          </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-black">
                           {chatMessages.map((msg, i) => (
                                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                          msg.role === 'user' 
                                          ? 'bg-black dark:bg-white text-white dark:text-black rounded-br-sm' 
                                          : 'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                                      }`}>
                                          {msg.text}
                                      </div>
                                  </div>
                              ))}
                           {isChatLoading && (
                                  <div className="flex justify-start">
                                      <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                                          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                          <span className="text-xs text-gray-500 font-mono">Thinking...</span>
                                      </div>
                                  </div>
                              )}
                          <div ref={chatEndRef} />
                      </div>

                      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0A0A0A]">
                          <AIInputWithLoading 
                                placeholder="Ask about your resume..." 
                                onSubmit={handleChatSubmit}
                           />
                      </div>
                  </MotionDiv>
              </>
          )}
      </AnimatePresence>

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

const SidebarItem = ({ icon, label, isActive, onClick, variant = 'default' }: { icon: React.ReactNode, label: string, isActive?: boolean, onClick: () => void, variant?: 'default' | 'danger' }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold font-mono transition-all duration-200 ${
            isActive 
            ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none translate-x-1' 
            : variant === 'danger' 
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white dark:bg-black animate-pulse" />}
    </button>
);

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) => (
    <div className="bg-white dark:bg-[#0A0A0A] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-gray-600 transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono font-bold text-gray-500 uppercase dark:text-gray-500">{title}</span>
            <div className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">{icon}</div>
        </div>
        <div className="flex items-end gap-3">
            <span className="text-3xl font-mono font-bold dark:text-white">{value}</span>
            {trend && <span className="text-xs text-emerald-500 font-mono mb-1">{trend}</span>}
        </div>
    </div>
);

export default Dashboard;