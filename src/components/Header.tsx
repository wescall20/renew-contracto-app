import React from 'react';
import { ShieldCheck, ExternalLink, RefreshCw, Sparkles, MapPin, Lock, Github } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import type { AuthSession } from './PrivateGateModal';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenGoogleDiscover: () => void;
  onOpenGitHubLaunch: () => void;
  onOpenPrivateGate: () => void;
  session: AuthSession;
  stats: {
    totalProspects: number;
    textApproved: number;
    converted: number;
    activeDrip: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  onOpenGoogleDiscover,
  onOpenGitHubLaunch,
  onOpenPrivateGate,
  session,
  stats
}) => {
  return (
    <header id="app-header" className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold text-white tracking-wider text-lg shrink-0">
              <img src="/icon.svg" alt="Renew Icon" className="w-8 h-8 rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">RENEW</span>
                <span className="text-xxs sm:text-xs font-semibold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  Lead Engine
                </span>
                {/* Private Badge */}
                <button
                  onClick={onOpenPrivateGate}
                  className="hidden md:inline-flex items-center gap-1 text-xxs font-semibold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                  title="Private Portal Session - Click to manage lock or switch profile"
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>Private: {session.userName}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-xxs sm:text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Mark Karlon (42 Yrs)
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  Worcester & Tri-State
                </span>
              </div>
            </div>
          </div>

          {/* Key Metric Pills */}
          <div className="hidden xl:flex items-center gap-3 text-xs">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="text-slate-400">Prospects:</span>
              <span className="font-bold text-white">{stats.totalProspects}</span>
            </div>
            <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="text-amber-300">Text Approved:</span>
              <span className="font-bold text-amber-400">{stats.textApproved}</span>
            </div>
            <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="text-rose-300">Active Drips:</span>
              <span className="font-bold text-rose-400">{stats.activeDrip}</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="text-emerald-300">Renew Leads:</span>
              <span className="font-bold text-emerald-400">{stats.converted}</span>
            </div>
          </div>

          {/* Quick Actions & PWA Download Button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Phone Download PWA Button */}
            <PWAInstallButton />

            {/* Launch on GitHub Button */}
            <button
              id="btn-github-launch"
              type="button"
              onClick={onOpenGitHubLaunch}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-2.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
              title="Deploy to a private host via GitHub"
            >
              <Github className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Launch on Host</span>
            </button>

            {/* Google Discovery */}
            <button
              id="btn-google-discover-header"
              onClick={onOpenGoogleDiscover}
              className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-semibold px-2.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Find Worcester & Tri-State Homeowners"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Discover</span>
            </button>

            {/* Lock / Security Button */}
            <button
              id="btn-toggle-lock"
              onClick={onOpenPrivateGate}
              className="p-2 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50"
              title={`Private Access: ${session.userName}. Click to lock or switch.`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {/* Refresh */}
            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Renew Dashboard link */}
            <a
              id="link-renew-contractor-app"
              href="/renew/dashboard.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-2.5 py-2 rounded-xl transition-colors"
              title="Open Mark's Renew Contractor App"
            >
              <span>Renew App</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

