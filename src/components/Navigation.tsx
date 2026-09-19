import React from 'react';
import { Users, Mail, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

export type TabType = 'prospects' | 'campaigns' | 'inbox' | 'pipeline';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    prospects: number;
    campaigns: number;
    unreadMessages: number;
    renewLeads: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  counts
}) => {
  const tabs = [
    {
      id: 'prospects' as TabType,
      label: 'Prospects',
      subtitle: 'Worcester & Tri-State Homeowners',
      icon: Users,
      badge: counts.prospects
    },
    {
      id: 'campaigns' as TabType,
      label: 'Campaigns',
      subtitle: 'Drip Sequences & Ads',
      icon: Mail,
      badge: counts.campaigns
    },
    {
      id: 'inbox' as TabType,
      label: 'Inbox / Replies',
      subtitle: 'SMS & Email Conversations',
      icon: MessageSquare,
      badge: counts.unreadMessages > 0 ? `${counts.unreadMessages} new` : undefined,
      badgeHighlight: counts.unreadMessages > 0
    },
    {
      id: 'pipeline' as TabType,
      label: 'Pipeline to Renew',
      subtitle: 'Contractor Acquisition Leads',
      icon: ArrowRight,
      badge: counts.renewLeads
    }
  ];

  return (
    <nav id="app-navigation" className="bg-slate-900/50 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          tab.badgeHighlight
                            ? 'bg-rose-500 text-white animate-pulse'
                            : isActive
                            ? 'bg-rose-500/30 text-rose-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
