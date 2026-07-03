import React, { useState } from 'react';
import { User, ShieldAlert, Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';

interface WelcomeViewProps {
  onSelectRole: (role: 'customer', name: string) => void;
  onAdminLogin: () => void;
}

export default function WelcomeView({ onSelectRole, onAdminLogin }: WelcomeViewProps) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerInputName, setCustomerInputName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'L@v@holic2025') {
      setError('');
      setPasscode('');
      setShowAdminModal(false);
      onAdminLogin();
    } else {
      setError('Incorrect passcode. Please contact admin.');
    }
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerInputName.trim()) {
      setShowCustomerModal(false);
      onSelectRole('customer', customerInputName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0a7c92] text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans select-none">
      {/* Premium background decorative blur circles */}
      <div className="absolute top-[-25%] left-[-20%] w-[90%] h-[70%] rounded-full bg-white/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[80%] h-[60%] rounded-full bg-white/5 blur-[100px] pointer-events-none"></div>

      {/* Decorative top element */}
      <div className="flex justify-center mt-4 relative z-10">
        <div className="w-12 h-1 bg-white/20 rounded-full"></div>
      </div>

      {/* Main Branding Section */}
      <div className="max-w-md w-full mx-auto flex flex-col items-center text-center space-y-6 my-auto relative z-10">
        
        {/* Recreated Crisp Vector Logo */}
        <div className="flex flex-col items-center justify-center space-y-0.5 select-none" id="welcome-logo-container">
          {/* Logo Main Text */}
          <h1 className="font-sans font-extrabold text-5xl md:text-6xl text-white tracking-tight leading-none drop-shadow-sm">
            Lavaholic
          </h1>
          {/* Logo Subtitle & Icon Flex Container */}
          <div className="flex items-center gap-2.5 mt-1">
            <span className="font-sans font-medium text-[20px] md:text-[22px] text-white tracking-wide opacity-95">
              Laundry Hub
            </span>
            {/* Basket Icon matching the uploaded logo */}
            <svg 
              className="w-7 h-auto md:w-8 text-white fill-white drop-shadow-sm" 
              viewBox="0 0 34 26" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Laundry Hub Basket Logo"
            >
              {/* Top Rim */}
              <rect x="0" y="0" width="34" height="4" rx="1" fill="currentColor" />
              {/* 6 Vertical Slats */}
              <rect x="3" y="6" width="3" height="15" rx="1" fill="currentColor" />
              <rect x="8" y="6" width="3" height="15" rx="1" fill="currentColor" />
              <rect x="13" y="6" width="3" height="15" rx="1" fill="currentColor" />
              <rect x="18" y="6" width="3" height="15" rx="1" fill="currentColor" />
              <rect x="23" y="6" width="3" height="15" rx="1" fill="currentColor" />
              <rect x="28" y="6" width="3" height="15" rx="1" fill="currentColor" />
              {/* Bottom Bar */}
              <rect x="3" y="19" width="28" height="3" rx="1" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Dynamic Tagline Badge */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-4 bg-white/10 backdrop-blur-md rounded-full w-fit mx-auto border border-white/10 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-white opacity-95" />
          <span className="text-[10px] font-bold tracking-wider text-white uppercase">Ultra Fresh Cycles</span>
        </div>

        {/* Supportive Text */}
        <p className="text-sm text-white/80 font-medium max-w-xs leading-relaxed">
          Experience clean, fast, and responsive laundry management at your fingertips. Tracking your clean garments has never been easier.
        </p>

        {/* Option Select Buttons */}
        <div className="w-full space-y-3.5 pt-4">
          <button
            onClick={() => {
              setCustomerInputName('');
              setShowCustomerModal(true);
            }}
            className="w-full bg-white hover:bg-white/95 text-[#0a7c92] py-4 rounded-2xl font-sans font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg shadow-black/10 cursor-pointer"
            id="welcome-customer-btn"
          >
            <User className="w-4.5 h-4.5 text-[#0a7c92]" />
            <span>Track My Laundry (Customer)</span>
          </button>

          <button
            onClick={() => {
              setError('');
              setPasscode('');
              setShowAdminModal(true);
            }}
            className="w-full bg-white/10 hover:bg-white/15 text-white py-4 rounded-2xl font-sans text-sm font-bold transition-all active:scale-[0.98] border border-white/20 flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-sm"
            id="welcome-admin-btn"
          >
            <ShieldAlert className="w-4.5 h-4.5 text-white/80" />
            <span>Staff & Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Elegant Footer branding */}
      <footer className="text-center text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-2 relative z-10">
        © 2026 Lavaholic Laundry Hub • All Rights Reserved
      </footer>

      {/* Admin Passcode Modal Sheet */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#086375]/95 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/25 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-white/15">
              <h3 className="font-sans font-bold text-base text-white flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-white" />
                <span>Admin Passcode Required</span>
              </h3>
              <button 
                onClick={() => setShowAdminModal(false)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                Please enter the authorized administrator passcode to access live metrics, price configurators, and logs.
              </p>

              <div className="space-y-1.5">
                <label className="font-sans text-[10px] font-bold text-white/75 block uppercase tracking-wider">Passcode</label>
                <div className="relative flex items-center">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter admin passcode"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-mono text-sm tracking-wider text-white placeholder-white/40 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all pr-12 shadow-inner"
                    id="admin-passcode-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <div className="text-[11px] text-red-200 bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-xl font-semibold mt-2" id="passcode-error">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-sans text-xs font-bold border border-white/15 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-white hover:bg-white/95 text-[#0a7c92] rounded-xl font-sans text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#0a7c92]" />
                  <span>Verify Code</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Name Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#086375]/95 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/25 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-white/15">
              <h3 className="font-sans font-bold text-base text-white flex items-center gap-1.5">
                <User className="w-5 h-5 text-white" />
                <span>Enter Your Name</span>
              </h3>
              <button 
                onClick={() => setShowCustomerModal(false)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                Please enter your name or username to personalize your tracking dashboard and access your active laundry records.
              </p>

              <div className="space-y-1.5">
                <label className="font-sans text-[10px] font-bold text-white/75 block uppercase tracking-wider">Your Name / Username</label>
                <input
                  type="text"
                  value={customerInputName}
                  onChange={(e) => setCustomerInputName(e.target.value)}
                  placeholder="e.g., Alex Carter"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder-white/40 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all shadow-inner"
                  id="customer-name-input"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-sans text-xs font-bold border border-white/15 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-white hover:bg-white/95 text-[#0a7c92] rounded-xl font-sans text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start Tracking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
