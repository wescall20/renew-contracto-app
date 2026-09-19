/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { ProspectsView } from './components/ProspectsView';
import { CampaignsView } from './components/CampaignsView';
import { InboxView } from './components/InboxView';
import { PipelineView } from './components/PipelineView';
import { GoogleDataModal } from './components/GoogleDataModal';
import { ConvertLeadModal } from './components/ConvertLeadModal';
import { CampaignModal } from './components/CampaignModal';
import { PrivateGateModal, AuthSession } from './components/PrivateGateModal';
import { GitHubLaunchModal } from './components/GitHubLaunchModal';
import { Prospect, Campaign, InboxMessage, PipelineData } from './types';
import { CheckCircle2, AlertCircle, Info, X, Github, Smartphone, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('prospects');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);

  // Private Session & Gate State for Mark Karlon & Paulo
  const [authSession, setAuthSession] = useState<AuthSession>(() => {
    try {
      const saved = localStorage.getItem('renew_auth_session') || sessionStorage.getItem('renew_auth_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      isUnlocked: true,
      currentUser: 'mark',
      userName: 'Mark Karlon',
      email: 'markkarlon@yahoo.com',
      rememberDevice: true,
      unlockedAt: new Date().toISOString()
    };
  });
  const [isPrivateGateSettingsOpen, setIsPrivateGateSettingsOpen] = useState(false);
  const [isGitHubLaunchOpen, setIsGitHubLaunchOpen] = useState(false);

  // Geographic metadata
  const [worcesterTowns, setWorcesterTowns] = useState<string[]>([
    'Worcester', 'Webster', 'Auburn', 'Shrewsbury', 'Holden', 'Millbury',
    'Grafton', 'Northborough', 'Westborough', 'Oxford', 'Charlton', 'Dudley',
    'Sturbridge', 'Southbridge', 'Spencer', 'Leicester', 'Milford', 'Fitchburg', 'Leominster'
  ]);
  const [triStateCounties, setTriStateCounties] = useState<{ name: string; state: string; towns: string[] }[]>([
    { name: 'Windham County, CT', state: 'CT', towns: ['Putnam', 'Thompson', 'Woodstock', 'Killingly'] },
    { name: 'Providence County, RI', state: 'RI', towns: ['Woonsocket', 'Burrillville', 'Cumberland'] },
    { name: 'Middlesex County, MA', state: 'MA', towns: ['Marlborough', 'Framingham', 'Hopkinton'] },
    { name: 'Norfolk County, MA', state: 'MA', towns: ['Bellingham', 'Franklin', 'Medway'] }
  ]);

  // Modals state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [convertTarget, setConvertTarget] = useState<Prospect | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notifications Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load all initial data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [pRes, cRes, iRes, pipeRes, geoRes] = await Promise.all([
        fetch('/api/prospects'),
        fetch('/api/campaigns'),
        fetch('/api/inbox'),
        fetch('/api/pipeline'),
        fetch('/api/tri-state-info')
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        setProspects(pData.prospects || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCampaigns(cData.campaigns || []);
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        setInboxMessages(iData.messages || []);
      }
      if (pipeRes.ok) {
        const pipeData = await pipeRes.json();
        setPipeline(pipeData);
      }
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.worcesterTowns) setWorcesterTowns(geoData.worcesterTowns);
        if (geoData.counties) setTriStateCounties(geoData.counties);
      }
    } catch (err) {
      console.error('Error fetching marketing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleApproveText = async (prospectId: string) => {
    try {
      const res = await fetch(`/api/prospects/${prospectId}/approve-text`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setProspects(prev => prev.map(p => p.id === prospectId ? data.prospect : p));
        showToast(`TCPA text messaging approved for ${data.prospect.name}. Automated confirmation SMS logged.`, 'success');
        loadData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to approve text messaging', 'error');
    }
  };

  const handleOptOut = async (prospectId: string) => {
    try {
      const res = await fetch(`/api/prospects/${prospectId}/opt-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Homeowner requested suppression in outreach dashboard' })
      });
      const data = await res.json();
      if (data.success) {
        setProspects(prev => prev.map(p => p.id === prospectId ? data.prospect : p));
        showToast(`${data.prospect.name} opted out under CAN-SPAM rules and suppressed from all drips.`, 'info');
        loadData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to opt out prospect', 'error');
    }
  };

  const handleAddManualProspect = async (raw: Partial<Prospect>) => {
    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raw)
      });
      if (res.ok) {
        const newP = await res.json();
        setProspects(prev => [newP, ...prev]);
        showToast(`Added homeowner prospect: ${newP.name} (${newP.town})`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to add prospect', 'error');
    }
  };

  const handleCreateCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });
      if (res.ok) {
        const newC = await res.json();
        setCampaigns(prev => [newC, ...prev]);
        showToast(`Campaign "${newC.name}" created and ready for drip dispatch!`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to create campaign', 'error');
    }
  };

  const handleSendDrip = async (campaignId: string, stageNumber: number) => {
    const res = await fetch(`/api/campaigns/${campaignId}/send-drip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageNumber })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadData();
    }
  };

  const handleSendReply = async (prospectId: string, content: string, channel: 'email' | 'sms') => {
    const res = await fetch('/api/inbox/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospectId, content, channel })
    });
    if (res.ok) {
      const newMsg = await res.json();
      setInboxMessages(prev => [newMsg, ...prev]);
      showToast(`Reply sent to homeowner via ${channel.toUpperCase()}!`, 'success');
    }
  };

  // Header quick stats
  const headerStats = {
    totalProspects: prospects.length,
    textApproved: prospects.filter(p => p.textApprovalStatus === 'approved').length,
    converted: prospects.filter(p => p.status === 'converted').length,
    activeDrip: prospects.filter(p => p.status === 'drip_active' || p.dripStage > 0).length
  };

  const navCounts = {
    prospects: prospects.length,
    campaigns: campaigns.length,
    unreadMessages: inboxMessages.filter(m => !m.read).length,
    renewLeads: pipeline?.totalRenewLeads || prospects.filter(p => p.status === 'converted').length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        onOpenGoogleDiscover={() => setIsGoogleModalOpen(true)}
        onOpenGitHubLaunch={() => setIsGitHubLaunchOpen(true)}
        onOpenPrivateGate={() => setIsPrivateGateSettingsOpen(true)}
        session={authSession}
        stats={headerStats}
      />

      {/* Direct Railway Deployment & Zip Download Banner */}
      <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-3 text-xs text-emerald-100">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-950 bg-emerald-400 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">Ready for GitHub</span>
            <span className="text-emerald-200">
              Fresh package containing all code, server, and verified lockfiles for Railway/GitHub deployment.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/download-zip"
              download="renew-contractor-app.zip"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded shadow transition-all cursor-pointer"
            >
              <span>📥 Download renew-contractor-app.zip</span>
            </a>
            <a
              href="/api/download-bun-lock"
              download="bun.lock"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded text-xs transition-colors cursor-pointer"
            >
              <span>bun.lock only</span>
            </a>
          </div>
        </div>
      </div>

      {/* Private Launch & Host Callout Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Private Host & Phone Ready:</span>
            <span className="text-slate-400 hidden sm:inline">
              Launch via private GitHub repo onto Render/Railway &amp; install directly to Mark &amp; Paulo&apos;s iPhones/Androids.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGitHubLaunchOpen(true)}
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Launch Guide</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsPrivateGateSettingsOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{authSession.isUnlocked ? `Session: ${authSession.userName}` : 'Locked'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={navCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prospects' && (
          <ProspectsView
            prospects={prospects}
            onOpenGoogleDiscover={() => setIsGoogleModalOpen(true)}
            onApproveText={handleApproveText}
            onOptOut={handleOptOut}
            onConvert={(p) => setConvertTarget(p)}
            worcesterTowns={worcesterTowns}
            triStateCounties={triStateCounties}
            onAddManualProspect={handleAddManualProspect}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsView
            campaigns={campaigns}
            onOpenNewCampaign={() => setIsCampaignModalOpen(true)}
            onSendDrip={handleSendDrip}
          />
        )}

        {activeTab === 'inbox' && (
          <InboxView
            messages={inboxMessages}
            prospects={prospects}
            onSendReply={handleSendReply}
            onConvertProspect={(p) => setConvertTarget(p)}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineView
            pipeline={pipeline}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Google Data Homeowner Discovery Modal */}
      <GoogleDataModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onDiscovered={(newProspects, msg) => {
          showToast(msg, 'success');
          setProspects(prev => [...newProspects, ...prev]);
          loadData();
        }}
        worcesterTowns={worcesterTowns}
        triStateCounties={triStateCounties}
      />

      {/* Convert to Renew Lead Modal */}
      <ConvertLeadModal
        prospect={convertTarget}
        isOpen={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        onConverted={(leadId, message) => {
          showToast(message, 'success');
          loadData();
        }}
      />

      {/* Create Campaign Modal */}
      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSave={handleCreateCampaign}
        worcesterTowns={worcesterTowns}
        triStateCounties={triStateCounties}
      />

      {/* Private Security Gate Modal */}
      <PrivateGateModal
        session={authSession}
        isOpenManualModal={isPrivateGateSettingsOpen}
        onCloseManualModal={() => setIsPrivateGateSettingsOpen(false)}
        onUnlock={(newSession) => {
          setAuthSession(newSession);
          showToast(`Unlocked as ${newSession.userName}. Welcome back!`, 'success');
        }}
        onLock={() => {
          const locked: AuthSession = { ...authSession, isUnlocked: false };
          setAuthSession(locked);
          localStorage.removeItem('renew_auth_session');
          sessionStorage.removeItem('renew_auth_session');
          setIsPrivateGateSettingsOpen(false);
          showToast('Private portal locked. Enter PIN to access.', 'info');
        }}
      />

      {/* GitHub Launch & Host Deployment Guide Modal */}
      <GitHubLaunchModal
        isOpen={isGitHubLaunchOpen}
        onClose={() => setIsGitHubLaunchOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Renew Home Improvement Marketing & Lead Acquisition Engine • Mark Karlon (42 Yrs Experience)
          </div>
          <div className="text-slate-600">
            Compliant with TCPA SMS Consent & CAN-SPAM Act Outreach Guidelines
          </div>
        </div>
      </footer>
    </div>
  );
}
