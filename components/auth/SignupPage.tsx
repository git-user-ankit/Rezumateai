import React, { useState } from 'react';
import { auth, db } from '../../src/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface SignupPageProps {
  onBack: () => void;
  onLogin: () => void;
  onSuccess: () => void;
}

export default function SignupPage({ onBack, onLogin, onSuccess }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithGoogle, isMockMode } = useAuth();

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with name
      await updateProfile(user, { displayName: name });

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-up is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        {/* Branding Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white dark:text-black font-bold font-mono text-lg">R</span>
            </div>
            <span className="text-2xl font-bold font-mono dark:text-white tracking-tight">Rezumate AI</span>
        </div>

        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white mb-6 transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
                
                <div className="mb-8">
                    <h2 className="text-2xl font-bold font-mono dark:text-white">Create Account</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Start building your career with Rezumate AI.</p>
                    {isMockMode && (
                       <p className="text-[10px] mt-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded inline-block font-mono">
                         Demo Mode: No real email required
                       </p>
                    )}
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold font-mono text-gray-500 uppercase mb-1.5">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-mono focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold font-mono text-gray-500 uppercase mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-mono focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold font-mono text-gray-500 uppercase mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-mono focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white transition-all"
                                placeholder="Min 6 characters"
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg font-mono flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold font-mono hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-[#0A0A0A] px-2 text-gray-500 font-mono">Or continue with</span>
                    </div>
                </div>

                <button 
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="mt-6 w-full py-3 border border-gray-200 dark:border-gray-800 rounded-xl font-bold font-mono text-sm flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all disabled:opacity-50 dark:text-white"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-black/50 border-t border-gray-200 dark:border-gray-800 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Already have an account? {' '}
                    <button onClick={onLogin} className="font-bold text-black dark:text-white hover:underline">
                        Sign in
                    </button>
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}