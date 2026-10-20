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
  Type,
  Download,
  Printer,
  Search,
  Highlighter,
  Database,
  X,
  Activity,
  Filter,
  Zap
} from 'lucide-react';
import { getAnalysisById, type AnalysisResult, type Match } from '../services/api';
import { ScoreRing, getScoreColor } from '../components/ui/ScoreRing';
import { ScoreBar } from '../components/ui/ScoreBar';
import { AnalysisSkeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { PageContainer } from '../components/layout/PageContainer';

/* ── Stopwords for Word-Level Forensic Highlighting ─────────────────── */
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were',
  'been', 'have', 'has', 'had', 'which', 'their', 'they', 'what', 'when',
  'where', 'who', 'will', 'would', 'could', 'should', 'about', 'into', 'than',
  'then', 'them', 'these', 'those', 'also', 'such', 'other', 'some', 'more'
]);

function extractSignificantWords(text: string): Set<string> {
  const words = text.toLowerCase().match(/\b[a-z0-9_-]{3,}\b/g) || [];
  return new Set(words.filter((w) => !STOPWORDS.has(w)));
}

function HighlightedPassage({ 
  text, 
  sharedWords, 
  highlightColor 
}: { 
  text: string; 
  sharedWords: Set<string>; 
  highlightColor: 'rose' | 'emerald';
}) {
  if (sharedWords.size === 0) {
    return <span>{text}</span>;
  }

  const parts = text.split(/(\b[a-zA-Z0-9_-]+\b)/g);
  const spanClass = highlightColor === 'rose'
    ? 'bg-rose-500/20 text-rose-900 dark:text-rose-200 px-1 rounded font-medium'
    : 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 px-1 rounded font-medium';

  return (
    <span>
      {parts.map((part, idx) => {
        const lower = part.toLowerCase();
        if (sharedWords.has(lower)) {
          return (
            <mark key={idx} className={spanClass}>
              {part}
            </mark>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

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
  highlightWords?: boolean;
}

function MatchCard({ match, rank, isOpen, onToggle, highlightWords = true }: MatchCardProps) {
  const { hex: scoreColorHex } = getScoreColor(match.similarity_score);
  const location = match.location as {
    submitted_chunk_index?: number;
    submitted_start_char?: number;
    submitted_end_char?: number;
    reference_chunk_index?: number;
  } | null;

  const sharedWords = useMemo(() => {
    if (!highlightWords) return new Set<string>();
    const submittedSet = extractSignificantWords(match.submitted_text);
    const matchedSet = extractSignificantWords(match.matched_text);
    const shared = new Set<string>();
    for (const w of submittedSet) {
      if (matchedSet.has(w)) {
        shared.add(w);
      }
    }
    return shared;
  }, [match.submitted_text, match.matched_text, highlightWords]);

  const linguisticVerdict = useMemo(() => {
    const subWords = extractSignificantWords(match.submitted_text);
    const refWords = extractSignificantWords(match.matched_text);
    const totalUniqueWords = new Set([...subWords, ...refWords]).size;
    const sharedCount = sharedWords.size;
    const overlapRatio = totalUniqueWords > 0 ? sharedCount / Math.max(1, subWords.size) : 0;
    const overlapPct = Math.round(overlapRatio * 100);

    let patternTitle = 'Conceptual Paraphrase / Structural Mirroring';
    let patternBadgeStyle = 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/25';
    let recommendation = 'Extensive semantic alignment detected via sentence embeddings despite low surface token duplication; structural concept mirrored.';

    if (overlapRatio >= 0.45 || match.match_type.toLowerCase() === 'lexical') {
      patternTitle = 'Verbatim Block Reproduction';
      patternBadgeStyle = 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/25';
      recommendation = 'Direct verbatim phrase sequence identified without required quote boundary or citation encapsulation.';
    } else if (overlapRatio >= 0.20 || match.match_type.toLowerCase() === 'hybrid') {
      patternTitle = 'Clause Reordering & Synonym Substitution';
      patternBadgeStyle = 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/25';
      recommendation = 'Sentential syntax altered through synonym replacement and clause transposition, retaining source semantic core.';
    }

    return {
      patternTitle,
      patternBadgeStyle,
      sharedCount,
      totalSubWords: subWords.size,
      overlapPct,
      recommendation,
    };
  }, [match.submitted_text, match.matched_text, match.match_type, sharedWords]);

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

      {/* Expanded Forensic Comparison */}
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
                      {highlightWords ? (
                        <HighlightedPassage text={match.submitted_text} sharedWords={sharedWords} highlightColor="rose" />
                      ) : (
                        match.submitted_text
                      )}
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
                      {highlightWords ? (
                        <HighlightedPassage text={match.matched_text} sharedWords={sharedWords} highlightColor="emerald" />
                      ) : (
                        match.matched_text
                      )}
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

            {/* ── Forensic Linguistic Verdict ──────────────────────── */}
            <div 
              className="border-t border-border-subtle bg-surface"
              style={{ padding: '16px 20px' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="size-4 text-accent" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-content">
                    Forensic Linguistic Verdict
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-content-muted">Rewrite Pattern:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${linguisticVerdict.patternBadgeStyle}`}>
                    {linguisticVerdict.patternTitle}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 text-xs">
                <div className="md:col-span-4 flex items-center gap-2 font-mono text-content-secondary">
                  <span className="text-content-muted">Shared Key Terms:</span>
                  <strong className="text-content font-bold">
                    {linguisticVerdict.sharedCount} / {linguisticVerdict.totalSubWords} ({linguisticVerdict.overlapPct}%)
                  </strong>
                </div>
                <div className="md:col-span-8 text-content-secondary leading-relaxed">
                  <span className="font-semibold text-content mr-1 font-mono text-[11px] uppercase text-accent">Recommendation:</span>
                  <span>{linguisticVerdict.recommendation}</span>
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
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightWords, setHighlightWords] = useState(true);
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

  // Source attribution summary stats
  const sourceAttributions = useMemo(() => {
    if (!result?.matches || result.matches.length === 0) return [];
    const map = new Map<string, { count: number; maxScore: number }>();
    for (const m of result.matches) {
      const existing = map.get(m.source);
      if (!existing) {
        map.set(m.source, { count: 1, maxScore: m.similarity_score });
      } else {
        existing.count += 1;
        existing.maxScore = Math.max(existing.maxScore, m.similarity_score);
      }
    }
    return Array.from(map.entries())
      .map(([source, stats]) => ({ source, ...stats }))
      .sort((a, b) => b.maxScore - a.maxScore);
  }, [result]);

  const sortedMatches = useMemo(() => {
    if (!result?.matches) return [];
    return [...result.matches].sort((a, b) => b.similarity_score - a.similarity_score);
  }, [result]);

  const filteredMatches = useMemo(() => {
    let matches = sortedMatches;

    // Filter by match type
    if (selectedFilter !== 'all') {
      matches = matches.filter((m) => m.match_type.toLowerCase() === selectedFilter);
    }

    // Filter by specific source file
    if (selectedSource) {
      matches = matches.filter((m) => m.source === selectedSource);
    }

    // Filter by keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      matches = matches.filter((m) =>
        m.submitted_text.toLowerCase().includes(q) ||
        m.matched_text.toLowerCase().includes(q) ||
        m.source.toLowerCase().includes(q)
      );
    }

    return matches;
  }, [sortedMatches, selectedFilter, selectedSource, searchQuery]);

  const maxDocChar = useMemo(() => {
    let maxC = 0;
    for (const m of sortedMatches) {
      const loc = m.location as { submitted_end_char?: number } | null;
      if (loc?.submitted_end_char && loc.submitted_end_char > maxC) {
        maxC = loc.submitted_end_char;
      }
    }
    return maxC > 0 ? maxC : 1000;
  }, [sortedMatches]);

  const handleJumpToMatch = (matchIndex: number, rank: number) => {
    setExpandedIndices((prev) => new Set([...prev, matchIndex]));
    setTimeout(() => {
      const el = document.getElementById(`match-card-${rank}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

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

  const handleExportJson = () => {
    if (!result) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `copycatch-report-${result.analysis_id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
        
        {/* Navigation Breadcrumb & Export Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-6 gap-3 flex-wrap">
          <Link
            to="/analyze"
            id="back-to-analyze"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-content-secondary hover:text-content transition-colors no-print"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft className="size-4" />
            <span>Back to Analyzer</span>
          </Link>

          {result && (
            <div className="flex items-center gap-2 flex-wrap no-print">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 rounded-lg text-xs font-mono text-content-secondary hover:text-content bg-surface hover:bg-highlight border border-border-subtle transition-colors shadow-sm cursor-pointer"
                style={{ padding: '6px 12px' }}
                title="Export complete analysis results as JSON"
              >
                <Download className="size-3.5 text-accent" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg text-xs font-mono text-content-secondary hover:text-content bg-surface hover:bg-highlight border border-border-subtle transition-colors shadow-sm cursor-pointer"
                style={{ padding: '6px 12px' }}
                title="Print or Save PDF report"
              >
                <Printer className="size-3.5 text-accent" />
                <span>Print / Save PDF</span>
              </button>

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
            </div>
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
                    {(result.word_count ?? result.document?.word_count) !== undefined && (
                      <span>{(result.word_count ?? result.document?.word_count)!.toLocaleString()} words</span>
                    )}
                    {(result.execution_time_ms ?? result.document?.execution_time_ms) !== undefined && (
                      <span className="flex items-center gap-1 text-accent font-semibold">
                        <Zap className="size-3.5 text-amber-500" />
                        <span>
                          {(result.execution_time_ms ?? result.document?.execution_time_ms)! < 1000
                            ? `${result.execution_time_ms ?? result.document?.execution_time_ms} ms`
                            : `${(((result.execution_time_ms ?? result.document?.execution_time_ms)!) / 1000).toFixed(2)} s`}
                        </span>
                      </span>
                    )}
                    <span>{result.matches.length} Matches Detected</span>
                    {(() => {
                      const filters = result.filters_applied ?? result.document?.filters_applied;
                      if (!filters) return null;
                      const activeFilters: string[] = [];
                      if (filters.exclude_quotes) activeFilters.push('Quotes Excluded');
                      if (filters.exclude_bibliography) activeFilters.push('Bibliography Excluded');
                      if (activeFilters.length === 0) return null;
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20">
                          <Filter className="size-3" />
                          {activeFilters.join(' · ')}
                        </span>
                      );
                    })()}
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
              style={{ gap: '32px', marginBottom: '40px' }}
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

            {/* ── Source Corpus Attribution Breakdown Card ─────────────────── */}
            {result.matches.length > 0 && sourceAttributions.length > 0 && (
              <div 
                className="surface-card rounded-2xl border border-border-subtle shadow-sm space-y-4"
                style={{ padding: '24px 28px', marginBottom: '40px' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                      <Database className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-content tracking-tight">
                        Source Corpus Attribution
                      </h2>
                      <p className="text-xs text-content-secondary">
                        Match concentration grouped by indexed reference documents. Click to isolate passages.
                      </p>
                    </div>
                  </div>
                  {selectedSource && (
                    <button
                      type="button"
                      onClick={() => setSelectedSource(null)}
                      className="text-xs font-mono text-accent hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <span>Clear filter: {selectedSource}</span>
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {sourceAttributions.map((attr) => {
                    const isSelected = selectedSource === attr.source;
                    return (
                      <button
                        key={attr.source}
                        type="button"
                        onClick={() => setSelectedSource(isSelected ? null : attr.source)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent' 
                            : 'border-border-subtle bg-surface hover:border-border-medium hover:bg-highlight/50'
                        }`}
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-mono font-semibold text-content truncate" title={attr.source}>
                            {attr.source}
                          </p>
                          <p className="text-[11px] text-content-muted mt-0.5 font-mono">
                            {attr.count} match{attr.count !== 1 ? 'es' : ''} &middot; Peak {attr.maxScore.toFixed(1)}%
                          </p>
                        </div>
                        <span 
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                            isSelected 
                              ? 'bg-accent text-white border-accent' 
                              : 'bg-highlight text-content-secondary border-border-medium'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Filter'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Document Match Distribution Heatmap ───────────────────── */}
            {result.matches.length > 0 && (
              <div 
                className="surface-card rounded-2xl border border-border-subtle shadow-sm space-y-4"
                style={{ padding: '24px 28px', marginBottom: '40px' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                      <Activity className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-content tracking-tight">
                        Document Match Distribution Heatmap
                      </h2>
                      <p className="text-xs text-content-secondary">
                        Timeline of detected similarities along document character span. Click a marker to jump to passage.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-content-muted">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-purple-500" />
                      <span>Semantic</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-cyan-500" />
                      <span>Lexical</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-500" />
                      <span>Hybrid</span>
                    </span>
                  </div>
                </div>

                {/* Heatmap Bar */}
                <div className="space-y-2 pt-1">
                  <div className="relative h-7 rounded-xl bg-highlight border border-border-medium overflow-hidden shadow-inner flex items-center">
                    {/* Subtle grid lines at 25%, 50%, 75% */}
                    <div className="absolute inset-y-0 left-1/4 w-px bg-border-subtle" />
                    <div className="absolute inset-y-0 left-2/4 w-px bg-border-subtle" />
                    <div className="absolute inset-y-0 left-3/4 w-px bg-border-subtle" />

                    {sortedMatches.map((m, idx) => {
                      const loc = m.location as { submitted_start_char?: number; submitted_end_char?: number } | null;
                      const leftPct = Math.max(
                        0,
                        Math.min(
                          96,
                          loc?.submitted_start_char !== undefined && maxDocChar > 0
                            ? (loc.submitted_start_char / maxDocChar) * 100
                            : (idx / Math.max(1, sortedMatches.length)) * 90
                        )
                      );
                      const widthPct = Math.max(
                        3,
                        Math.min(
                          100 - leftPct,
                          loc?.submitted_start_char !== undefined && loc?.submitted_end_char !== undefined && maxDocChar > 0
                            ? ((loc.submitted_end_char - loc.submitted_start_char) / maxDocChar) * 100
                            : 6
                        )
                      );

                      const mType = m.match_type.toLowerCase();
                      const markerBg = mType === 'semantic' ? 'bg-purple-500 hover:bg-purple-400 ring-purple-400' :
                                       mType === 'lexical' ? 'bg-cyan-500 hover:bg-cyan-400 ring-cyan-400' :
                                       'bg-blue-500 hover:bg-blue-400 ring-blue-400';

                      return (
                        <button
                          key={`heatmap-${m.source}-${idx}`}
                          type="button"
                          onClick={() => handleJumpToMatch(idx, idx + 1)}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          title={`Match #${idx + 1} (${m.similarity_score.toFixed(1)}%): ${m.source} — Click to inspect`}
                          className={`absolute top-1 bottom-1 rounded-md transition-all cursor-pointer opacity-85 hover:opacity-100 hover:scale-y-110 hover:z-10 hover:ring-2 shadow-xs ${markerBg}`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-content-muted">
                    <span>0% (Document Start)</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100% (Document End)</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Section: Match Results ───────────────────────────────── */}
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-subtle pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-content tracking-tight flex items-center gap-3">
                    <BookOpen className="size-5 sm:size-6 text-accent" />
                    <span>Matches Detected</span>
                    <span 
                      className="rounded-full text-xs font-mono font-semibold bg-accent/10 text-accent border border-accent/20"
                      style={{ padding: '2px 10px' }}
                    >
                      {filteredMatches.length}{filteredMatches.length !== result.matches.length ? ` of ${result.matches.length}` : ''}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-content-secondary mt-1">
                    Passage comparisons ranked by similarity strength. Expand cards to inspect side-by-side textual evidence.
                  </p>
                </div>

                {/* Filter, Search, and Toggle Controls */}
                {result.matches.length > 0 && (
                  <div className="flex items-center gap-2.5 flex-wrap no-print">
                    
                    {/* Search Input */}
                    <div className="relative min-w-[200px] sm:min-w-[240px]">
                      <Search className="size-3.5 text-content-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search passages or source..."
                        className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-surface border border-border-medium text-content placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-accent"
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

                    {/* Word-level overlap highlight toggle */}
                    <button
                      type="button"
                      onClick={() => setHighlightWords((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        highlightWords 
                          ? 'bg-accent/10 text-accent border-accent/30' 
                          : 'bg-surface text-content-secondary border-border-subtle hover:bg-highlight'
                      }`}
                      title="Toggle shared vocabulary highlighting in expanded passages"
                    >
                      <Highlighter className="size-3.5" />
                      <span className="hidden sm:inline">Highlight Overlapping Words</span>
                      <span className="sm:hidden">Highlight</span>
                    </button>

                    {/* Filter Pills */}
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

                    {/* Expand/Collapse All */}
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
              ) : filteredMatches.length === 0 ? (
                <div 
                  className="surface-card rounded-2xl border border-dashed border-border-medium text-center space-y-3"
                  style={{ padding: '36px 20px' }}
                >
                  <Search className="size-8 mx-auto text-content-muted" />
                  <p className="text-sm font-bold text-content">
                    No matches meet your filter criteria
                  </p>
                  <p className="text-xs text-content-secondary max-w-sm mx-auto">
                    Try clearing the keyword search, source filter, or match type selector above.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilter('all');
                      setSelectedSource(null);
                    }}
                    className="btn-secondary text-xs"
                    style={{ padding: '6px 16px', borderRadius: '8px' }}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div>
                  {filteredMatches.map((match, idx) => (
                    <MatchCard
                      key={`${match.source}-${match.location?.submitted_chunk_index ?? idx}-${idx}`}
                      match={match}
                      rank={idx + 1}
                      isOpen={expandedIndices.has(idx)}
                      onToggle={() => toggleCard(idx)}
                      highlightWords={highlightWords}
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