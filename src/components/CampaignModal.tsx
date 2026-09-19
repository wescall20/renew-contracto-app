import React, { useState } from 'react';
import { X, Sparkles, Mail, CheckCircle2, Clock, Smartphone, ShieldCheck, Loader2, Eye } from 'lucide-react';
import { Campaign, DripStage } from '../types';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaignData: Partial<Campaign>) => void;
  worcesterTowns: string[];
  triStateCounties: { name: string; state: string; towns: string[] }[];
}

export const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
  worcesterTowns,
  triStateCounties
}) => {
  const [name, setName] = useState('');
  const [targetCounty, setTargetCounty] = useState('Worcester County, MA');
  const [targetService, setTargetService] = useState('Kitchen Remodel');
  const [advertisingHeadline, setAdvertisingHeadline] = useState('Renew Home Improvement: 42 Years of Local New England Craftsmanship');
  const [advertisingOffer, setAdvertisingOffer] = useState('Complimentary In-Home Architectural Walkthrough & Consultation');
  const [advertisingBadge, setAdvertisingBadge] = useState('Mark Karlon - Licensed & Insured Contractor');
  const [activeTab, setActiveTab] = useState<'details' | 'stages' | 'preview'>('details');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [stages, setStages] = useState<DripStage[]>([
    {
      stage: 1,
      title: 'Personalized Contractor Introduction',
      delayDays: 0,
      subject: 'A personal note regarding your {{town}} home from Mark Karlon',
      previewText: 'Transform your living space with 42 years of trusted local craftsmanship.',
      body: `Hi {{name}},\n\nMy name is Mark Karlon, owner of Renew Home Improvement right here in Worcester County. For over 42 years, my team and I have personally crafted custom kitchens, additions, and historic restorations throughout New England.\n\nWould you be open to a casual, no-pressure in-home walkthrough to explore options for your {{address}} home?\n\nBest regards,\nMark Karlon\nRenew Home Improvement`,
      callToAction: 'Request Free Walkthrough',
      ctaUrl: '/renew/#walkthrough',
      includeTextApproval: true,
      includeOptOut: true
    },
    {
      stage: 2,
      title: 'Local Case Study & Material Quality',
      delayDays: 4,
      subject: 'How we saved a {{town}} family from a $14,000 contractor mistake',
      previewText: 'Real advice on avoiding permit delays and shoddy sub-contractors.',
      body: `Hi {{name}},\n\nWhen remodeling a New England home, the biggest risks are hidden structural surprises and high-pressure salesmen who hand your job off to inexperienced subs.\n\nAt Renew, I oversee your project on-site personally from first blueprint to final inspection.`,
      callToAction: 'View Recent Project Gallery',
      ctaUrl: '/renew/#portfolio',
      includeTextApproval: true,
      includeOptOut: true
    },
    {
      stage: 3,
      title: 'Walkthrough Reservation & Fast-Track SMS',
      delayDays: 8,
      subject: 'Visiting {{town}} next week — can I stop by?',
      previewText: 'Open dates for upcoming walkthroughs in {{town}}.',
      body: `Hi {{name}},\n\nI will be evaluating upcoming projects in {{town}} next week.\n\nIf you would like me to take a look at your {{address}} space, reply to this email, or reply YES to authorize fast text updates for direct scheduling with my cell phone.`,
      callToAction: 'Lock In Walkthrough Date',
      ctaUrl: '/renew/#walkthrough',
      includeTextApproval: true,
      includeOptOut: true
    }
  ]);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/campaigns/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCounty,
          service: targetService,
          towns: ['Worcester', 'Webster', 'Shrewsbury', 'Auburn'],
          season: 'Spring'
        })
      });
      const data = await res.json();
      if (data.advertisingHeadline) setAdvertisingHeadline(data.advertisingHeadline);
      if (data.advertisingOffer) setAdvertisingOffer(data.advertisingOffer);
      if (data.advertisingBadge) setAdvertisingBadge(data.advertisingBadge);
      if (Array.isArray(data.stages) && data.stages.length > 0) {
        setStages(data.stages);
      }
      if (!name) setName(`${targetService} Acquisition - ${targetCounty.split(',')[0]}`);
      setActiveTab('stages');
    } catch (err) {
      console.error('AI copy generation error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name,
      targetCounty,
      targetService,
      advertisingHeadline,
      advertisingOffer,
      advertisingBadge,
      stages
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Advertising & Drip Campaign</h2>
              <p className="text-xs text-slate-400">
                Design custom advertising messages, promotional offers, and a 3-step homeowner drip sequence.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Campaign & Advertising Message
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stages'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Drip Sequence Stages ({stages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Homeowner Email Preview
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* AI Auto-Writer Bar */}
              <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-transparent border border-amber-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Gemini 2.5 Flash Contractor Copywriter
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automatically draft New England contractor copy, local Worcester County angles, and TCPA text opt-in hooks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Writing Copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Copy with AI
                    </>
                  )}
                </button>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Worcester Spring Kitchen Drip 2026"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* County & Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target County / Region
                  </label>
                  <select
                    value={targetCounty}
                    onChange={(e) => setTargetCounty(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Worcester County, MA">Worcester County, MA</option>
                    {triStateCounties.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Renovation Trade
                  </label>
                  <select
                    value={targetService}
                    onChange={(e) => setTargetService(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Kitchen Remodel">Kitchen Remodel</option>
                    <option value="Bathroom Remodel">Bathroom Remodel</option>
                    <option value="Deck & Patio">Deck & Patio</option>
                    <option value="Room Addition">Room Addition</option>
                    <option value="Exterior Renovation">Exterior Renovation</option>
                  </select>
                </div>
              </div>

              {/* Advertising Message Settings */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Advertising Banner & Promotional Message
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Advertising Headline
                  </label>
                  <input
                    type="text"
                    value={advertisingHeadline}
                    onChange={(e) => setAdvertisingHeadline(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Promotional Offer / Incentive
                  </label>
                  <input
                    type="text"
                    value={advertisingOffer}
                    onChange={(e) => setAdvertisingOffer(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Contractor Trust Badge
                  </label>
                  <input
                    type="text"
                    value={advertisingBadge}
                    onChange={(e) => setAdvertisingBadge(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="space-y-6">
              {stages.map((stage, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">
                        {stage.stage}
                      </span>
                      {stage.title}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Day {stage.delayDays}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={stage.subject}
                      onChange={(e) => {
                        const next = [...stages];
                        next[idx].subject = e.target.value;
                        setStages(next);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Body (supports {"{{name}}"}, {"{{town}}"}, {"{{address}}"})</label>
                    <textarea
                      rows={4}
                      value={stage.body}
                      onChange={(e) => {
                        const next = [...stages];
                        next[idx].body = e.target.value;
                        setStages(next);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs pt-1">
                    <label className="flex items-center gap-2 text-amber-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.includeTextApproval}
                        onChange={(e) => {
                          const next = [...stages];
                          next[idx].includeTextApproval = e.target.checked;
                          setStages(next);
                        }}
                        className="rounded bg-slate-900 border-slate-700"
                      />
                      Include TCPA Text Approval Option
                    </label>

                    <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stage.includeOptOut}
                        onChange={(e) => {
                          const next = [...stages];
                          next[idx].includeOptOut = e.target.checked;
                          setStages(next);
                        }}
                        className="rounded bg-slate-900 border-slate-700"
                      />
                      Include CAN-SPAM Opt Out Link
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-xl mx-auto shadow-inner">
              {/* Simulated Email Client Frame */}
              <div className="border-b border-slate-800 pb-3 text-xs text-slate-400 space-y-1">
                <div>From: <strong className="text-white">Mark Karlon &lt;mark@renewhomecontractor.com&gt;</strong></div>
                <div>To: <strong className="text-white">David & Sarah Miller &lt;david.miller@worcester.net&gt;</strong></div>
                <div>Subject: <strong className="text-white">{stages[0]?.subject.replace('{{town}}', 'Shrewsbury')}</strong></div>
              </div>

              {/* Advertising Top Banner */}
              <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900 border border-rose-800/40 rounded-xl p-4 text-center">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  {advertisingBadge}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  {advertisingHeadline}
                </h4>
                <p className="text-xs text-rose-300 mt-0.5">
                  ⭐ Special Incentive: {advertisingOffer}
                </p>
              </div>

              {/* Email Body */}
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {stages[0]?.body
                  .replace('{{name}}', 'David & Sarah')
                  .replace('{{address}}', '48 Meadow Lane')
                  .replace('{{town}}', 'Shrewsbury')}
              </div>

              {/* Call to Action Button */}
              <div className="text-center pt-2">
                <div className="inline-block bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md">
                  {stages[0]?.callToAction}
                </div>
              </div>

              {/* TCPA Text Approval Box */}
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 text-center text-xs space-y-1">
                <div className="font-semibold text-amber-300 flex items-center justify-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Prefer Fast Text Updates with Mark Karlon?
                </div>
                <p className="text-slate-400 text-xxs">
                  Click to authorize SMS for direct walkthrough confirmation. Standard rates apply.
                </p>
              </div>

              {/* CAN-SPAM Footer */}
              <div className="text-center pt-3 border-t border-slate-900 text-xxs text-slate-500">
                Renew Home Improvement • Webster, MA 01570 • (508) 555-0182<br />
                <span className="text-slate-400 underline cursor-pointer">Click here to opt out from future communications</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save & Deploy Campaign
          </button>
        </div>
      </div>
    </div>
  );
};
