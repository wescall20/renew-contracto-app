import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, X, Share, PlusSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed standalone app on phone
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Installed on Phone</span>
      </div>
    );
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        id="btn-pwa-install"
        type="button"
        onClick={handleButtonClick}
        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-rose-500/10 transition-all active:scale-95 cursor-pointer"
        title="Download Renew App directly to your iPhone or Android phone"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Download to Phone</span>
      </button>

      {/* Phone Install Instructions Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center p-0.5 shadow-md">
                  <img src="/icon.svg" alt="Renew Icon" className="w-full h-full rounded-[10px]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Download to Your Phone</h3>
                  <p className="text-xs text-slate-400">Install Renew Contractor Portal as a native app</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Tabs / Instructions */}
            <div className="py-5 space-y-4">
              {/* iPhone / iPad Instructions */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    Apple iPhone & iPad (Safari)
                  </span>
                  <span className="text-xxs font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                    iOS PWA
                  </span>
                </div>

                <ol className="text-xs text-slate-300 space-y-2 pl-1 list-none">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 font-bold text-xxs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Open this page in <strong>Apple Safari</strong> browser on your iPhone.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 font-bold text-xxs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3 h-3 text-sky-400 inline" /> Share</strong> button in Safari's bottom toolbar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 font-bold text-xxs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Scroll down and tap <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 text-rose-400 inline" /> Add to Home Screen</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 font-bold text-xxs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Tap <strong>Add</strong> in the top-right. The Renew Portal app icon will appear on your phone screen!
                    </span>
                  </li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    Android Phone (Google Chrome)
                  </span>
                  <span className="text-xxs font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                    Android PWA
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-2">
                  {isInstallable ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await install();
                        setShowGuide(false);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Install to Android Now
                    </button>
                  ) : (
                    <p className="text-slate-400 text-xs">
                      Tap the Chrome <strong>three dots (⋮)</strong> menu in the upper right, then choose <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                    </p>
                  )}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl flex items-center gap-2.5 text-xxs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  Private Portal: Locked with your contractor passcode so only Mark Karlon and authorized team members have access from their mobile devices.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
