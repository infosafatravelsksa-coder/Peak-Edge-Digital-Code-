import React, { useState } from 'react';
import { BriefSubmissionRecord } from '../types/cms';
import { updateBriefStatus, deleteBriefSubmission } from '../services/cmsService';
import { Inbox, Trash2, Mail, Building, DollarSign, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface Phase4BriefsTabProps {
  briefs: BriefSubmissionRecord[];
  onRefresh: () => void;
  showNotice: (type: 'success' | 'error', message: string) => void;
}

export const Phase4BriefsTab: React.FC<Phase4BriefsTabProps> = ({ briefs, onRefresh, showNotice }) => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = briefs.filter((b) => (filter === 'all' ? true : b.status === filter));
  const newCount = briefs.filter((b) => b.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Growth Scope Inquiries & Briefs</h2>
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                {newCount} NEW
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Client briefs submitted directly from the Orbit Digital Scope Configurator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#141924] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Inquiries ({briefs.length})</option>
            <option value="new">New ({newCount})</option>
            <option value="reviewed">Reviewed</option>
            <option value="contacted">Contacted</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {briefs.length === 0 ? (
        <div className="bg-[#0e121a] border border-white/10 rounded-xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">No Client Inquiries Yet</div>
            <p className="text-xs text-neutral-400 font-mono mt-1 max-w-md mx-auto">
              When prospective clients configure their project scope and submit a brief, their requirements will appear here in real time.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-[#0e121a] border border-white/10 rounded-xl p-5 space-y-3 transition-colors hover:border-white/15"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{b.contactName || 'Prospective Client'}</span>
                    {b.companyName && <span className="text-xs text-neutral-400 font-mono">@ {b.companyName}</span>}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        b.status === 'new'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : b.status === 'contacted'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-white/10 text-neutral-400'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-300 font-mono mt-0.5">
                    Email:{' '}
                    <a href={`mailto:${b.contactEmail}`} className="text-emerald-400 underline">
                      {b.contactEmail || 'No email provided'}
                    </a>{' '}
                    &bull; Received: {new Date(b.receivedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={b.status}
                    onChange={async (e) => {
                      await updateBriefStatus(b.id, e.target.value as any);
                      showNotice('success', `Status updated to ${e.target.value}`);
                      onRefresh();
                    }}
                    className="bg-[#141924] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-neutral-200 font-mono"
                  >
                    <option value="new">Mark New</option>
                    <option value="reviewed">Mark Reviewed</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="archived">Archive</option>
                  </select>

                  <button
                    type="button"
                    onClick={async () => {
                      await deleteBriefSubmission(b.id);
                      showNotice('success', 'Deleted brief record');
                      onRefresh();
                    }}
                    className="p-1.5 rounded text-neutral-500 hover:text-red-400 transition-colors"
                    title="Delete brief"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-white/[0.02] p-2.5 rounded border border-white/5 space-y-0.5">
                  <span className="text-neutral-500 text-[10px] uppercase block">Budget Tier</span>
                  <span className="text-white font-semibold">{b.projectBudget}</span>
                </div>
                <div className="bg-white/[0.02] p-2.5 rounded border border-white/5 space-y-0.5">
                  <span className="text-neutral-500 text-[10px] uppercase block">Target Timeline</span>
                  <span className="text-white font-semibold">{b.timeline}</span>
                </div>
                <div className="bg-white/[0.02] p-2.5 rounded border border-white/5 space-y-0.5">
                  <span className="text-neutral-500 text-[10px] uppercase block">Scope & Deliverables</span>
                  <span className="text-cyan-300 truncate block">
                    {(b.selectedServices || []).join(', ') || 'Full-Funnel Scope'}
                  </span>
                </div>
              </div>

              {b.notes && (
                <div className="text-xs text-neutral-300 bg-black/40 p-3 rounded border border-white/5">
                  <span className="text-neutral-500 text-[10px] block uppercase mb-1 font-mono">Client Brief Notes</span>
                  {b.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
