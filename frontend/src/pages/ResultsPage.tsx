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

/* ── Classification Badge ── */
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${badgeStyle}`}>
      <Tag className="size-3.5" />
      <span>{label}</span>
    </span>
  );
}

/* ── Match Type Badge ── */
function MatchTypeBadge({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  if (normalized === 'semantic') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/25">
        <Sparkles className="size-3" /> Semantic
      </span>
    );
  }
  if (normalized === 'lexical') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/25">
        <Layers className="size-3" /> Lexical
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/25">
      <ShieldCheck className="size-3" /> Hybrid
    </span>
  );
}

/* ── Single Match Card ── */
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`surface-card rounded-2xl border transition-all duration-300 ${
        isOpen ? 'border-cyan-500/30 bg-surface shadow-md' : 'border-border-subtle hover:border-border-medium hover:-translate-y-1 hover:shadow-lg'
      }`}
    >
      {/* Header (Collapsible toggle button) */}
      <button
        type="button"
        id={`match-card-${rank}`}
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-4">
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
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold tracking-tight bg-black/5 dark:bg-black/20 border`}
              style={{ color: scoreColorHex, borderColor: `${scoreColorHex}40` }}
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

      {/* Mini Progress Bar on Card Edge */}
      <div className="px-5 pb-3">
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

      {/* Expanded Forensic Comparison */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border-subtle"
          >
            <div className="p-5 bg-base grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: Your Document */}
              <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/[0.02] p-5 flex flex-col justify-between relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-rose-700 opacity-80" />
                <div className="pl-3">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-200 dark:border-rose-500/10">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
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
                  
                  <div className="max-h-64 overflow-y-auto pr-2">
                    <p className="text-xs sm:text-sm text-content-secondary leading-relaxed whitespace-pre-wrap font-sans selection:bg-rose-600/30">
                      {match.submitted_text}
                    </p>
                  </div>
                </div>

                <div className="pl-3 pt-4 mt-4 border-t border-rose-200 dark:border-rose-500/10 text-[11px] text-content-muted font-mono">
                  Extracted from target upload
                </div>
              </div>

              {/* Right: Matched Source */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/[0.02] p-5 flex flex-col justify-between relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-emerald-700 opacity-80" />
                <div className="pl-3">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-200 dark:border-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Matched Reference Source
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-content-muted truncate max-w-[160px]" title={match.source}>
                      {match.source}
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto pr-2">
                    <p className="text-xs sm:text-sm text-content-secondary leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-600/30">
                      {match.matched_text}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-200 dark:border-emerald-500/10 flex items-center justify-between text-[11px] text-content-muted font-mono">
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
    </motion.div>
  );
}

/* ── Main Results Page ── */
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [result, setResult] = useState<AnalysisResult | null>(location.state as AnalysisResult | null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState<string | null>(null);
  
  // UI Controls
  const [copiedId, setCopiedId] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'semantic' | 'lexical' | 'hybrid'>('all');
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set([0])); // First card open by default

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
    <PageContainer withGrid={false} className="pt-8 pb-24">
      <div className="max-w-[1280px] mx-auto space-y-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2">
          <Link
            to="/analyze"
            id="back-to-analyze"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-content-secondary hover:text-content transition-colors p-1"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Analyzer</span>
          </Link>

          {result && (
            <button
              type="button"
              onClick={copyAnalysisId}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-content-secondary hover:text-content bg-surface border border-border-subtle transition-colors shadow-sm"
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
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-10"
          >
            {/* ── Report Header ─────────────────────────────────────────── */}
            <div className="surface-card rounded-2xl p-6 sm:p-8 border border-border-subtle space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20">
                      Forensic Report
                    </span>
                    <ClassificationBadge label={result.classification} />
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold text-content tracking-tight flex items-center gap-3">
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
                  <span className="text-lg font-bold text-content">
                    {result.classification}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Main Score Section (OVERALL + SUPPORTING) ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Central/Left: Overall Similarity (Hero Metric) */}
              <div className="lg:col-span-5 surface-card rounded-2xl p-6 sm:p-8 border border-border-subtle flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-accent to-blue-500 opacity-50 dark:opacity-70 blur-sm" />
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-purple-400 via-accent to-blue-400 opacity-90" />
                
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

              {/* Right: Supporting Metrics & Breakdown */}
              <div className="lg:col-span-7 surface-card rounded-2xl p-6 sm:p-8 border border-border-subtle flex flex-col justify-between space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-content uppercase tracking-wider font-mono mb-2">
                    Multi-Model Calibration Breakdown
                  </h3>
                  <p className="text-sm text-content-secondary leading-relaxed">
                    Dual-channel NLP computation cross-referencing conceptual vectors and literal word containment.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Semantic Bar */}
                  <div className="p-5 rounded-xl bg-gradient-to-b from-surface to-base border border-border-subtle hover:border-purple-500/30 transition-colors shadow-sm group">
                    <div className="flex items-center gap-2 mb-3">
                      <BrainCircuit className="size-4.5 text-purple-500" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-300">Semantic</span>
                    </div>
                    <ScoreBar 
                      label="Semantic Similarity" 
                      value={result.semantic_similarity} 
                      helperText="Dense Vector Embeddings" 
                      accentColor="purple" 
                      delay={0.2}
                    />
                    <p className="text-xs text-content-muted mt-3 leading-relaxed">
                      Evaluated via 384-dimensional sentence embeddings using the all-MiniLM-L6-v2 transformer.
                    </p>
                  </div>

                  {/* Glowing visual divider */}
                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-base px-2.5 py-0.5 text-[10px] text-accent font-mono tracking-widest border border-accent/20 rounded-full shadow-sm">
                        +
                      </span>
                    </div>
                  </div>

                  {/* Lexical Bar */}
                  <div className="p-5 rounded-xl bg-gradient-to-b from-surface to-base border border-border-subtle hover:border-cyan-500/30 transition-colors shadow-sm group">
                    <div className="flex items-center gap-2 mb-3">
                      <Type className="size-4.5 text-accent" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">Lexical</span>
                    </div>
                    <ScoreBar 
                      label="Lexical Similarity" 
                      value={result.lexical_similarity} 
                      helperText="TF-IDF & N-Gram Containment" 
                      accentColor="cyan" 
                      delay={0.35}
                    />
                    <p className="text-xs text-content-muted mt-3 leading-relaxed">
                      Evaluated via sublinear TF-IDF vectorization and word 3-gram surface sequence containment.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-content-muted font-mono pt-4 border-t border-border-subtle">
                  <span>Sensitivity Threshold: 50.0%</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{result.matches.length} Total Matches Extracted</span>
                </div>
              </div>

            </div>

            {/* Optional Notification Message */}
            {result.message && (
              <Alert variant="info" title="System Notice">
                {result.message}
              </Alert>
            )}

            {/* ── Section: Match Results (FORENSIC CARDS) ────────────────── */}
            <div className="space-y-6 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-content tracking-tight flex items-center gap-3">
                    <BookOpen className="size-6 text-indigo-500" />
                    <span>Matches Detected</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/25">
                      {result.matches.length}
                    </span>
                  </h2>
                  <p className="text-sm text-content-secondary mt-1.5">
                    Passage comparisons ranked by similarity strength. Expand cards to inspect side-by-side textual evidence.
                  </p>
                </div>

                {/* Filters & Expand All Affordance */}
                {result.matches.length > 0 && (
                  <div className="flex items-center gap-3">
                    {/* Filter buttons */}
                    <div className="flex items-center bg-highlight border border-border-medium rounded-xl p-1 text-xs">
                      {(['all', 'hybrid', 'semantic', 'lexical'] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          type="button"
                          onClick={() => setSelectedFilter(filterKey)}
                          className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                            selectedFilter === filterKey
                              ? 'bg-content text-base shadow-sm'
                              : 'text-content-secondary hover:text-content'
                          }`}
                        >
                          {filterKey}
                        </button>
                      ))}
                    </div>

                    {/* Expand / Collapse Toggle */}
                    <button
                      type="button"
                      onClick={expandedIndices.size === filteredMatches.length ? handleCollapseAll : handleExpandAll}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-content bg-surface hover:bg-highlight border border-border-medium transition-colors inline-flex items-center gap-2 shadow-sm"
                    >
                      {expandedIndices.size === filteredMatches.length ? (
                        <>
                          <Minimize2 className="size-3.5" />
                          <span className="hidden sm:inline">Collapse All</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="size-3.5" />
                          <span className="hidden sm:inline">Expand All</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Empty Matches State */}
              {result.matches.length === 0 ? (
                <div className="surface-card rounded-2xl border border-dashed border-border-strong p-16 text-center space-y-4">
                  <AlertCircle className="size-12 mx-auto text-content-muted" />
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-content">
                      No significant similarity matches detected
                    </p>
                    <p className="text-sm text-content-secondary max-w-md mx-auto leading-relaxed">
                      All computed passage similarities fall below the 50% detection threshold, or no overlapping content was identified against your reference corpus.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
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
