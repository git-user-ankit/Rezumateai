import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, Wand2, FileText, Zap, Shield, 
  Briefcase, Star, ChevronDown, ChevronUp, Layout, MousePointerClick, 
  Download, Users, Sparkles, Check, Menu, X, Play,
  Twitter, Instagram, Linkedin, Facebook, Heart, Crown, Infinity as InfinityIcon,
  XCircle, TrendingUp, Clock, Target
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;
const MotionSection = motion.section as any;

// Animation variants
const fadeInView = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.3686 9.63139L22 12L14.3686 14.3686L12 22L9.63139 14.3686L2 12L9.63139 9.63139L12 2Z" />
  </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-brand-black dark:text-white selection:bg-purple-500 selection:text-white overflow-x-hidden font-sans">
      
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full z-50 bg-white/70 dark:bg-black/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-300 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white dark:text-black font-bold font-mono">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight font-mono">Rezumate AI</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-bold font-mono text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-bold font-mono text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Pricing</a>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800"></div>
            <button 
              onClick={onLogin}
              className="text-sm font-bold font-mono text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onSignup}
              className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold font-mono hover:scale-105 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <MotionDiv 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                    <div className="p-6 space-y-4 flex flex-col">
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-lg font-mono font-bold">Features</a>
                        <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-lg font-mono font-bold">Pricing</a>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                        <button 
                            onClick={onLogin}
                            className="w-full py-3 text-sm font-bold font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl"
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={onSignup}
                            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold font-mono"
                        >
                            Get Started
                        </button>
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>
      </motion.nav>

      {/* 1. Hero Section with Motion Video Background */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center items-center">
        {/* Video Background */}
        <div className="absolute inset-0 -z-20">
            <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover opacity-90 dark:opacity-40"
            >
                {/* Abstract tech/network video */}
                <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-blue-and-purple-light-996-large.mp4" type="video/mp4" />
            </video>
            {/* Overlays for readability and fading */}
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-black/60 dark:via-transparent dark:to-[#050505]"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-white/10 border border-purple-200 dark:border-white/10 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold mb-8 backdrop-blur-md shadow-sm"
          >
            <SparkleIcon className="w-3 h-3 animate-pulse" />
            <span>AI-Powered Resume Builder V2.0</span>
          </MotionDiv>
          
          <MotionH1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1] md:leading-[1] text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-400 drop-shadow-sm"
          >
            Beat the ATS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400">Get Hired Faster.</span>
          </MotionH1>

          <MotionP 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Create <span className="text-black dark:text-white font-bold">ATS-optimized resumes</span> in seconds using advanced Gemini AI. 
            Tailor your application to any job description and land more interviews.
          </MotionP>

          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onSignup}
              className="group w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold font-mono text-base hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl"
            >
              Build My Resume <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onSignup}
              className="w-full sm:w-auto px-8 py-4 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-black dark:text-white rounded-full font-bold font-mono text-base hover:bg-white/80 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Watch Demo
            </button>
          </MotionDiv>
        </div>

        {/* Floating Preview Card Animation */}
        <MotionDiv 
          initial={{ opacity: 0, y: 60, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.5, type: 'spring' }}
          className="w-full max-w-5xl mx-auto mt-24 relative perspective-1000"
        >
           {/* Glow Effect behind card */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-500/20 dark:bg-purple-500/30 blur-[100px] rounded-full pointer-events-none"></div>

           <div className="relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-2xl p-3 md:p-6 overflow-hidden">
              <div className="aspect-[16/9] bg-white dark:bg-[#0A0A0A] rounded-xl overflow-hidden relative flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner">
                  {/* Decorative Background inside card */}
                  <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.04] bg-[bottom_1px_center]"></div>
                  
                  {/* Resume Mockup */}
                  <div className="relative z-10 bg-white dark:bg-[#111] w-[45%] h-[90%] shadow-2xl rounded-lg border border-gray-100 dark:border-gray-800 p-4 md:p-8 flex flex-col gap-3 md:gap-4 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 origin-bottom-left">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-2"></div>
                      <div className="h-4 w-3/4 bg-gray-800 dark:bg-white rounded"></div>
                      <div className="h-2 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                      
                      <div className="space-y-2 opacity-50">
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div className="h-2 w-5/6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                      </div>

                      <div className="mt-auto p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                         <div className="bg-emerald-500 rounded-full p-1"><Check size={10} className="text-white" /></div>
                         <div className="h-2 w-20 bg-emerald-200 dark:bg-emerald-800 rounded"></div>
                      </div>
                  </div>

                   {/* Analysis Overlay */}
                   <div className="absolute right-[5%] md:right-[15%] top-[10%] md:top-[20%] bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 w-48 animate-bounce-slow z-20">
                      <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase">ATS Score</span>
                          <span className="text-emerald-500 font-bold">98%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[98%]"></div>
                      </div>
                      <div className="mt-3 text-[10px] text-gray-500 flex gap-1">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Keywords Matched
                      </div>
                   </div>
              </div>
           </div>
        </MotionDiv>
      </section>

      {/* 2. Social Proof Section */}
      <MotionSection {...fadeInView} className="py-12 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-[0.2em]">Trusted by top talent at</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20 grayscale opacity-40 hover:opacity-100 transition-opacity duration-500">
                {/* Simple Text Placeholders for Logos to avoid external image deps */}
                <span className="text-2xl font-bold font-sans tracking-tight">Google</span>
                <span className="text-2xl font-bold font-serif">Amazon</span>
                <span className="text-2xl font-bold font-mono tracking-tighter">Netflix</span>
                <span className="text-2xl font-bold font-sans italic">Microsoft</span>
                <span className="text-2xl font-bold font-serif tracking-wide">Spotify</span>
                <span className="text-2xl font-bold font-sans font-black">Tesla</span>
            </div>
        </div>
      </MotionSection>

      {/* NEW SECTION: The ATS Reality (Problem) */}
      <MotionSection {...fadeInView} className="py-24 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div>
                      <span className="inline-block py-1 px-3 rounded-full bg-red-500/10 text-red-500 text-xs font-bold font-mono mb-6 border border-red-500/20">THE REALITY</span>
                      <h2 className="text-4xl md:text-5xl font-bold font-mono mb-6 leading-tight">
                          75% of resumes are never read by a human.
                      </h2>
                      <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                          Applicant Tracking Systems (ATS) filter out millions of qualified candidates simply because their resumes aren't formatted correctly or lack specific keywords.
                      </p>
                      <ul className="space-y-4">
                          <li className="flex items-start gap-3">
                              <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                              <span className="text-gray-300">Generic templates confuse parsing algorithms.</span>
                          </li>
                          <li className="flex items-start gap-3">
                              <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                              <span className="text-gray-300">Missing keywords mean instant rejection.</span>
                          </li>
                          <li className="flex items-start gap-3">
                              <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                              <span className="text-gray-300">Poor formatting leads to garbled data.</span>
                          </li>
                      </ul>
                  </div>
                  <div className="relative">
                      {/* Visual representation of resume getting rejected */}
                      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 relative shadow-2xl">
                          <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold font-mono transform rotate-3 shadow-lg">REJECTED</div>
                          <div className="space-y-3 opacity-50 blur-[1px]">
                              <div className="h-8 w-1/3 bg-gray-800 rounded mb-4"></div>
                              <div className="h-4 w-full bg-gray-800 rounded"></div>
                              <div className="h-4 w-5/6 bg-gray-800 rounded"></div>
                              <div className="h-4 w-4/6 bg-gray-800 rounded"></div>
                          </div>
                          <div className="mt-8 pt-8 border-t border-gray-800">
                             <div className="flex items-center gap-3 text-red-400 font-mono text-sm">
                                <XCircle size={16} /> <span>Parsing Error: Unknown Format</span>
                             </div>
                             <div className="flex items-center gap-3 text-red-400 font-mono text-sm mt-2">
                                <XCircle size={16} /> <span>Keyword Match: 12% (Fail)</span>
                             </div>
                          </div>
                      </div>
                      {/* Rezumate Solution Card Overlay */}
                      <div className="absolute -bottom-6 -left-6 bg-white text-black p-6 rounded-2xl shadow-xl border border-gray-200 w-3/4">
                          <div className="flex items-center justify-between mb-2">
                             <div className="font-bold font-mono">Rezumate Solution</div>
                             <CheckCircle2 className="text-emerald-500" />
                          </div>
                          <p className="text-sm text-gray-600">Our AI ensures 99.9% parse rate and matches keywords instantly.</p>
                      </div>
                  </div>
              </div>
          </div>
      </MotionSection>

      {/* 3. Features Grid */}
      <MotionSection id="features" {...fadeInView} className="py-32 bg-gray-50 dark:bg-[#050505] relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-mono mb-6 dark:text-white">Why Rezumate?</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to build a winning resume, powered by next-gen AI.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            <FeatureCard 
              icon={<Wand2 className="w-6 h-6 text-purple-600" />}
              title="AI Generation"
              description="Generate full resumes from just a job title or description using Google Gemini 2.0."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-emerald-600" />}
              title="ATS Optimization"
              description="Real-time scoring and keyword suggestions to pass Applicant Tracking Systems."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-orange-600" />}
              title="Instant Tailoring"
              description="Customize your resume for specific job applications in seconds."
            />
             <FeatureCard 
              icon={<Layout className="w-6 h-6 text-blue-600" />}
              title="Professional Templates"
              description="Choose from a variety of ATS-friendly templates designed by recruiters."
            />
             <FeatureCard 
              icon={<Briefcase className="w-6 h-6 text-pink-600" />}
              title="Cover Letter Builder"
              description="Create matching cover letters that highlight your unique value proposition."
            />
             <FeatureCard 
              icon={<Download className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
              title="One-Click PDF"
              description="Download your polished resume in standard PDF format ready for application."
            />
          </motion.div>
        </div>
      </MotionSection>

      {/* NEW SECTION: Comparison (Us vs Them) */}
      <MotionSection {...fadeInView} className="py-24 bg-white dark:bg-[#0A0A0A]">
          <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold font-mono dark:text-white mb-6">Stop Using Word Docs</h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400">See why Rezumate gives you the unfair advantage.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl">
                  {/* Features Column */}
                  <div className="hidden md:flex flex-col bg-gray-50 dark:bg-gray-900/50 p-6 md:p-8 justify-center gap-8 border-r border-gray-200 dark:border-gray-800">
                       <div className="h-8"></div> {/* Spacer for header */}
                       <div className="font-bold font-mono text-gray-600 dark:text-gray-300">ATS Readability</div>
                       <div className="font-bold font-mono text-gray-600 dark:text-gray-300">Formatting</div>
                       <div className="font-bold font-mono text-gray-600 dark:text-gray-300">Content Writing</div>
                       <div className="font-bold font-mono text-gray-600 dark:text-gray-300">Tailoring</div>
                       <div className="font-bold font-mono text-gray-600 dark:text-gray-300">Keywords</div>
                  </div>

                  {/* Standard Resume */}
                  <div className="flex flex-col p-6 md:p-8 bg-white dark:bg-black items-center text-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
                      <div className="h-8 font-bold font-mono text-gray-400 uppercase tracking-widest mb-8">Standard Editor</div>
                      
                      <div className="flex flex-col gap-8 w-full">
                          <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm text-gray-500">ATS Readability</span>
                              <XCircle className="text-gray-300" />
                          </div>
                          <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm text-gray-500">Formatting</span>
                              <span className="text-sm text-gray-400">Manual & Messy</span>
                          </div>
                          <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm text-gray-500">Writing</span>
                              <span className="text-sm text-gray-400">You're on your own</span>
                          </div>
                           <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm text-gray-500">Tailoring</span>
                              <span className="text-sm text-gray-400">Hours per job</span>
                          </div>
                           <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm text-gray-500">Keywords</span>
                              <span className="text-sm text-gray-400">Guesswork</span>
                          </div>
                      </div>
                  </div>

                  {/* Rezumate */}
                  <div className="flex flex-col p-6 md:p-8 bg-purple-50/50 dark:bg-purple-900/10 items-center text-center relative">
                      <div className="absolute top-0 inset-x-0 h-1 bg-purple-500"></div>
                      <div className="h-8 font-bold font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                          <Crown size={16} /> Rezumate AI
                      </div>
                      
                      <div className="flex flex-col gap-8 w-full">
                          <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm font-bold">ATS Readability</span>
                              <CheckCircle2 className="text-emerald-500 fill-emerald-500/20" />
                          </div>
                          <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm font-bold">Formatting</span>
                              <span className="text-sm font-bold dark:text-white">Perfect Auto-Layout</span>
                          </div>
                          <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm font-bold">Writing</span>
                              <span className="text-sm font-bold dark:text-white">AI Generated & Polished</span>
                          </div>
                           <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm font-bold">Tailoring</span>
                              <span className="text-sm font-bold dark:text-white">One-Click Customization</span>
                          </div>
                           <div className="flex justify-between md:justify-center items-center w-full">
                              <span className="md:hidden text-sm font-bold">Keywords</span>
                              <span className="text-sm font-bold dark:text-white">Intelligent Scanning</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </MotionSection>

      {/* 4. How It Works */}
      <MotionSection {...fadeInView} className="py-32 bg-white dark:bg-black border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-sm uppercase mb-4 block tracking-widest">The Process</span>
                <h2 className="text-4xl md:text-5xl font-bold font-mono dark:text-white mb-6">How it works</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Three simple steps to your dream job.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent -z-10"></div>

                <StepCard 
                    number="01"
                    title="Import or Create"
                    description="Upload your existing resume to parse data or start from scratch with our AI builder."
                    icon={<FileText className="w-6 h-6" />}
                />
                <StepCard 
                    number="02"
                    title="AI Optimization"
                    description="Our AI analyzes your profile against job descriptions and suggests impactful improvements."
                    icon={<Sparkles className="w-6 h-6" />}
                />
                 <StepCard 
                    number="03"
                    title="Download & Apply"
                    description="Export your polished, ATS-ready resume and start applying with confidence."
                    icon={<Download className="w-6 h-6" />}
                />
            </div>
        </div>
      </MotionSection>

      {/* NEW SECTION: Impact Stats */}
      <MotionSection {...fadeInView} className="py-20 bg-gray-50 dark:bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   <div className="text-center">
                       <div className="text-4xl md:text-5xl font-bold font-mono text-black dark:text-white mb-2">300k+</div>
                       <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Resumes Built</div>
                   </div>
                   <div className="text-center">
                       <div className="text-4xl md:text-5xl font-bold font-mono text-purple-600 dark:text-purple-400 mb-2">2x</div>
                       <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">More Interviews</div>
                   </div>
                   <div className="text-center">
                       <div className="text-4xl md:text-5xl font-bold font-mono text-black dark:text-white mb-2">98%</div>
                       <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Satisfaction Rate</div>
                   </div>
                   <div className="text-center">
                       <div className="text-4xl md:text-5xl font-bold font-mono text-emerald-500 mb-2">24/7</div>
                       <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">AI Availability</div>
                   </div>
              </div>
          </div>
      </MotionSection>

      {/* 5. Templates Showcase */}
      <MotionSection {...fadeInView} className="py-32 bg-gray-50 dark:bg-[#050505] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                    <h2 className="text-4xl font-bold font-mono dark:text-white mb-4">Professional Templates</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg text-lg">
                        Clean, modern, and recruiter-approved designs that emphasize readability and impact.
                    </p>
                </div>
                <button onClick={onSignup} className="hidden md:flex items-center gap-2 text-black dark:text-white font-mono font-bold hover:underline group">
                    View all templates <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                            {/* Abstract Resume Representation */}
                            <div className="absolute inset-6 bg-white dark:bg-black shadow-lg p-6 flex flex-col gap-3 opacity-90 transition-transform duration-500 group-hover:scale-105">
                                <div className="flex gap-4 mb-4">
                                   <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                                   <div className="flex-1 space-y-2">
                                      <div className="h-3 w-1/2 bg-gray-800 dark:bg-gray-200"></div>
                                      <div className="h-2 w-1/3 bg-gray-400 dark:bg-gray-600"></div>
                                   </div>
                                </div>
                                <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 mt-2"></div>
                                <div className="h-2 w-full bg-gray-200 dark:bg-gray-800"></div>
                                <div className="h-24 w-full bg-gray-100 dark:bg-gray-900 mt-4 border border-dashed border-gray-200 dark:border-gray-800"></div>
                                <div className="h-24 w-full bg-gray-100 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800"></div>
                            </div>
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={onSignup} className="px-8 py-3 bg-white text-black font-bold font-mono rounded-full transform scale-90 group-hover:scale-100 transition-transform shadow-xl">
                                    Use Template
                                </button>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold font-mono dark:text-white text-lg">Modern Professional {i}</h3>
                            <p className="text-xs font-mono text-gray-500 uppercase mt-1">Tech & Creative Roles</p>
                        </div>
                    </div>
                ))}
            </div>
             <button onClick={onSignup} className="md:hidden w-full mt-8 flex items-center justify-center gap-2 text-black dark:text-white font-mono font-bold border border-gray-200 dark:border-gray-800 p-4 rounded-xl">
                View all templates <ArrowRight size={16} />
            </button>
          </div>
      </MotionSection>

      {/* 6. Testimonials */}
      <MotionSection {...fadeInView} className="py-32 bg-white dark:bg-black border-y border-gray-100 dark:border-white/5 relative">
          <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-gray-50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-20">
                  <h2 className="text-4xl font-bold font-mono dark:text-white mb-6">Success Stories</h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Join thousands of professionals getting hired at top companies.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  <TestimonialCard 
                      quote="I applied to 50 jobs with no response. After using Rezumate to tailor my resume, I got 3 interviews in a week!"
                      author="Sarah J."
                      role="Product Manager"
                      company="TechFlow"
                  />
                  <TestimonialCard 
                      quote="The AI suggestions helped me quantify my achievements in ways I hadn't thought of. The ATS score feature is a lifesaver."
                      author="David L."
                      role="Software Engineer"
                      company="DataCorp"
                  />
                  <TestimonialCard 
                      quote="Finally, a resume builder that actually creates clean, ATS-readable files without messing up the formatting."
                      author="Emily R."
                      role="Marketing Specialist"
                      company="GrowthIo"
                  />
              </div>
          </div>
      </MotionSection>

      {/* 7. Pricing */}
      <MotionSection id="pricing" {...fadeInView} className="py-32 bg-gray-50 dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-20">
                  <h2 className="text-4xl font-bold font-mono dark:text-white mb-6">Simple, Transparent Pricing</h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Start for free, upgrade for power. No hidden fees.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {/* Free Plan */}
                  <div className="p-8 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col">
                      <h3 className="text-2xl font-bold font-mono dark:text-white">Free Starter</h3>
                      <div className="mt-4 mb-6">
                          <span className="text-4xl font-bold dark:text-white tracking-tight">$0</span>
                          <span className="text-gray-500 ml-2">/forever</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-8 leading-relaxed">Perfect for your first resume and applying to your first few jobs.</p>
                      
                      <ul className="space-y-4 mb-8 flex-1">
                          <li className="flex items-center gap-3 text-sm dark:text-gray-300 font-medium"><Check className="w-5 h-5 text-black dark:text-white bg-gray-100 dark:bg-gray-800 rounded-full p-1" /> Create 1 Resume</li>
                          <li className="flex items-center gap-3 text-sm dark:text-gray-300 font-medium"><Check className="w-5 h-5 text-black dark:text-white bg-gray-100 dark:bg-gray-800 rounded-full p-1" /> Basic AI Suggestions</li>
                          <li className="flex items-center gap-3 text-sm dark:text-gray-300 font-medium"><Check className="w-5 h-5 text-black dark:text-white bg-gray-100 dark:bg-gray-800 rounded-full p-1" /> Download as PDF</li>
                          <li className="flex items-center gap-3 text-sm text-gray-400"><Check className="w-5 h-5 text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-full p-1" /> ATS Keyword Scanner</li>
                      </ul>

                      <button onClick={onSignup} className="w-full py-4 border-2 border-black dark:border-white text-black dark:text-white font-bold font-mono rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          Get Started Free
                      </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="p-8 rounded-3xl border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black relative flex flex-col shadow-2xl md:-translate-y-4">
                      <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl uppercase tracking-wider">Most Popular</div>
                      <h3 className="text-2xl font-bold font-mono flex items-center gap-2"><Crown className="w-5 h-5 text-purple-400 dark:text-purple-600" /> Pro Career</h3>
                      <div className="mt-4 mb-6">
                          <span className="text-4xl font-bold tracking-tight">$12</span>
                          <span className="opacity-60 ml-2">/month</span>
                      </div>
                      <p className="opacity-80 text-sm mb-8 leading-relaxed">For serious job seekers who want to maximize their interview chances.</p>
                      
                      <ul className="space-y-4 mb-8 flex-1">
                          <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-black dark:text-white bg-white dark:bg-black rounded-full p-1" /> Unlimited Resumes</li>
                          <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-black dark:text-white bg-white dark:bg-black rounded-full p-1" /> Advanced Gemini 1.5 Pro AI</li>
                          <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-black dark:text-white bg-white dark:bg-black rounded-full p-1" /> Real-time ATS Score</li>
                          <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-black dark:text-white bg-white dark:bg-black rounded-full p-1" /> Auto-Tailoring to Jobs</li>
                          <li className="flex items-center gap-3 text-sm font-medium"><Check className="w-5 h-5 text-black dark:text-white bg-white dark:bg-black rounded-full p-1" /> Cover Letter Generator</li>
                      </ul>

                      <button onClick={onSignup} className="w-full py-4 bg-white dark:bg-black text-black dark:text-white font-bold font-mono rounded-xl hover:opacity-90 transition-opacity shadow-lg">
                          Upgrade to Pro
                      </button>
                  </div>

                  {/* Lifetime Plan */}
                  <div className="p-8 rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 relative flex flex-col hover:border-amber-400 dark:hover:border-amber-600 transition-all">
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl uppercase tracking-wider">Best Value</div>
                      <h3 className="text-2xl font-bold font-mono dark:text-white flex items-center gap-2 text-amber-600 dark:text-amber-400"><InfinityIcon className="w-6 h-6" /> Lifetime</h3>
                      <div className="mt-4 mb-6">
                          <span className="text-4xl font-bold dark:text-white tracking-tight">$299</span>
                          <span className="text-gray-500 ml-2">/one-time</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">Pay once, own it forever. No monthly fees. Ultimate career security.</p>
                      
                      <ul className="space-y-4 mb-8 flex-1">
                          <li className="flex items-center gap-3 text-sm dark:text-gray-300 font-medium"><Check className="w-5 h-5 text-white bg-amber-500 rounded-full p-1" /> Unlimited Resumes & PDF Downloads</li>
                          <li className="flex items-center gap-3 text-sm dark:text-gray-300 font-medium"><Check className="w-5 h-5 text-white bg-amber-500 rounded-full p-1" /> Advanced AI (Gemini 1.5 Pro)</li>
                          <li className="flex items-center gap-3 text-sm dark:text-gray-300 font-medium"><Check className="w-5 h-5 text-white bg-amber-500 rounded-full p-1" /> Lifetime Updates & Features</li>
                          <li className="flex items-center gap-3 text-sm dark:text-gray-300 font-medium"><Check className="w-5 h-5 text-white bg-amber-500 rounded-full p-1" /> Priority Support & Founders Club</li>
                      </ul>

                      <button onClick={onSignup} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold font-mono rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-200 dark:shadow-none">
                          Get Lifetime Access
                      </button>
                  </div>
              </div>
        </div>
      </MotionSection>

      {/* 8. FAQ */}
      <MotionSection {...fadeInView} className="py-32 bg-white dark:bg-black">
          <div className="max-w-3xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold font-mono dark:text-white mb-6">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4">
                  {[
                      { q: "Is Rezumate really free?", a: "Yes, our Free Starter plan allows you to build and download a resume for free. We also offer a Pro plan for advanced features." },
                      { q: "How does the ATS optimization work?", a: "We use Google's Gemini AI to analyze your resume against common Applicant Tracking System algorithms, checking for keyword density, formatting, and readability." },
                      { q: "Can I import my existing resume?", a: "Absolutely. You can upload a PDF or TXT file, and our system will parse the content into editable fields." },
                      { q: "Is my data secure?", a: "Your privacy is our priority. We use industry-standard encryption and do not share your personal data with third parties." }
                  ].map((item, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                          <button 
                              onClick={() => toggleFaq(index)}
                              className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                          >
                              <span className="font-bold font-mono dark:text-white">{item.q}</span>
                              {openFaqIndex === index ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                          </button>
                          <AnimatePresence>
                            {openFaqIndex === index && (
                                <MotionDiv
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 pt-0 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {item.a}
                                    </div>
                                </MotionDiv>
                            )}
                          </AnimatePresence>
                      </div>
                  ))}
              </div>
          </div>
      </MotionSection>

      {/* 9. CTA Section */}
      <MotionSection {...fadeInView} className="py-32 bg-white dark:bg-black">
          <div className="max-w-6xl mx-auto px-6">
              <div className="bg-black dark:bg-white rounded-[2.5rem] p-8 md:p-24 text-center relative overflow-hidden shadow-2xl">
                  {/* Abstract shapes */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="relative z-10">
                      <h2 className="text-4xl md:text-6xl font-bold font-mono text-white dark:text-black mb-8">Ready to land your dream job?</h2>
                      <p className="text-gray-400 dark:text-gray-600 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                          Join thousands of professionals who have upgraded their careers with Rezumate AI.
                      </p>
                      <button 
                          onClick={onSignup}
                          className="px-12 py-5 bg-white dark:bg-black text-black dark:text-white rounded-full font-bold font-mono text-lg hover:scale-105 transition-transform shadow-xl"
                      >
                          Build My Resume Now
                      </button>
                      <p className="mt-8 text-sm text-gray-500 font-mono">No credit card required for free plan.</p>
                  </div>
              </div>
          </div>
      </MotionSection>

      {/* 10. Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
           {/* Brand */}
           <div className="md:col-span-1">
               <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold font-mono text-sm">R</span>
                </div>
                <span className="font-bold font-mono text-lg dark:text-white">Rezumate AI</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                The world's most advanced AI-powered resume builder. Beat the ATS and land your dream job today.
              </p>
              <div className="flex items-center gap-4 text-gray-400 hover:text-gray-500 transition-colors">
                  <a href="#" className="hover:text-black dark:hover:text-white transition-colors"><Twitter size={20} /></a>
                  <a href="#" className="hover:text-black dark:hover:text-white transition-colors"><Instagram size={20} /></a>
                  <a href="#" className="hover:text-black dark:hover:text-white transition-colors"><Linkedin size={20} /></a>
                  <a href="#" className="hover:text-black dark:hover:text-white transition-colors"><Facebook size={20} /></a>
              </div>
           </div>

           {/* Product Links */}
           <div>
               <h4 className="font-bold font-mono dark:text-white mb-6">Product</h4>
               <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                   <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Features</a></li>
                   <li><a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a></li>
                   <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Templates</a></li>
                   <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Success Stories</a></li>
               </ul>
           </div>

           {/* Support Links */}
           <div>
               <h4 className="font-bold font-mono dark:text-white mb-6">Support</h4>
               <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                   <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Help Center</a></li>
                   <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact Us</a></li>
                   <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a></li>
                   <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</a></li>
               </ul>
           </div>

           {/* Legal/Copyright */}
           <div className="md:col-span-1">
               <h4 className="font-bold font-mono dark:text-white mb-6">Legal</h4>
               <p className="text-xs text-gray-400 mb-4">
                   © 2024 Rezumate AI Inc. All rights reserved.
               </p>
               <p className="text-xs text-gray-400 flex items-center gap-1">
                   Made with <Heart size={10} className="fill-red-500 text-red-500" /> in San Francisco
               </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="bg-white dark:bg-[#0A0A0A] p-10 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20 transition-all duration-300 hover:shadow-xl group">
    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold font-mono mb-3 dark:text-white">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
      {description}
    </p>
  </motion.div>
);

const StepCard = ({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-3xl border border-gray-100 dark:border-white/5 relative z-10 text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-lg">
        <div className="w-16 h-16 mx-auto bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mb-6 font-bold font-mono shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
            {icon}
        </div>
        <div className="text-xs font-bold text-gray-400 mb-3 font-mono tracking-widest">STEP {number}</div>
        <h3 className="text-xl font-bold mb-3 dark:text-white font-mono">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const TestimonialCard = ({ quote, author, role, company }: { quote: string, author: string, role: string, company: string }) => (
    <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm p-10 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
        <div className="flex gap-1 mb-6">
            {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-8 leading-relaxed text-lg">"{quote}"</p>
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 text-lg">
                {author.charAt(0)}
            </div>
            <div>
                <div className="font-bold text-base dark:text-white font-mono">{author}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">{role}, {company}</div>
            </div>
        </div>
    </div>
);

export default LandingPage;