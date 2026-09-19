import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, UserCheck, KeyRound, Smartphone, LogOut, Check, AlertCircle } from 'lucide-react';

export interface AuthSession {
  isUnlocked: boolean;
  currentUser: 'mark' | 'paulo';
  userName: string;
  email: string;
  rememberDevice: boolean;
  unlockedAt: string;
}

interface PrivateGateModalProps {
  session: AuthSession;
  onUnlock: (session: AuthSession) => void;
  onLock: () => void;
  isOpenManualModal?: boolean;
  onCloseManualModal?: () => void;
}

export const PrivateGateModal: React.FC<PrivateGateModalProps> = ({
  session,
  onUnlock,
  onLock,
  isOpenManualModal = false,
  onCloseManualModal,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<'mark' | 'paulo'>(session.currentUser || 'mark');
  const [pin, setPin] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPinHint, setShowPinHint] = useState(false);

  // Focus and clear error on profile switch
  useEffect(() => {
    setError(null);
  }, [selectedProfile]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter the private contractor PIN');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call server verify-pin endpoint
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin.trim(),
          userProfile: selectedProfile
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const newSession: AuthSession = {
          isUnlocked: true,
          currentUser: selectedProfile,
          userName: selectedProfile === 'mark' ? 'Mark Karlon' : 'Paulo',
          email: selectedProfile === 'mark' ? 'markkarlon@yahoo.com' : 'paulospeople@gmail.com',
          rememberDevice: remember,
          unlockedAt: new Date().toISOString()
        };

        if (remember) {
          localStorage.setItem('renew_auth_session', JSON.stringify(newSession));
        } else {
          sessionStorage.setItem('renew_auth_session', JSON.stringify(newSession));
        }

        if (data.token) {
          localStorage.setItem('renew_mark_token', data.token);
        }

        onUnlock(newSession);
        setPin('');
        if (onCloseManualModal) onCloseManualModal();
      } else {
        setError(data.error || 'Incorrect PIN. Default is 4242.');
      }
    } catch {
      // Fallback local verification in case of offline/network hiccups
      if (pin.trim() === '4242') {
        const newSession: AuthSession = {
          isUnlocked: true,
          currentUser: selectedProfile,
          userName: selectedProfile === 'mark' ? 'Mark Karlon' : 'Paulo',
          email: selectedProfile === 'mark' ? 'markkarlon@yahoo.com' : 'paulospeople@gmail.com',
          rememberDevice: remember,
          unlockedAt: new Date().toISOString()
        };
        if (remember) {
          localStorage.setItem('renew_auth_session', JSON.stringify(newSession));
        }
        onUnlock(newSession);
        setPin('');
        if (onCloseManualModal) onCloseManualModal();
      } else {
        setError('Incorrect PIN. The default contractor PIN is 4242.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickKeypad = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // If already unlocked and not opening the manual settings modal, render nothing
  if (session.isUnlocked && !isOpenManualModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close button if manual settings modal */}
        {isOpenManualModal && session.isUnlocked && (
          <button
            type="button"
            onClick={onCloseManualModal}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        )}

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 mx-auto mb-3 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Renew Private Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Restricted to Mark Karlon & Paulo for private contractor leads and homeowner outreach.
          </p>
        </div>

        {/* If already unlocked and opened as settings */}
        {session.isUnlocked && isOpenManualModal ? (
          <div className="space-y-5">
            <div className="p-4 bg-slate-800/80 border border-emerald-500/40 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Current Active Session</div>
                  <div className="font-bold text-white text-sm">{session.userName}</div>
                  <div className="text-xxs text-slate-400">{session.email}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Device Saved:</span>
                <span className="font-semibold text-emerald-400">{session.rememberDevice ? 'Yes (Always Unlocked)' : 'Temporary Session'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Default PIN:</span>
                <span className="font-mono text-amber-400 font-bold">4242</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Authorized:</span>
                <span className="text-slate-300">Mark Karlon & Paulo</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onLock}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/50 text-rose-200 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Lock Private Portal
              </button>
              <button
                type="button"
                onClick={onCloseManualModal}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Locked State Form */
          <form onSubmit={handleVerify} className="space-y-5">
            {/* User Profile Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Your Profile
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProfile('mark')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedProfile === 'mark'
                      ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Mark Karlon</span>
                    {selectedProfile === 'mark' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <div className="text-xxs text-slate-400">Master Contractor</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProfile('paulo')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedProfile === 'paulo'
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Paulo</span>
                    {selectedProfile === 'paulo' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="text-xxs text-slate-400">Admin & Marketing</div>
                </button>
              </div>
            </div>

            {/* PIN Entry */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Contractor PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPinHint(!showPinHint)}
                  className="text-xxs text-amber-400 hover:underline"
                >
                  {showPinHint ? 'Hide Hint' : 'What is the PIN?'}
                </button>
              </div>

              {showPinHint && (
                <div className="mb-2 p-2.5 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xxs text-amber-200 flex items-start gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    The master contractor PIN is <strong>4242</strong> (celebrating Mark&apos;s 42 years of Renew craftsmanship).
                  </span>
                </div>
              )}

              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (4242)"
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-xl tracking-[0.4em] font-mono text-white placeholder:text-slate-500 placeholder:text-xs placeholder:tracking-normal focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {/* Touch keypad for mobile phones */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickKeypad(num)}
                    className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-mono font-bold text-base transition-colors active:scale-95 cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPin('4242')}
                  className="py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-xs font-bold text-xxs transition-colors active:scale-95 cursor-pointer"
                >
                  Quick 4242
                </button>
                <button
                  key="0"
                  type="button"
                  onClick={() => handleQuickKeypad('0')}
                  className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-mono font-bold text-base transition-colors active:scale-95 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>

              {error && (
                <div className="mt-2.5 p-2 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Remember Phone Checkbox */}
            <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-colors">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Remember this phone (stay unlocked on home screen)</span>
              </div>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Unlocking...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Private Portal</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
