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
import { PageContainer } from '../components/layout/PageContainer';

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
  let badgeStyle = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
  if (label.includes('Very High')) badgeStyle = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
  else if (label.includes('High')) badgeStyle = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
  else if (label.includes('Moderate')) badgeStyle = 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20';
  else if (label.includes('Low')) badgeStyle = 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20';

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
    <PageContainer withGrid={false} className="pt-10 pb-24">
      <div className="max-w-[1280px] mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border-subtle pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20">
                Local Archive
              </span>
              <span className="text-xs text-content-muted font-mono">
                {entries.length} Session{entries.length !== 1 ? 's' : ''} Saved
              </span>
            </div>
            <h1 className="text-3xl font-bold text-content tracking-tight flex items-center gap-3">
              <BookOpen className="size-7 text-accent" />
              <span>Analysis History</span>
            </h1>
            <p className="text-sm text-content-secondary max-w-xl">
              Inspect past similarity audits executed on this workstation. Reports remain accessible locally until cleared.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="refresh-history-btn"
              type="button"
              onClick={loadHistory}
              className="p-2.5 rounded-xl text-content-muted hover:text-content bg-surface hover:bg-highlight border border-border-subtle transition-colors shadow-sm"
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
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm"
                  >
                    Confirm Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-2 rounded-xl text-xs text-content-secondary hover:text-content bg-highlight transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  id="clear-history-btn"
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-content-secondary hover:text-rose-600 dark:hover:text-rose-400 bg-surface hover:bg-highlight border border-border-subtle transition-colors inline-flex items-center gap-2 shadow-sm"
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
          <div className="surface-card rounded-2xl border border-dashed border-border-strong p-16 text-center space-y-5">
            <div className="size-16 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center mx-auto shadow-sm">
              <Clock className="size-8 text-content-muted" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-content">No Analysis History Yet</h3>
              <p className="text-sm text-content-secondary max-w-sm mx-auto leading-relaxed">
                Documents you analyze will automatically appear in this local archive so you can revisit forensic match reports anytime.
              </p>
            </div>
            <div className="pt-4">
              <Link
                to="/analyze"
                id="history-to-analyze-cta"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-colors shadow-md"
              >
                <FileSearch className="size-4" />
                <span>Open Analysis Workspace</span>
              </Link>
            </div>
          </div>
        )}

        {/* Entries List */}
        {entries.length > 0 && (
          <div className="space-y-4">
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
                    className="surface-card rounded-2xl border border-border-subtle hover:border-border-medium transition-colors overflow-hidden group shadow-sm"
                  >
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      
                      {/* Document Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="size-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                          <FileText className="size-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-content truncate">
                            {entry.filename}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-content-muted font-mono mt-1">
                            <span>{formatDate(entry.analyzed_at)}</span>
                            <span>•</span>
                            <span>ID: {entry.analysis_id.slice(0, 8)}…</span>
                          </div>
                        </div>
                      </div>

                      {/* Score & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                        <div className="flex items-center gap-3">
                          <HistoryClassPill label={entry.classification} />
                          <HistoryScoreBadge score={entry.overall_similarity} />
                        </div>

                        <div className="flex items-center gap-2 pl-2">
                          <Link
                            to={`/results/${entry.analysis_id}`}
                            id={`view-result-${entry.analysis_id.slice(0, 8)}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-colors"
                            aria-label={`View report for ${entry.filename}`}
                          >
                            <span>Report</span>
                            <ExternalLink className="size-3.5" />
                          </Link>

                          <button
                            id={`remove-history-${entry.analysis_id.slice(0, 8)}`}
                            type="button"
                            onClick={() => handleRemove(entry.analysis_id)}
                            className="p-2 rounded-lg text-content-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors sm:opacity-50 sm:group-hover:opacity-100"
                            aria-label={`Delete record for ${entry.filename}`}
                            title="Delete this history record"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Severity Progress Strip */}
                    <div className="h-1 bg-highlight">
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
          <div className="pt-6 text-center border-t border-border-subtle">
            <p className="text-[11px] text-content-muted font-mono inline-flex items-center gap-1.5 bg-highlight px-3 py-1.5 rounded-lg border border-border-subtle">
              <ShieldAlert className="size-3.5" />
              <span>History is persisted within your local browser storage. Clearing browser site data will remove these records.</span>
            </p>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
