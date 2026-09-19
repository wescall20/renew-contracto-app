import React, { useState } from 'react';
import {
  Mail,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  Smartphone,
  CheckCircle2,
  Clock,
  Eye,
  MousePointer,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Campaign } from '../types';

interface CampaignsViewProps {
  campaigns: Campaign[];
  onOpenNewCampaign: () => void;
  onSendDrip: (campaignId: string, stageNumber: number) => Promise<void>;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  onOpenNewCampaign,
  onSendDrip
}) => {
  const [activeDripModal, setActiveDripModal] = useState<Campaign | null>(null);
  const [selectedStage, setSelectedStage] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const handleTriggerSend = async () => {
    if (!activeDripModal) return;
    setIsSending(true);
    setSendResult(null);
    try {
      await onSendDrip(activeDripModal.id, selectedStage);
      setSendResult(`Successfully dispatched Stage ${selectedStage} drip sequence!`);
      setTimeout(() => {
        setActiveDripModal(null);
        setSendResult(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSendResult('Failed to dispatch drip');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Drip Email & Advertising Message Campaigns
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Multi-Stage Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Deliver personalized New England contractor drip emails with customized advertising headlines, TCPA text approval invites, and direct links to the Renew walkthrough booking flow.
            </p>
          </div>

          <button
            id="btn-create-campaign"
            onClick={onOpenNewCampaign}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-rose-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map(camp => {
          const openRate = camp.stats.sent > 0 ? ((camp.stats.opened / camp.stats.sent) * 100).toFixed(1) : '0';
          const clickRate = camp.stats.sent > 0 ? ((camp.stats.clicked / camp.stats.sent) * 100).toFixed(1) : '0';

          return (
            <div
              key={camp.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                        {camp.targetCounty}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-medium">{camp.targetService}</span>
                    </div>
                    <h3 className="font-bold text-white text-lg tracking-tight mt-0.5">
                      {camp.name}
                    </h3>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    camp.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {camp.status.toUpperCase()}
                  </span>
                </div>

                {/* Advertising Message Box */}
                <div className="bg-gradient-to-r from-rose-950/30 via-slate-850 to-slate-900 border border-rose-800/30 rounded-xl p-3.5 space-y-1">
                  <div className="text-xxs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {camp.advertisingBadge}
                  </div>
                  <div className="text-sm font-bold text-white leading-snug">
                    "{camp.advertisingHeadline}"
                  </div>
                  <div className="text-xs text-rose-300 font-medium">
                    Offer: {camp.advertisingOffer}
                  </div>
                </div>

                {/* Drip Stages Timeline */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Sequence Stages ({camp.stages.length} Automated Steps)
                  </div>
                  <div className="space-y-2">
                    {camp.stages.map(stg => (
                      <div
                        key={stg.stage}
                        className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xxs flex items-center justify-center shrink-0">
                            {stg.stage}
                          </span>
                          <div>
                            <span className="font-medium text-slate-200 block truncate max-w-xs">
                              {stg.subject}
                            </span>
                            <span className="text-xxs text-slate-400">
                              Day {stg.delayDays} • {stg.callToAction}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xxs shrink-0">
                          {stg.includeTextApproval && (
                            <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                              SMS Opt-in
                            </span>
                          )}
                          {stg.includeOptOut && (
                            <span className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              CAN-SPAM
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Analytics Grid */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-xxs">Outreach Sent</div>
                    <div className="font-extrabold text-white text-sm mt-0.5">{camp.stats.sent}</div>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-xxs">Open Rate</div>
                    <div className="font-extrabold text-rose-400 text-sm mt-0.5">{openRate}%</div>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-xxs">Click Rate</div>
                    <div className="font-extrabold text-amber-400 text-sm mt-0.5">{clickRate}%</div>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-xxs">Renew Leads</div>
                    <div className="font-extrabold text-emerald-400 text-sm mt-0.5">{camp.stats.converted}</div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Target towns: <strong className="text-slate-300">{camp.targetTowns.slice(0, 3).join(', ')}</strong>
                  {camp.targetTowns.length > 3 && ` +${camp.targetTowns.length - 3} more`}
                </div>

                <button
                  id={`btn-send-drip-${camp.id}`}
                  onClick={() => setActiveDripModal(camp)}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Drip Stage
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drip Dispatch Trigger Modal */}
      {activeDripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-400" />
                Dispatch Drip Stage
              </h3>
              <button
                onClick={() => setActiveDripModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select which drip stage to deliver to eligible homeowner prospects enrolled in <strong className="text-white">{activeDripModal.name}</strong> ({activeDripModal.targetCounty}).
            </p>

            <div className="space-y-2 text-xs">
              {activeDripModal.stages.map(stg => (
                <label
                  key={stg.stage}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedStage === stg.stage
                      ? 'bg-rose-500/15 border-rose-500/50 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="stageSelect"
                    checked={selectedStage === stg.stage}
                    onChange={() => setSelectedStage(stg.stage)}
                    className="mt-0.5 text-rose-500"
                  />
                  <div>
                    <div className="font-bold">Stage {stg.stage}: {stg.title}</div>
                    <div className="text-slate-400 mt-0.5">"{stg.subject}"</div>
                  </div>
                </label>
              ))}
            </div>

            {sendResult && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {sendResult}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveDripModal(null)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-send-drip"
                onClick={handleTriggerSend}
                disabled={isSending}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending to Homeowners...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Stage {selectedStage} Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
