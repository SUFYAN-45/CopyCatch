import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ExternalLink, 
  RefreshCw, 
  FileSearch, 
  Clock, 
  Trash2, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import type { AnalysisResult } from '../services/api';
import { getScoreColor } from '../components/ui/ScoreRing';

const STORAGE_KEY = 'copycatch_history';
const MAX_HISTORY = 50;

export interface HistoryEntry {
  analysis_id: string;
  filename: string;
  overall_similarity: number;
  classification: string;
  analyzed_at: string;
}

export function recordHistory(result: AnalysisResult) {
  try {
    const existing: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    const entry: HistoryEntry = {
      analysis_id: result.analysis_id,
      filename: result.document?.filename ?? 'Unknown Document',
      overall_similarity: result.overall_similarity,
      classification: result.classification,
      analyzed_at: result.analyzed_at,
    };
    const updated = [entry, ...existing.filter((e) => e.analysis_id !== entry.analysis_id)].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Non-critical local storage fallback
  }
}

function HistoryScoreBadge({ score }: { score: number }) {
  const { hex, bgClass, borderClass } = getScoreColor(score);
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${bgClass} ${borderClass}`}
      style={{ color: hex }}
    >
      {score.toFixed(1)}% Match
    </span>
  );
}

function HistoryClassPill({ label }: { label: string }) {
  let badgeStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (label.includes('Very High')) badgeStyle = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  else if (label.includes('High')) badgeStyle = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  else if (label.includes('Moderate')) badgeStyle = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
  else if (label.includes('Low')) badgeStyle = 'text-sky-400 bg-sky-500/10 border-sky-500/20';

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${badgeStyle}`}>
      {label}
    </span>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadHistory = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as HistoryEntry[];
      setEntries(raw);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
    setConfirmClear(false);
  };

  const handleRemove = (id: string) => {
    const updated = entries.filter((e) => e.analysis_id !== id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                Local Archive
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {entries.length} Session{entries.length !== 1 ? 's' : ''} Saved
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <BookOpen className="size-7 text-indigo-400" />
              <span>Analysis History</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Inspect past similarity audits executed on this workstation. Reports remain accessible locally until cleared.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="refresh-history-btn"
              type="button"
              onClick={loadHistory}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors"
              aria-label="Refresh history list"
              title="Refresh history"
            >
              <RefreshCw className="size-4" />
            </button>

            {entries.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
                  >
                    Confirm Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 bg-white/[0.04] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  id="clear-history-btn"
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  <span>Clear All</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Empty State */}
        {entries.length === 0 && (
          <div className="surface-card rounded-2xl border border-dashed border-white/[0.1] p-16 text-center space-y-4">
            <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
              <Clock className="size-7 text-zinc-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No Analysis History Yet</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
                Documents you analyze will automatically appear in this local archive so you can revisit forensic match reports anytime.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/analyze"
                id="history-to-analyze-cta"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
              >
                <FileSearch className="size-4" />
                <span>Open Analysis Workspace</span>
              </Link>
            </div>
          </div>
        )}

        {/* Entries List */}
        {entries.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {entries.map((entry, index) => {
                const { hex } = getScoreColor(entry.overall_similarity);
                return (
                  <motion.div
                    key={entry.analysis_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: index * 0.03 }}
                    className="surface-card rounded-2xl border border-white/[0.07] hover:border-white/[0.12] transition-colors overflow-hidden group"
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Document Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="size-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <FileText className="size-5 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-white truncate">
                            {entry.filename}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 font-mono mt-0.5">
                            <span>{formatDate(entry.analyzed_at)}</span>
                            <span>•</span>
                            <span className="text-zinc-400">ID: {entry.analysis_id.slice(0, 8)}…</span>
                          </div>
                        </div>
                      </div>

                      {/* Score & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                        <div className="flex items-center gap-2.5">
                          <HistoryClassPill label={entry.classification} />
                          <HistoryScoreBadge score={entry.overall_similarity} />
                        </div>

                        <div className="flex items-center gap-1.5 ml-2">
                          <Link
                            to={`/results/${entry.analysis_id}`}
                            id={`view-result-${entry.analysis_id.slice(0, 8)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 transition-colors"
                            aria-label={`View report for ${entry.filename}`}
                          >
                            <span>Report</span>
                            <ExternalLink className="size-3.5" />
                          </Link>

                          <button
                            id={`remove-history-${entry.analysis_id.slice(0, 8)}`}
                            type="button"
                            onClick={() => handleRemove(entry.analysis_id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100"
                            aria-label={`Delete record for ${entry.filename}`}
                            title="Delete this history record"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Severity Progress Strip */}
                    <div className="h-1 bg-white/[0.03]">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${entry.overall_similarity}%`,
                          backgroundColor: hex,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Local Storage Privacy Note */}
        {entries.length > 0 && (
          <div className="pt-4 text-center">
            <p className="text-[11px] text-zinc-400 font-mono inline-flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-zinc-400" />
              <span>History is persisted within your local browser storage. Clearing browser site data will remove these records.</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
