import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  UserCheck,
  Clock,
  Home
} from 'lucide-react';
import { PipelineData } from '../types';

interface PipelineViewProps {
  pipeline: PipelineData | null;
  onRefresh: () => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  pipeline,
  onRefresh
}) => {
  if (!pipeline) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading customer acquisition pipeline...
      </div>
    );
  }

  const { pipelineStages, totalProspects, totalRenewLeads, leads, conversionRate } = pipeline;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Customer Acquisition Pipeline to Renew App
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              End-to-end conversion track from initial Worcester County & Tri-State homeowner discovery through drip outreach, text approval, and synchronized Renew App contractor lead records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              id="link-open-renew-dashboard"
              href="/renew/dashboard.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>Open Mark's Renew Dashboard</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Funnel Stages Visual Track */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pipelineStages.map((stage, idx) => {
            const isLast = idx === pipelineStages.length - 1;
            return (
              <div
                key={stage.id}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-300">Step {idx + 1}</span>
                  {!isLast && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>

                <div className="my-3">
                  <div className="text-2xl font-extrabold text-white tracking-tight">
                    {stage.count}
                  </div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">
                    {stage.label}
                  </div>
                </div>

                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                    style={{
                      width: `${Math.min(100, (stage.count / Math.max(1, totalProspects)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion Rate & Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Prospect-to-Lead Conversion</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{conversionRate}%</div>
            <div className="text-xxs text-emerald-400 font-medium">Industry Benchmark: 1.8%</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Avg Prospect Home Valuation</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">$485,000</div>
            <div className="text-xxs text-slate-400">Worcester & Tri-State parcels</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Master Contractor Authorization</div>
            <div className="text-base font-bold text-white mt-0.5">Mark Karlon (42 Yrs)</div>
            <div className="text-xxs text-slate-400">Licensed New England Builder</div>
          </div>
        </div>
      </div>

      {/* Active Converted Leads in Renew Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Synchronized Renew App Contractor Leads ({leads.length})
            </h3>
            <p className="text-xs text-slate-400">
              Verified leads generated from marketing drip conversion with Gemini structural analysis.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            Refresh Leads
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {leads.map(lead => (
            <div
              key={lead.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xxs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      {lead.leadId}
                    </span>
                    <h4 className="font-bold text-white text-base mt-1">
                      {lead.customer.name}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {lead.project.serviceLabel}
                  </span>
                </div>

                {/* Location & Property */}
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{lead.property.address1}, {lead.property.city}, {lead.property.state}</span>
                </div>

                {/* Walkthrough Scheduling */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    Walkthrough Time:
                  </div>
                  <div className="text-slate-200">
                    {lead.walkthrough?.preferredDate || 'Upcoming Tuesday'}
                  </div>
                  <div className="text-xxs text-slate-400">
                    {lead.walkthrough?.preferredTime || 'Morning (9:00 AM - 12:00 PM)'}
                  </div>
                </div>

                {/* Project Scope & Budget */}
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Budget Estimate: <strong className="text-emerald-400">{lead.project.budget}</strong></div>
                  <div>Timeline: <strong className="text-slate-200">{lead.project.timeline}</strong></div>
                </div>

                {/* AI Executive Summary snippet */}
                {lead.ai?.executiveSummary && (
                  <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl text-xxs text-slate-400 italic">
                    <div className="font-bold text-amber-400/90 not-italic mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Gemini Scope Analysis:
                    </div>
                    "{lead.ai.executiveSummary}"
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xxs text-slate-500">
                  Submitted {new Date(lead.submittedAt).toLocaleDateString()}
                </span>

                <a
                  href="/renew/dashboard.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  <span>View in Renew</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {leads.length === 0 && (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400 text-xs">
            No leads converted yet. Go to the <strong className="text-white">Prospects</strong> or <strong className="text-white">Inbox</strong> tab and click "Convert to Renew Lead" to sync your first homeowner!
          </div>
        )}
      </div>
    </div>
  );
};
