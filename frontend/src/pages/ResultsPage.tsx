import { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  FileText, 
  Clock, 
  Check, 
  Copy, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  Maximize2, 
  Minimize2,
  BrainCircuit,
  Type
} from 'lucide-react';
import { getAnalysisById, type AnalysisResult, type Match } from '../services/api';
import { ScoreRing, getScoreColor } from '../components/ui/ScoreRing';
import { ScoreBar } from '../components/ui/ScoreBar';
import { AnalysisSkeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { PageContainer } from '../components/layout/PageContainer';

/* ── Classification Badge ────────────────────────────────────────────── */
function ClassificationBadge({ label }: { label: string }) {
  let badgeStyle = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25';
  
  if (label.includes('Very High')) {
    badgeStyle = 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
  } else if (label.includes('High')) {
    badgeStyle = 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
  } else if (label.includes('Moderate')) {
    badgeStyle = 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30';
  } else if (label.includes('Low')) {
    badgeStyle = 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-500/30';
  }

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full text-xs font-semibold border shadow-sm ${badgeStyle}`}
      style={{ padding: '4px 12px' }}
    >
      <Tag className="size-3.5" />
      <span>{label}</span>
    </span>
  );
}

/* ── Match Type Badge ────────────────────────────────────────────────── */
function MatchTypeBadge({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  if (normalized === 'semantic') {
    return (
      <span 
        className="inline-flex items-center gap-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/25"
        style={{ padding: '3px 8px' }}
      >
        <Sparkles className="size-3" /> Semantic
      </span>
    );
  }
  if (normalized === 'lexical') {
    return (
      <span 
        className="inline-flex items-center gap-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/25"
        style={{ padding: '3px 8px' }}
      >
        <Layers className="size-3" /> Lexical
      </span>
    );
  }
  return (
    <span 
      className="inline-flex items-center gap-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/25"
      style={{ padding: '3px 8px' }}
    >
      <ShieldCheck className="size-3" /> Hybrid
    </span>
  );
}

/* ── Single Match Card ───────────────────────────────────────────────── */
interface MatchCardProps {
  match: Match;
  rank: number;
  isOpen: boolean;
  onToggle: () => void;
}

function MatchCard({ match, rank, isOpen, onToggle }: MatchCardProps) {
  const { hex: scoreColorHex } = getScoreColor(match.similarity_score);
  const location = match.location as {
    submitted_chunk_index?: number;
    submitted_start_char?: number;
    submitted_end_char?: number;
    reference_chunk_index?: number;
  } | null;

  return (
    <div
      className={`surface-card rounded-2xl border transition-all duration-200 ${
        isOpen ? 'border-accent/40 bg-surface shadow-md' : 'border-border-subtle hover:border-border-medium'
      }`}
      style={{ marginBottom: '20px' }}
    >
      {/* Header Button */}
      <button
        type="button"
        id={`match-card-${rank}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl cursor-pointer"
        style={{ padding: '16px 20px' }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <span className="font-mono text-xs font-bold text-content-muted shrink-0 w-6">
            #{rank.toString().padStart(2, '0')}
          </span>

          <MatchTypeBadge type={match.match_type} />

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-content-muted hidden sm:inline">Source:</span>
            <span className="text-xs sm:text-sm font-semibold text-content truncate font-mono">
              {match.source}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end justify-center">
            <span 
              className="inline-flex items-center justify-center rounded text-[11px] font-bold tracking-tight bg-highlight border"
              style={{ color: scoreColorHex, borderColor: `${scoreColorHex}40`, padding: '2px 8px' }}
            >
              {match.similarity_score.toFixed(1)}%
            </span>
            <span className="text-[10px] text-content-muted font-mono mt-0.5">
              Match
            </span>
          </div>

          <div className="size-8 rounded-lg bg-highlight border border-border-subtle flex items-center justify-center text-content-muted">
            {isOpen ? <ChevronUp className="size-4 text-content" /> : <ChevronDown className="size-4" />}
          </div>
        </div>
      </button>

      {/* Progress Bar on Card Edge */}
      <div style={{ padding: '0 20px 12px 20px' }}>
        <div className="h-1 rounded-full bg-highlight overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${match.similarity_score}%`,
              backgroundColor: scoreColorHex 
            }}
          />
        </div>
      </div>

      {/* Expanded Forensic Comparison with padding: 20px 24px */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border-subtle"
          >
            <div 
              className="bg-base/60 grid grid-cols-1 lg:grid-cols-2"
              style={{ padding: '20px', gap: '20px' }}
            >
              
              {/* Left: Your Document */}
              <div 
                className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/[0.04] flex flex-col justify-between relative overflow-hidden shadow-sm"
                style={{ padding: '20px 24px' }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-200 dark:border-rose-500/10">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-rose-500" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                        Submitted Document
                      </span>
                    </div>
                    {location?.submitted_chunk_index !== undefined && (
                      <span className="text-[10px] font-mono text-content-muted">
                        Chunk #{location.submitted_chunk_index}
                        {location.submitted_start_char !== undefined && ` · Offset ${location.submitted_start_char.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto pr-1">
                    <p className="text-xs sm:text-sm text-content leading-relaxed whitespace-pre-wrap font-sans break-words">
                      {match.submitted_text}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-rose-200 dark:border-rose-500/10 text-[11px] text-content-muted font-mono">
                  Target Upload Passage
                </div>
              </div>

              {/* Right: Matched Reference Source */}
              <div 
                className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/[0.04] flex flex-col justify-between relative overflow-hidden shadow-sm"
                style={{ padding: '20px 24px' }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Matched Reference Source
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-content-muted truncate max-w-[180px]" title={match.source}>
                      {match.source}
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto pr-1">
                    <p className="text-xs sm:text-sm text-content leading-relaxed whitespace-pre-wrap font-sans break-words">
                      {match.matched_text}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-emerald-200 dark:border-emerald-500/10 flex items-center justify-between text-[11px] text-content-muted font-mono">
                  <span>Match Strength: {match.similarity_score.toFixed(1)}%</span>
                  {location?.reference_chunk_index !== undefined && (
                    <span>Ref Chunk #{location.reference_chunk_index}</span>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Results Page ───────────────────────────────────────────────── */
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [result, setResult] = useState<AnalysisResult | null>(location.state as AnalysisResult | null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState<string | null>(null);
  
  // UI Controls
  const [copiedId, setCopiedId] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'semantic' | 'lexical' | 'hybrid'>('all');
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    if (!result && id) {
      setLoading(true);
      getAnalysisById(id)
        .then((data) => {
          setResult(data);
          setError(null);
        })
        .catch(() => {
          setError('Could not retrieve this analysis report. It may have expired or the backend server is offline.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, result]);

  const sortedMatches = useMemo(() => {
    if (!result?.matches) return [];
    return [...result.matches].sort((a, b) => b.similarity_score - a.similarity_score);
  }, [result]);

  const filteredMatches = useMemo(() => {
    if (selectedFilter === 'all') return sortedMatches;
    return sortedMatches.filter((m) => m.match_type.toLowerCase() === selectedFilter);
  }, [sortedMatches, selectedFilter]);

  const toggleCard = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIndices(new Set(filteredMatches.map((_, i) => i)));
  };

  const handleCollapseAll = () => {
    setExpandedIndices(new Set());
  };

  const copyAnalysisId = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.analysis_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <PageContainer withGrid={false}>
      <div style={{ paddingTop: '24px', paddingBottom: '80px' }}>
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-6">
          <Link
            to="/analyze"
            id="back-to-analyze"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-content-secondary hover:text-content transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft className="size-4" />
            <span>Back to Analyzer</span>
          </Link>

          {result && (
            <button
              type="button"
              onClick={copyAnalysisId}
              className="inline-flex items-center gap-2 rounded-lg text-xs font-mono text-content-secondary hover:text-content bg-surface hover:bg-highlight border border-border-subtle transition-colors shadow-sm cursor-pointer"
              style={{ padding: '6px 12px' }}
              title="Copy Analysis ID"
            >
              {copiedId ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">ID Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>ID: {result.analysis_id.slice(0, 8)}…</span>
                </>
              )}
            </button>
          )}
        </div>

        {loading && <AnalysisSkeleton />}

        {error && (
          <Alert variant="error" title="Report Unavailable">
            {error}
          </Alert>
        )}

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* ── Document Metadata Header: margin-bottom: 32px ──────────── */}
            <div 
              className="surface-card rounded-2xl border border-border-subtle shadow-sm space-y-4"
              style={{ padding: '28px 32px', marginBottom: '32px' }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span 
                      className="rounded text-[11px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20"
                      style={{ padding: '3px 8px' }}
                    >
                      Forensic Report
                    </span>
                    <ClassificationBadge label={result.classification} />
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-content tracking-tight flex items-center gap-3 break-words">
                    <FileText className="size-6 text-accent shrink-0" />
                    <span>{result.document?.filename ?? 'Document Analysis Report'}</span>
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-content-muted font-mono pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-content-muted" />
                      {formatDate(result.analyzed_at)}
                    </span>
                    {result.document?.size && (
                      <span>File Size: {(result.document.size / 1024).toFixed(1)} KB</span>
                    )}
                    <span>{result.matches.length} Matches Detected</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-8">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-content-muted block mb-1">
                    Classification Status
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-content">
                    {result.classification}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Score & Breakdown Grid: 340px 1fr; gap: 32px; margin-bottom: 48px ── */}
            <div 
              className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
              style={{ gap: '32px', marginBottom: '48px' }}
            >
              {/* Left Column: Overall Similarity Gauge */}
              <div 
                className="lg:col-span-5 surface-card rounded-2xl border border-border-subtle flex flex-col items-center justify-center relative overflow-hidden shadow-sm"
                style={{ padding: '32px' }}
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-accent to-blue-500" />
                
                <ScoreRing 
                  score={result.overall_similarity} 
                  size={190} 
                  strokeWidth={12} 
                  label="Overall Similarity"
                  sublabel="Calibrated Hybrid Index"
                />

                <div className="mt-6 pt-4 border-t border-border-subtle w-full text-center">
                  <span className="text-xs text-content-muted font-mono">
                    Formula: 0.60(Semantic) + 0.40(Lexical)
                  </span>
                </div>
              </div>

              {/* Right Column: Dual-Channel Supporting Breakdown */}
              <div 
                className="lg:col-span-7 surface-card rounded-2xl border border-border-subtle flex flex-col justify-between space-y-6 shadow-sm"
                style={{ padding: '32px' }}
              >
                <div>
                  <h3 className="text-xs font-mono font-bold text-content uppercase tracking-wider mb-1">
                    Dual-Channel Model Breakdown
                  </h3>
                  <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                    NLP analysis cross-referencing dense conceptual vectors with surface word n-gram containment.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Semantic Metric */}
                  <div 
                    className="rounded-xl bg-surface border border-border-subtle space-y-2"
                    style={{ padding: '16px 20px' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit className="size-4 text-purple-500" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Semantic Similarity (60% Weight)
                      </span>
                    </div>
                    <ScoreBar 
                      label="Semantic Similarity" 
                      value={result.semantic_similarity} 
                      helperText="Dense Vector Embeddings" 
                      accentColor="purple" 
                      delay={0.15}
                    />
                    <p className="text-xs text-content-muted leading-relaxed font-mono">
                      Evaluated via 384-dimensional sentence embeddings using all-MiniLM-L6-v2 transformer.
                    </p>
                  </div>

                  {/* Lexical Metric */}
                  <div 
                    className="rounded-xl bg-surface border border-border-subtle space-y-2"
                    style={{ padding: '16px 20px' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="size-4 text-accent" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
                        Lexical Similarity (40% Weight)
                      </span>
                    </div>
                    <ScoreBar 
                      label="Lexical Similarity" 
                      value={result.lexical_similarity} 
                      helperText="TF-IDF & N-Gram Containment" 
                      accentColor="cyan" 
                      delay={0.25}
                    />
                    <p className="text-xs text-content-muted leading-relaxed font-mono">
                      Evaluated via sublinear TF-IDF vectorization and word 3-gram surface sequence containment.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle text-xs text-content-muted font-mono flex items-center justify-between">
                  <span>Sensitivity Threshold: 50.0%</span>
                  <span className="text-accent font-semibold">{result.matches.length} Total Matches Extracted</span>
                </div>
              </div>
            </div>

            {/* ── Section: Match Results ───────────────────────────────── */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-content tracking-tight flex items-center gap-3">
                    <BookOpen className="size-5 sm:size-6 text-accent" />
                    <span>Matches Detected</span>
                    <span 
                      className="rounded-full text-xs font-mono font-semibold bg-accent/10 text-accent border border-accent/20"
                      style={{ padding: '2px 10px' }}
                    >
                      {result.matches.length}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-content-secondary mt-1">
                    Passage comparisons ranked by similarity strength. Expand cards to inspect side-by-side textual evidence.
                  </p>
                </div>

                {/* Filter and Expand/Collapse Controls with explicit gap: 8px */}
                {result.matches.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div 
                      className="bg-highlight border border-border-medium rounded-xl"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px' }}
                    >
                      {(['all', 'hybrid', 'semantic', 'lexical'] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          type="button"
                          onClick={() => setSelectedFilter(filterKey)}
                          className="filter-pill"
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            backgroundColor: selectedFilter === filterKey ? 'var(--bg-surface)' : 'transparent',
                            color: selectedFilter === filterKey ? 'var(--text-primary)' : 'var(--text-secondary)'
                          }}
                        >
                          {filterKey}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={expandedIndices.size === filteredMatches.length ? handleCollapseAll : handleExpandAll}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      {expandedIndices.size === filteredMatches.length ? (
                        <>
                          <Minimize2 className="size-3.5" />
                          <span>Collapse All</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="size-3.5" />
                          <span>Expand All</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Empty Matches State */}
              {result.matches.length === 0 ? (
                <div 
                  className="surface-card rounded-2xl border border-dashed border-border-strong text-center space-y-3"
                  style={{ padding: '48px 24px' }}
                >
                  <AlertCircle className="size-10 mx-auto text-content-muted" />
                  <p className="text-base font-bold text-content">
                    No significant similarity matches detected
                  </p>
                  <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
                    All computed passage similarities fall below the 50% detection threshold, or no overlapping content was identified against your reference corpus.
                  </p>
                </div>
              ) : (
                <div>
                  {filteredMatches.map((match, idx) => (
                    <MatchCard
                      key={`${match.source}-${idx}`}
                      match={match}
                      rank={idx + 1}
                      isOpen={expandedIndices.has(idx)}
                      onToggle={() => toggleCard(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

      </div>
    </PageContainer>
  );
}