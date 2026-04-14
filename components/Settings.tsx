import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, CreditCard, HelpCircle, Moon, Sun, Monitor, Infinity, Loader2, Save, Palette, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FONT_OPTIONS = [
    { name: 'Standard (Times New Roman)', value: '"Times New Roman", serif' },
    { name: 'Modern (Calibri/Inter)', value: 'Inter, sans-serif' },
    { name: 'Clean (Arial/Roboto)', value: 'Roboto, sans-serif' },
    { name: 'Classic (Georgia)', value: 'Georgia, serif' },
    { name: 'Elegant (Garamond)', value: '"EB Garamond", serif' }
];

interface SettingsProps {
    activeSettingsTab: string;
    setActiveSettingsTab: (tab: any) => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({ activeSettingsTab, setActiveSettingsTab }) => {
    const { user, userProfile, updateUserProfile } = useAuth();
    const [name, setName] = useState(userProfile?.fullName || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile({ fullName: name });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Security', icon: Lock },
        { id: 'support', label: 'Help & Support', icon: HelpCircle },
    ];

    return (
        <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 p-4">
                <h2 className="text-lg font-bold font-mono mb-4 px-2 dark:text-white">Settings</h2>
                <nav className="space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSettingsTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeSettingsTab === tab.id
                                    ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                {activeSettingsTab === 'profile' && (
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-xl font-bold font-mono mb-6 dark:text-white">Public Profile</h3>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center text-2xl font-bold text-white dark:text-black">
                                {name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold font-mono hover:opacity-80 transition-opacity">
                                    Upload New Avatar
                                </button>
                                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    value={user?.email || ''} 
                                    disabled
                                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed" 
                                />
                            </div>
                            
                            <div className="pt-4">
                                <button 
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold font-mono text-sm hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                                    {saveSuccess ? 'Saved!' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSettingsTab === 'preferences' && (
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-xl font-bold font-mono mb-6 dark:text-white">App Preferences</h3>
                        
                        <div className="space-y-8">
                            {/* Theme Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Appearance</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'light', label: 'Light', icon: Sun },
                                        { id: 'dark', label: 'Dark', icon: Moon },
                                        { id: 'system', label: 'System', icon: Monitor }
                                    ].map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => {
                                                const newTheme = theme.id as any;
                                                updateUserProfile({
                                                    preferences: {
                                                        ...userProfile?.preferences,
                                                        theme: newTheme
                                                    }
                                                });
                                                if (newTheme === 'dark') document.documentElement.classList.add('dark');
                                                else if (newTheme === 'light') document.documentElement.classList.remove('dark');
                                                else {
                                                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
                                                    else document.documentElement.classList.remove('dark');
                                                }
                                            }}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                                                (userProfile?.preferences?.theme || 'light') === theme.id
                                                    ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 text-black dark:text-white'
                                                    : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700'
                                            }`}
                                        >
                                            <theme.icon size={20} />
                                            <span className="text-xs font-bold font-mono">{theme.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Default Resume Font</label>
                                <div className="space-y-2">
                                    {FONT_OPTIONS.map((font) => (
                                        <button
                                            key={font.value}
                                            onClick={() => updateUserProfile({
                                                preferences: {
                                                    ...userProfile?.preferences,
                                                    selectedFont: font.value
                                                }
                                            })}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                (userProfile?.preferences?.selectedFont || FONT_OPTIONS[0].value) === font.value
                                                    ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 text-black dark:text-white'
                                                    : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700'
                                            }`}
                                        >
                                            <span style={{ fontFamily: font.value }} className="text-sm">{font.name}</span>
                                            {(userProfile?.preferences?.selectedFont || FONT_OPTIONS[0].value) === font.value && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSettingsTab === 'billing' && (
                    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                         <h3 className="text-xl font-bold font-mono mb-2 dark:text-white">Subscription Plan</h3>
                         <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your billing and subscription details.</p>
                         
                         <div className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900 rounded-xl p-6 mb-8">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">Current Plan</span>
                                     <h4 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">Free Tier</h4>
                                 </div>
                                 <span className="px-3 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 rounded-full text-xs font-bold">Active</span>
                             </div>
                             <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800 flex gap-4 text-sm text-emerald-800 dark:text-emerald-200">
                                 <span>• 3/3 Resumes Used</span>
                                 <span>• Basic AI Access</span>
                             </div>
                         </div>
                         
                         <h4 className="font-bold mb-4 dark:text-white text-lg">Upgrade Options</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-black dark:hover:border-gray-600 cursor-pointer transition-colors bg-white dark:bg-black">
                                 <h5 className="font-bold dark:text-white">Pro Monthly</h5>
                                 <p className="text-2xl font-bold mt-1 dark:text-white">$12<span className="text-sm font-normal text-gray-500">/mo</span></p>
                                 <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                     <li>✓ Unlimited Resumes</li>
                                     <li>✓ Advanced AI</li>
                                 </ul>
                             </div>
                             <div className="border-2 border-black dark:border-white rounded-xl p-4 cursor-pointer bg-black/5 dark:bg-white/5 relative">
                                 <div className="absolute top-0 right-0 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                                 <h5 className="font-bold dark:text-white">Pro Yearly</h5>
                                 <p className="text-2xl font-bold mt-1 dark:text-white">$120<span className="text-sm font-normal text-gray-500">/yr</span></p>
                                 <p className="text-xs text-emerald-600 font-bold mt-1">Save 20%</p>
                             </div>
                             <div className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 cursor-pointer bg-amber-50 dark:bg-amber-900/10 hover:border-amber-400 transition-colors">
                                 <h5 className="font-bold dark:text-white flex items-center gap-1 text-amber-700 dark:text-amber-500"><Infinity size={14}/> Lifetime</h5>
                                 <p className="text-2xl font-bold mt-1 dark:text-white">$299<span className="text-sm font-normal text-gray-500">/once</span></p>
                                 <p className="text-xs text-amber-600 font-bold mt-1">Pay once, forever</p>
                             </div>
                         </div>
                    </div>
                )}
                
                {activeSettingsTab !== 'profile' && activeSettingsTab !== 'billing' && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Monitor size={48} className="mb-4 opacity-50" />
                        <p>This section is under construction.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsComponent;