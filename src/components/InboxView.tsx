import React, { useState } from 'react';
import {
  MessageSquare,
  Mail,
  Smartphone,
  Send,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Loader2,
  User
} from 'lucide-react';
import { InboxMessage, Prospect } from '../types';

interface InboxViewProps {
  messages: InboxMessage[];
  prospects: Prospect[];
  onSendReply: (prospectId: string, content: string, channel: 'email' | 'sms') => Promise<void>;
  onConvertProspect: (prospect: Prospect) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  messages,
  prospects,
  onSendReply,
  onConvertProspect
}) => {
  // Group messages by prospect
  const prospectMap = new Map<string, Prospect>();
  prospects.forEach(p => prospectMap.set(p.id, p));

  // Find unique prospectIds from messages
  const prospectIds = Array.from(new Set(messages.map(m => m.prospectId)));
  const [selectedProspectId, setSelectedProspectId] = useState<string>(prospectIds[0] || '');
  const [replyText, setReplyText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'email'>('sms');
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Messages for active thread
  const threadMessages = messages
    .filter(m => m.prospectId === selectedProspectId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const activeProspect = prospectMap.get(selectedProspectId);

  const handleGenerateAIDraft = async () => {
    if (!activeProspect) return;
    setIsDraftingAI(true);
    const lastInbound = threadMessages
      .slice()
      .reverse()
      .find(m => m.direction === 'inbound');

    try {
      const res = await fetch('/api/inbox/generate-ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: activeProspect.name,
          prospectTown: activeProspect.town,
          incomingMessage: lastInbound ? lastInbound.content : 'Homeowner inquiring about home remodeling estimate',
          channel: selectedChannel
        })
      });
      const data = await res.json();
      if (data.replyText) {
        setReplyText(data.replyText);
      }
    } catch (err) {
      console.error('Failed to generate reply:', err);
    } finally {
      setIsDraftingAI(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedProspectId) return;
    setIsSending(true);
    try {
      await onSendReply(selectedProspectId, replyText, selectedChannel);
      setReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row h-[750px]">
      {/* Left Sidebar: Conversation List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-900/60">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-white">Homeowner Replies</h3>
          </div>
          <span className="text-xxs font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
            {prospectIds.length} Conversations
          </span>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
          {prospectIds.map(pId => {
            const p = prospectMap.get(pId);
            const pMsgs = messages.filter(m => m.prospectId === pId);
            const lastMsg = pMsgs[0]; // sorted desc
            const isSelected = selectedProspectId === pId;

            return (
              <button
                key={pId}
                onClick={() => {
                  setSelectedProspectId(pId);
                  if (p?.textApprovalStatus === 'approved') setSelectedChannel('sms');
                  else setSelectedChannel('email');
                }}
                className={`w-full text-left p-4 transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-rose-500/10 border-l-2 border-rose-500'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white truncate max-w-[140px]">
                    {p ? p.name : (lastMsg?.prospectName || 'Homeowner')}
                  </span>
                  <span className="text-xxs text-slate-400">
                    {lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xxs text-slate-400">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{p?.town || 'Worcester'}, {p?.state || 'MA'}</span>
                  <span>•</span>
                  <span className={`capitalize ${lastMsg?.channel === 'sms' ? 'text-amber-400' : 'text-slate-300'}`}>
                    {lastMsg?.channel.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-1">
                  {lastMsg?.content}
                </p>

                {p?.textApprovalStatus === 'approved' && (
                  <span className="inline-flex items-center gap-1 text-xxs text-emerald-400 font-semibold mt-0.5">
                    <Smartphone className="w-2.5 h-2.5" />
                    Text Approved
                  </span>
                )}
              </button>
            );
          })}

          {prospectIds.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No replies received yet. Dispatch a drip campaign to initiate conversations!
            </div>
          )}
        </div>
      </div>

      {/* Right Content: Active Conversation Thread */}
      {selectedProspectId && activeProspect ? (
        <div className="flex-1 flex flex-col bg-slate-950/50">
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{activeProspect.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {activeProspect.primaryOpportunity}
                </span>
                {activeProspect.textApprovalStatus === 'approved' ? (
                  <span className="text-xxs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <Smartphone className="w-2.5 h-2.5" />
                    SMS Verified
                  </span>
                ) : (
                  <span className="text-xxs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    Email Only
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                📍 {activeProspect.address}, {activeProspect.town} • Year Built: {activeProspect.yearBuilt} • Est. Value: ${activeProspect.estValue.toLocaleString()}
              </div>
            </div>

            {/* Quick Action: Convert to Renew Lead */}
            {activeProspect.status !== 'converted' ? (
              <button
                onClick={() => onConvertProspect(activeProspect)}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer shrink-0"
              >
                <span>Convert to Renew Lead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Renew Lead #{activeProspect.leadId}
              </span>
            )}
          </div>

          {/* Message History Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {threadMessages.map(msg => {
              const isOutbound = msg.direction === 'outbound';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 text-xxs text-slate-400 mb-1 px-1">
                    <span className="font-semibold text-slate-300">
                      {isOutbound ? 'Renew Contractor (Mark Karlon)' : msg.prospectName}
                    </span>
                    <span>•</span>
                    <span className="uppercase text-amber-400/90">{msg.channel}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                      isOutbound
                        ? 'bg-rose-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Macros & AI Assistant Bar */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold">
                Contractor Quick Responses:
              </span>
              <button
                type="button"
                onClick={() => setReplyText(`Hi ${activeProspect.name}, Mark Karlon here. I will be in ${activeProspect.town} next Tuesday morning. Would you like me to stop by for a quick 20-minute walkthrough?`)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xxs px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                📅 Tuesday Walkthrough
              </button>
              <button
                type="button"
                onClick={() => setReplyText(`Hi ${activeProspect.name}, absolutely. We just completed a beautiful ${activeProspect.primaryOpportunity.toLowerCase()} near ${activeProspect.town}. You can see our photos at renewhomecontractor.com.`)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xxs px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                📸 Share Work Gallery
              </button>
            </div>

            <button
              type="button"
              onClick={handleGenerateAIDraft}
              disabled={isDraftingAI}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isDraftingAI ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Drafting with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Contractor Draft (Mark Karlon)
                </>
              )}
            </button>
          </div>

          {/* Reply Box Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold">Send via:</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="replyChannel"
                    value="sms"
                    checked={selectedChannel === 'sms'}
                    onChange={() => setSelectedChannel('sms')}
                    className="text-rose-500"
                  />
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  SMS Text Message
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="replyChannel"
                    value="email"
                    checked={selectedChannel === 'email'}
                    onChange={() => setSelectedChannel('email')}
                    className="text-rose-500"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Message
                </label>
              </div>

              {selectedChannel === 'sms' && activeProspect.textApprovalStatus !== 'approved' && (
                <span className="text-xxs text-amber-400">
                  ⚠️ Homeowner has not yet confirmed TCPA text opt-in.
                </span>
              )}
            </div>

            <div className="flex items-end gap-3">
              <textarea
                id="input-inbox-reply"
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Type your response to ${activeProspect.name} as Mark Karlon...`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />
              <button
                id="btn-send-inbox-reply"
                type="submit"
                disabled={isSending || !replyText.trim()}
                className="bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
          <h3 className="font-bold text-white text-base">Select a conversation</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Choose a homeowner from the left to read their inquiry, draft an AI response from Mark Karlon, or convert to a Renew lead.
          </p>
        </div>
      )}
    </div>
  );
};
