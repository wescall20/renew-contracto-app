import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  MapPin,
  Home,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  Mail,
  DollarSign
} from 'lucide-react';
import { Prospect } from '../types';

interface ProspectsViewProps {
  prospects: Prospect[];
  onOpenGoogleDiscover: () => void;
  onApproveText: (prospectId: string) => void;
  onOptOut: (prospectId: string) => void;
  onConvert: (prospect: Prospect) => void;
  worcesterTowns: string[];
  triStateCounties: { name: string; state: string; towns: string[] }[];
  onAddManualProspect: (prospectData: Partial<Prospect>) => void;
}

export const ProspectsView: React.FC<ProspectsViewProps> = ({
  prospects,
  onOpenGoogleDiscover,
  onApproveText,
  onOptOut,
  onConvert,
  worcesterTowns,
  triStateCounties,
  onAddManualProspect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('all');
  const [selectedTown, setSelectedTown] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for manual add
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTown, setNewTown] = useState('Worcester');
  const [newOpportunity, setNewOpportunity] = useState('Kitchen Remodel');

  // Filtered prospects
  const filtered = prospects.filter(p => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.town.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCounty =
      selectedCounty === 'all' ||
      p.county.toLowerCase().includes(selectedCounty.toLowerCase().split(' ')[0]);

    const matchesTown =
      selectedTown === 'all' ||
      p.town.toLowerCase() === selectedTown.toLowerCase();

    const matchesStatus =
      selectedStatus === 'all' ||
      p.status === selectedStatus;

    const matchesOpportunity =
      selectedOpportunity === 'all' ||
      p.primaryOpportunity.toLowerCase() === selectedOpportunity.toLowerCase();

    return matchesSearch && matchesCounty && matchesTown && matchesStatus && matchesOpportunity;
  });

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    onAddManualProspect({
      name: newName,
      email: newEmail,
      phone: newPhone,
      address: newAddress,
      town: newTown,
      primaryOpportunity: newOpportunity
    });
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Geographic Scope & Quick Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Worcester County & Tri-State Homeowner Prospects
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Google Data Enriched
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Targeted residential property database for Renew Home Improvement. Contact local homeowners with drip messaging, capture TCPA text approvals, respect opt-outs, and convert qualified leads into the Renew app.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              id="btn-open-google-discover"
              onClick={onOpenGoogleDiscover}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer w-full md:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              Discover from Google Data
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Homeowner
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              id="input-prospects-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, street, town..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* County Filter */}
          <div>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Counties (Tri-State Area)</option>
              <option value="worcester">Worcester County, MA</option>
              <option value="windham">Windham County, CT</option>
              <option value="providence">Providence County, RI</option>
              <option value="middlesex">Middlesex County, MA</option>
              <option value="norfolk">Norfolk County, MA</option>
            </select>
          </div>

          {/* Town Filter */}
          <div>
            <select
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Municipalities</option>
              {worcesterTowns.map(t => (
                <option key={t} value={t}>{t}, MA</option>
              ))}
            </select>
          </div>

          {/* Opportunity Filter */}
          <div>
            <select
              value={selectedOpportunity}
              onChange={(e) => setSelectedOpportunity(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Remodeling Trades</option>
              <option value="kitchen remodel">Kitchen Remodel</option>
              <option value="bathroom remodel">Bathroom Remodel</option>
              <option value="deck & patio">Deck & Patio</option>
              <option value="room addition">Room Addition</option>
              <option value="exterior renovation">Exterior / Siding</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Outreach Statuses</option>
              <option value="new">New (Uncontacted)</option>
              <option value="drip_active">Drip Contact Active</option>
              <option value="text_approved">Text Approved (SMS)</option>
              <option value="converted">Converted to Renew Lead</option>
              <option value="opted_out">Opted Out (CAN-SPAM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prospects Counter Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filtered.length}</strong> of{' '}
          <strong className="text-white">{prospects.length}</strong> homeowner prospects
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Text Approved: {prospects.filter(p => p.textApprovalStatus === 'approved').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Renew Leads: {prospects.filter(p => p.status === 'converted').length}
          </span>
        </div>
      </div>

      {/* Prospects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const isConverted = p.status === 'converted';
          const isOptedOut = p.optOutStatus || p.status === 'opted_out';
          const isTextApproved = p.textApprovalStatus === 'approved';

          return (
            <div
              key={p.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-slate-600/80 shadow-sm ${
                isConverted
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : isOptedOut
                  ? 'border-rose-900/30 opacity-70 bg-slate-950/60'
                  : isTextApproved
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header: Name & Opportunity Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base tracking-tight">{p.name}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{p.address}, {p.town}, {p.state}</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                    {p.primaryOpportunity}
                  </span>
                </div>

                {/* Property Details */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">
                    <div>Year Built: <strong className="text-slate-200">{p.yearBuilt}</strong></div>
                    <div>County: <strong className="text-slate-200">{p.county.split(',')[0]}</strong></div>
                  </div>
                  <div className="text-slate-400 text-right">
                    <div>Est. Value: <strong className="text-amber-400">${p.estValue.toLocaleString()}</strong></div>
                    <div>Score: <strong className="text-emerald-400">{p.engagementScore}/100</strong></div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{p.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{p.phone || 'No phone recorded'}</span>
                  </div>
                </div>

                {/* Outreach & Compliance Status */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isConverted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" />
                        Renew App Lead
                      </span>
                    ) : isOptedOut ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/40 border border-rose-800/50 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3 h-3" />
                        Opted Out
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Drip: <strong className="text-slate-200">{p.dripStage > 0 ? `Stage ${p.dripStage}` : 'Not started'}</strong>
                      </span>
                    )}
                  </div>

                  {/* Text approval badge */}
                  <div>
                    {isTextApproved ? (
                      <span className="text-amber-300 font-semibold bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-amber-400" />
                        Text Approved
                      </span>
                    ) : (
                      <span className="text-slate-500">Text: Pending</span>
                    )}
                  </div>
                </div>

                {/* Notes snippet if any */}
                {p.notes && (
                  <p className="mt-2 text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 line-clamp-2">
                    "{p.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                {!isOptedOut && (
                  <>
                    {!isTextApproved && (
                      <button
                        onClick={() => onApproveText(p.id)}
                        className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors cursor-pointer"
                        title="TCPA Text Approval"
                      >
                        Approve Text
                      </button>
                    )}

                    {!isConverted ? (
                      <button
                        onClick={() => onConvert(p)}
                        className="flex-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Convert to Lead</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium px-2 py-1">
                        ID: {p.leadId || 'Synced'}
                      </span>
                    )}

                    <button
                      onClick={() => onOptOut(p.id)}
                      className="text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 p-1.5 rounded-lg transition-colors"
                      title="CAN-SPAM Opt Out"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {isOptedOut && (
                  <div className="w-full text-center text-xs text-rose-400/80 italic py-1">
                    Suppressed from automated outreach (CAN-SPAM)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No prospects match your current criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or use the Google Data Discovery engine to fetch verified homeowners.
          </p>
          <button
            onClick={onOpenGoogleDiscover}
            className="mt-4 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Discover Homeowners in Worcester County
          </button>
        </div>
      )}

      {/* Manual Add Homeowner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add Homeowner Prospect</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Homeowner Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Michael & Karen Higgins"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(508) 555-0199"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="144 Highland St"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Town</label>
                  <select
                    value={newTown}
                    onChange={(e) => setNewTown(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {worcesterTowns.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remodeling Opportunity</label>
                <select
                  value={newOpportunity}
                  onChange={(e) => setNewOpportunity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Kitchen Remodel">Kitchen Remodel</option>
                  <option value="Bathroom Remodel">Bathroom Remodel</option>
                  <option value="Deck & Patio">Deck & Patio</option>
                  <option value="Room Addition">Room Addition</option>
                  <option value="Exterior Renovation">Exterior Renovation</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl"
                >
                  Save Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
