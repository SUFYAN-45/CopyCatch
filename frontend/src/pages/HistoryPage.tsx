import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, RefreshCw, AlertCircle, FileSearch, Clock, Trash2 } from 'lucide-react';
import type { AnalysisResult } from '../services/api';

const STORAGE_KEY = 'copycatch_history';
const MAX_HISTORY = 50;

/* History is stored in localStorage since the backend doesn't provide a list endpoint for reports */
export function recordHistory(result: AnalysisResult) {
  try {
    const existing: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    const entry: HistoryEntry = {
      analysis_id: result.analysis_id,
      filename: result.document?.filename ?? 'Unknown',
      overall_similarity: result.overall_similarity,
      classification: result.classification,
      analyzed_at: result.analyzed_at,
    };
    const updated = [entry, ...existing.filter((e) => e.analysis_id !== entry.analysis_id)].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* non-critical */ }
}

interface HistoryEntry {
  analysis_id: string;
  filename: string;
  overall_similarity: number;
  classification: string;
  analyzed_at: string;
}

function classColor(c: string): string {
  if (c.startsWith('Very High')) return 'text-red-400';
  if (c.startsWith('High'))      return 'text-amber-400';
  if (c.startsWith('Moderate'))  return 'text-yellow-400';
  if (c.startsWith('Low'))       return 'text-indigo-400';
  return 'text-emerald-400';
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-red-500/15 text-red-400'
    : score >= 50 ? 'bg-amber-500/15 text-amber-400'
    : score >= 25 ? 'bg-indigo-500/15 text-indigo-400'
    : 'bg-emerald-500/15 text-emerald-400';
  return (
    <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${color}`}>
      {score.toFixed(1)}%
    </span>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as HistoryEntry[];
      setEntries(raw);
    } catch { setEntries([]); }
  };

  useEffect(() => { load(); }, []);

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  };

  const handleRemove = (id: string) => {
    const updated = entries.filter((e) => e.analysis_id !== id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const FMT_DATE = (s: string) =>
    new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen bg-grid pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpen className="size-7 text-indigo-400" />
              Analysis History
            </h1>
            <p className="text-zinc-400 text-sm">Your previous analysis sessions, stored locally in your browser.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="refresh-history-btn"
              onClick={load}
              className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-xl hover:bg-white/5"
              aria-label="Refresh history"
            >
              <RefreshCw className="size-4" />
            </button>
            {entries.length > 0 && (
              <button
                id="clear-history-btn"
                onClick={handleClear}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors border border-white/8 hover:border-red-500/30 px-3 py-2 rounded-xl"
              >
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 rounded-2xl border border-dashed border-white/8"
          >
            <Clock className="size-12 mx-auto mb-4 text-zinc-700" />
            <p className="font-medium text-zinc-500 mb-2">No history yet</p>
            <p className="text-sm text-zinc-600 mb-6">Your past analyses will appear here after you run one.</p>
            <Link
              to="/analyze"
              id="history-to-analyze-cta"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <FileSearch className="size-4" /> Go to Analyzer
            </Link>
          </motion.div>
        )}

        <AnimatePresence>
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.analysis_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="group rounded-2xl border border-white/8 bg-zinc-900/60 hover:border-white/12 hover:bg-zinc-900/80 transition-all duration-200"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="size-10 rounded-xl bg-indigo-600/15 flex items-center justify-center shrink-0">
                    <FileSearch className="size-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-200 truncate">{entry.filename}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{FMT_DATE(entry.analyzed_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium hidden sm:block ${classColor(entry.classification)}`}>
                      {entry.classification}
                    </span>
                    <ScorePill score={entry.overall_similarity} />
                    <Link
                      to={`/results/${entry.analysis_id}`}
                      id={`view-result-${entry.analysis_id.slice(0, 8)}`}
                      className="p-1.5 text-zinc-600 hover:text-indigo-400 transition-colors"
                      aria-label="View result"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                    <button
                      id={`remove-history-${entry.analysis_id.slice(0, 8)}`}
                      onClick={() => handleRemove(entry.analysis_id)}
                      className="p-1.5 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove entry"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                {/* Mini progress */}
                <div className="px-5 pb-4">
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${entry.overall_similarity >= 75 ? 'bg-red-500' : entry.overall_similarity >= 50 ? 'bg-amber-500' : entry.overall_similarity >= 25 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                      style={{ width: `${entry.overall_similarity}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {entries.length > 0 && (
          <p className="mt-8 text-center text-xs text-zinc-700">
            <AlertCircle className="size-3 inline mr-1" />
            History is stored locally and may be lost if you clear your browser data.
          </p>
        )}
      </div>
    </div>
  );
}
