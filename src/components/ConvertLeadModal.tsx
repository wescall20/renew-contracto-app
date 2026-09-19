import React, { useState } from 'react';
import { X, ArrowRight, Calendar, Home, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { Prospect } from '../types';

interface ConvertLeadModalProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
  onConverted: (leadId: string, message: string) => void;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  prospect,
  isOpen,
  onClose,
  onConverted
}) => {
  const [preferredDate, setPreferredDate] = useState('Upcoming Tuesday (9:00 AM - 12:00 PM)');
  const [service, setService] = useState(prospect?.primaryOpportunity || 'Kitchen Remodel');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !prospect) return null;

  const handleConvert = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/convert-to-renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceLabel: service,
          preferredDate,
          notes: notes || `Homeowner agreed to contractor consultation. Text approval: ${prospect.textApprovalStatus}`
        })
      });
      const data = await res.json();
      if (data.success) {
        onConverted(data.leadId, data.message);
        onClose();
      }
    } catch (err) {
      console.error('Failed to convert to Renew lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Convert to Renew App Lead
              </h2>
              <p className="text-xs text-slate-400">
                Push verified homeowner into Mark Karlon's active contractor pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Prospect Summary Box */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">{prospect.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {prospect.town}, {prospect.state}
              </span>
            </div>
            <div className="text-slate-400">
              <div>📍 {prospect.address}</div>
              <div>✉️ {prospect.email} • 📞 {prospect.phone}</div>
              <div>🏡 Year Built {prospect.yearBuilt} • Est. Value ${prospect.estValue.toLocaleString()}</div>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-slate-300">
              <span>Text Approval Status:</span>
              <span className={`font-semibold ${
                prospect.textApprovalStatus === 'approved' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {prospect.textApprovalStatus === 'approved' ? '✓ TCPA Approved (SMS)' : 'Pending / Email Preferred'}
              </span>
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Renew Renovation Service
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Kitchen Remodel">Kitchen Remodel & Custom Cabinetry</option>
              <option value="Bathroom Remodel">Master / Guest Bathroom Remodel</option>
              <option value="Deck & Patio">Custom Composite / Cedar Deck</option>
              <option value="Room Addition">Sunroom / Second Story Addition</option>
              <option value="Exterior Renovation">Siding, Portico & Energy Windows</option>
            </select>
          </div>

          {/* Preferred Walkthrough Schedule */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Mark Karlon's In-Home Walkthrough Time
            </label>
            <input
              type="text"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              placeholder="e.g. Next Tuesday at 10:00 AM"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Notes for Mark */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contractor Pre-Inspection Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Homeowner wants open-concept layout, removing load-bearing wall between dining & kitchen."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Integration reassurance */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Generates a certified <strong className="text-emerald-300">RNW Lead Record</strong> with automated AI structural analysis, appearing instantly in the Renew Contractor Dashboard.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-convert-lead"
            type="button"
            onClick={handleConvert}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Pushed into Renew...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Convert to Renew App Lead
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
