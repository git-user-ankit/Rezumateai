import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ResumeBuilder from './components/ResumeBuilder';
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ResumeData } from './types';
import { Loader2 } from 'lucide-react';

// Wrapper component to handle routing logic inside context
const MainApp = () => {
  const { user, userProfile, loading } = useAuth();
  
  // View state: 'landing' | 'login' | 'signup' | 'dashboard' | 'builder'
  // If user is logged in, default to dashboard. If not, default to landing.
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'builder'>('landing');
  const [initialBuilderData, setInitialBuilderData] = useState<ResumeData | undefined>(undefined);

  useEffect(() => {
    if (userProfile?.preferences?.theme) {
      const theme = userProfile.preferences.theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  }, [userProfile?.preferences?.theme]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If logged in and currently on a public page, go to dashboard
        if (['landing', 'login', 'signup'].includes(view)) {
           setView('dashboard');
        }
      } else {
        // If logged out and on a protected page, go to landing
        if (['dashboard', 'builder'].includes(view)) {
           setView('landing');
        }
      }
    }
  }, [user, loading, view]);

  const handleNavigate = (viewName: 'builder', data?: ResumeData) => {
    if (viewName === 'builder') {
      setInitialBuilderData(data);
      setView('builder');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9FAFB] dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Authenticated Views
  if (user) {
    if (view === 'builder') {
      return (
        <ResumeBuilder 
          onBack={() => setView('dashboard')} 
          initialData={initialBuilderData}
        />
      );
    }
    // Default to dashboard for auth user
    return <Dashboard onNavigate={handleNavigate} />;
  }

  // Public Views
  if (view === 'login') {
    return (
      <LoginPage 
        onBack={() => setView('landing')}
        onSignup={() => setView('signup')}
        onSuccess={() => setView('dashboard')} // Auth context update will trigger effect, but this feels snappier
      />
    );
  }

  if (view === 'signup') {
    return (
      <SignupPage 
        onBack={() => setView('landing')}
        onLogin={() => setView('login')}
        onSuccess={() => setView('dashboard')}
      />
    );
  }

  // Default to Landing Page
  return (
    <LandingPage 
      onLogin={() => setView('login')} 
      onSignup={() => setView('signup')} 
    />
  );
};

export default function App() {
  return (
    <div className="font-sans text-brand-black">
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </div>
  );
}