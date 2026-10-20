import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ExternalLink, 
  FileSearch, 
  Clock, 
  Trash2, 
  FileText,
  Search,
  ArrowUpDown,
  TrendingUp,
  AlertTriangle,
  X
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
      className={`inline-flex items-center gap-1.5 rounded-full text-xs font-mono font-bold border ${bgClass} ${borderClass}`}
      style={{ color: hex, padding: '3px 10px' }}
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
    <span 
      className={`rounded-md text-[11px] font-medium border ${badgeStyle}`}
      style={{ padding: '2px 8px' }}
    >
      {label}
    </span>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

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

  // KPI Calculations
  const averageSimilarity = useMemo(() => {
    if (entries.length === 0) return '0.0';
    const sum = entries.reduce((acc, curr) => acc + curr.overall_similarity, 0);
    return (sum / entries.length).toFixed(1);
  }, [entries]);

  const highRiskCount = useMemo(() => {
    return entries.filter((e) => e.overall_similarity >= 60).length;
  }, [entries]);

  // Search and Sort Filtering
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) =>
        e.filename.toLowerCase().includes(q) ||
        e.analysis_id.toLowerCase().includes(q) ||
        e.classification.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'highest') {
      result.sort((a, b) => b.overall_similarity - a.overall_similarity);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.overall_similarity - b.overall_similarity);
    } else {
      // newest first
      result.sort((a, b) => new Date(b.analyzed_at).getTime() - new Date(a.analyzed_at).getTime());
    }

    return result;
  }, [entries, searchQuery, sortBy]);

  return (
    <PageContainer withGrid={false}>
      <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
        
        {/* Header with proper margin */}
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border-subtle pb-6"
          style={{ marginBottom: '32px' }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span 
                className="rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20"
                style={{ padding: '2px 10px' }}
              >
                Local Archive
              </span>
              <span className="text-xs text-content-muted font-mono">
                {entries.length} Session{entries.length !== 1 ? 's' : ''} Stored
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-content tracking-tight">
              Analysis History
            </h1>
            <p className="text-sm sm:text-base text-content-secondary max-w-xl leading-relaxed">
              Locally persisted records of documents evaluated in this browser session.
            </p>
          </div>

          {entries.length > 0 && (
            <div className="flex items-center gap-3">
              {confirmClear ? (
                <div 
                  className="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20"
                  style={{ padding: '6px 12px' }}
                >
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Clear all?</span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-content-secondary hover:text-content transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
                >
                  <Trash2 className="size-4" />
                  <span>Clear Archive</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── SUMMARY KPI STRIP (when entries > 0) ─────────────────────── */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* KPI 1: Total Scans */}
            <div 
              className="surface-card rounded-2xl border border-border-subtle p-5 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono font-medium text-content-muted uppercase tracking-wider">
                  Total Scans Archived
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-content tracking-tight">
                  {entries.length}
                </p>
                <p className="text-[11px] text-content-muted font-mono">
                  Indexed document reports
                </p>
              </div>
              <div className="size-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                <FileText className="size-5" />
              </div>
            </div>

            {/* KPI 2: Average Similarity */}
            <div 
              className="surface-card rounded-2xl border border-border-subtle p-5 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono font-medium text-content-muted uppercase tracking-wider">
                  Average Similarity
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-content tracking-tight">
                  {averageSimilarity}%
                </p>
                <p className="text-[11px] text-content-muted font-mono">
                  Across all historical runs
                </p>
              </div>
              <div className="size-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <TrendingUp className="size-5" />
              </div>
            </div>

            {/* KPI 3: High-Risk Flagged */}
            <div 
              className="surface-card rounded-2xl border border-border-subtle p-5 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs font-mono font-medium text-content-muted uppercase tracking-wider">
                  High-Risk Flagged
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                  {highRiskCount}
                </p>
                <p className="text-[11px] text-content-muted font-mono">
                  Similarity score &ge; 60%
                </p>
              </div>
              <div className="size-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="size-5" />
              </div>
            </div>
          </div>
        )}

        {/* ── SEARCH & SORT CONTROLS (when entries > 0) ────────────────── */}
        {entries.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-surface border border-border-subtle shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="size-3.5 text-content-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by filename, classification, or ID..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-base border border-border-medium text-content placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted hover:text-content p-0.5 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-mono text-content-muted flex items-center gap-1">
                <ArrowUpDown className="size-3" />
                Sort:
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-base border border-border-medium">
                {(
                  [
                    { key: 'newest', label: 'Newest First' },
                    { key: 'highest', label: 'Highest Similarity' },
                    { key: 'lowest', label: 'Lowest Similarity' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortBy(key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      sortBy === key
                        ? 'bg-surface text-content shadow-xs border border-border-subtle'
                        : 'text-content-secondary hover:text-content'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {entries.length === 0 ? (
          <div 
            className="surface-card rounded-2xl border border-dashed border-border-strong text-center space-y-4"
            style={{ padding: '64px 32px' }}
          >
            <BookOpen className="size-12 mx-auto text-content-muted opacity-40" />
            <div className="space-y-2">
              <p className="text-lg font-bold text-content">No analysis history yet</p>
              <p className="text-sm text-content-secondary max-w-sm mx-auto leading-relaxed">
                When you run document analyses, reports will be cataloged here for quick review.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/analyze"
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <FileSearch className="size-4" />
                <span>Run First Analysis</span>
              </Link>
            </div>
          </div>
        ) : filteredAndSortedEntries.length === 0 ? (
          <div 
            className="surface-card rounded-2xl border border-dashed border-border-medium text-center space-y-3"
            style={{ padding: '48px 24px' }}
          >
            <Search className="size-8 mx-auto text-content-muted" />
            <p className="text-sm font-bold text-content">No archived scans match your search</p>
            <p className="text-xs text-content-secondary max-w-sm mx-auto">
              No results match "{searchQuery}". Try searching by another keyword or reset the filter.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="btn-secondary text-xs"
              style={{ padding: '6px 16px', borderRadius: '8px' }}
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnimatePresence>
              {filteredAndSortedEntries.map((entry) => (
                <motion.div
                  key={entry.analysis_id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="surface-card rounded-2xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-border-medium transition-colors shadow-sm"
                  style={{ padding: '20px 24px' }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-10 rounded-xl bg-highlight border border-border-subtle flex items-center justify-center shrink-0 text-content-muted">
                      <FileText className="size-5 text-accent" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-bold text-content truncate font-mono">
                        {entry.filename}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-content-muted font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-content-muted" />
                          {formatDate(entry.analyzed_at)}
                        </span>
                        <span>ID: {entry.analysis_id.slice(0, 8)}…</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                    <div className="flex items-center gap-2">
                      <HistoryClassPill label={entry.classification} />
                      <HistoryScoreBadge score={entry.overall_similarity} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/results/${entry.analysis_id}`}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.75rem', textDecoration: 'none' }}
                      >
                        <span>View</span>
                        <ExternalLink className="size-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemove(entry.analysis_id)}
                        className="p-1.5 rounded-lg text-content-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove from history"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </PageContainer>
  );
}