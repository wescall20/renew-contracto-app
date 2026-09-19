import React, { useState } from 'react';
import { X, Sparkles, MapPin, CheckCircle2, Home, Search, Layers, Loader2 } from 'lucide-react';
import { Prospect } from '../types';

interface GoogleDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscovered: (prospects: Prospect[], message: string) => void;
  worcesterTowns: string[];
  triStateCounties: { name: string; state: string; towns: string[] }[];
}

export const GoogleDataModal: React.FC<GoogleDataModalProps> = ({
  isOpen,
  onClose,
  onDiscovered,
  worcesterTowns,
  triStateCounties
}) => {
  const [selectedCounty, setSelectedCounty] = useState('Worcester County, MA');
  const [selectedTown, setSelectedTown] = useState('Worcester');
  const [selectedService, setSelectedService] = useState('Kitchen Remodel');
  const [batchCount, setBatchCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [discoveredPreview, setDiscoveredPreview] = useState<Prospect[] | null>(null);

  if (!isOpen) return null;

  // Available towns based on selected county
  const currentTowns = selectedCounty === 'Worcester County, MA'
    ? worcesterTowns
    : triStateCounties.find(c => c.name.toLowerCase() === selectedCounty.toLowerCase())?.towns || ['Capital Area', 'Central'];

  const handleDiscover = async () => {
    setIsLoading(true);
    setDiscoveredPreview(null);
    try {
      const res = await fetch('/api/prospects/google-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          county: selectedCounty,
          town: selectedTown,
          service: selectedService,
          count: batchCount
        })
      });
      const data = await res.json();
      if (data.success && data.discovered) {
        setDiscoveredPreview(data.discovered);
        onDiscovered(data.discovered, data.message);
      }
    } catch (err) {
      console.error('Failed to discover prospects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google Data Homeowner Discovery
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Tri-State Geo Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Scan Worcester County and adjacent tri-state areas for verified residential property owners.
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target County / Region
              </label>
              <select
                id="select-discover-county"
                value={selectedCounty}
                onChange={(e) => {
                  setSelectedCounty(e.target.value);
                  if (e.target.value === 'Worcester County, MA') {
                    setSelectedTown('Worcester');
                  } else {
                    const found = triStateCounties.find(c => c.name === e.target.value);
                    if (found && found.towns.length > 0) setSelectedTown(found.towns[0]);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="Worcester County, MA">Worcester County, MA (Primary Hub)</option>
                {triStateCounties.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Specific Town / Municipality
              </label>
              <select
                id="select-discover-town"
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                {currentTowns.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Service & Batch Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Renovation Trade
              </label>
              <select
                id="select-discover-service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="Kitchen Remodel">Kitchen Remodel & Custom Cabinets</option>
                <option value="Bathroom Remodel">Master & Guest Bathroom Remodel</option>
                <option value="Deck & Patio">Custom TimberTech / Trex Decking</option>
                <option value="Room Addition">Sunroom / Second Story Addition</option>
                <option value="Exterior Renovation">Siding, Windows & Portico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Discovery Batch Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 8, 12, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBatchCount(num)}
                    className={`py-2 text-sm font-semibold rounded-xl border transition-all ${
                      batchCount === num
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {num} Leads
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enriched Discovery Criteria Details */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 text-xs space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Automated Google Data Enrichment Parameters:
            </div>
            <ul className="text-slate-400 space-y-1 list-disc list-inside">
              <li>Pulls single-family deeded homeowners in <span className="text-amber-300 font-medium">{selectedTown}</span> ({selectedCounty}).</li>
              <li>Calculates residential age criteria (1975–2010 builds) prime for {selectedService}.</li>
              <li>Applies TCPA text-approval placeholders ready for drip campaign enrollment.</li>
              <li>Auto-populates verified municipal parcel valuation ($320k–$850k).</li>
            </ul>
          </div>

          {/* Results Preview if discovered */}
          {discoveredPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Discovered {discoveredPreview.length} Homeowners in {selectedTown}!
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {discoveredPreview.map(p => (
                  <div key={p.id} className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-white">{p.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{p.address}, {p.town}</span>
                        <span>•</span>
                        <span className="text-amber-400">Est. ${p.estValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Enriched
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            {discoveredPreview ? 'Close & View In Prospects' : 'Cancel'}
          </button>
          <button
            id="btn-run-google-discovery"
            type="button"
            onClick={handleDiscover}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Querying Google Data...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Discover {batchCount} Homeowners Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
