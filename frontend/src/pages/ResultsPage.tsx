import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileSearch, AlertCircle, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { getAnalysisById, type AnalysisResult, type Match } from '../services/api';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ScoreBar } from '../components/ui/ScoreBar';
import { AnalysisSkeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';

/* ── Classification badge ── */
function ClassBadge({ label }: { label: string }) {
  const map: Record<string, string> = {
    'Very High Similarity': 'bg-red-500/15 text-red-400 border-red-500/25',
    'High Similarity':      'bg-amber-500/15 text-amber-400 border-amber-500/25',
    'Moderate Similarity':  'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    'Low Similarity':       'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
    'Very Low Similarity':  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  };
  const cls = map[label] ?? 'bg-zinc-700/30 text-zinc-400 border-zinc-700/40';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      <Tag className="size-3" /> {label}
    </span>
  );
}

/* ── Match type badge ── */
function MatchTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    semantic: 'bg-indigo-500/15 text-indigo-400',
    lexical:  'bg-violet-500/15 text-violet-400',
    hybrid:   'bg-blue-500/15 text-blue-400',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest rounded px-2 py-0.5 ${map[type] ?? 'bg-zinc-700/30 text-zinc-400'}`}>
      {type}
    </span>
  );
}

/* ── Match card ── */
function MatchCard({ match, index }: { match: Match; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border border-white/8 bg-zinc-900/60 overflow-hidden"
    >
      {/* Header */}
      <button
        id={`match-card-${index}`}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <MatchTypeBadge type={match.match_type} />
          <span className="text-sm text-zinc-300 truncate font-medium">{match.source}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-sm font-bold text-zinc-200">{match.similarity_score.toFixed(1)}%</span>
          {expanded ? <ChevronUp className="size-4 text-zinc-500" /> : <ChevronDown className="size-4 text-zinc-500" />}
        </div>
      </button>

      {/* Score bar */}
      <div className="px-5 pb-4">
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${match.similarity_score}%` }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.06 }}
          />
        </div>
      </div>

      {/* Expanded passages */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/6 grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/6">
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Submitted Passage</p>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{match.submitted_text}</p>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Matched Passage</p>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{match.matched_text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Page ── */
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [result, setResult] = useState<AnalysisResult | null>(location.state as AnalysisResult | null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!result && id) {
      getAnalysisById(id)
        .then(setResult)
        .catch(() => setError('Could not load this analysis report. It may have expired or the backend is offline.'))
        .finally(() => setLoading(false));
    }
  }, [id, result]);

  const FMT_DATE = (s: string) =>
    new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen bg-grid pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          to="/analyze"
          id="back-to-analyze"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft className="size-4" /> Back to Analyzer
        </Link>

        {loading && <AnalysisSkeleton />}

        {error && (
          <Alert variant="error" title="Failed to Load Report">
            {error}
          </Alert>
        )}

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <FileSearch className="size-6 text-indigo-400" />
                  {result.document?.filename ?? 'Analysis Report'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                  <ClassBadge label={result.classification} />
                  <span>{FMT_DATE(result.analyzed_at)}</span>
                  {result.document?.size && (
                    <span>{(result.document.size / 1024).toFixed(1)} KB</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-zinc-600 font-mono bg-zinc-900 border border-white/6 rounded-lg px-3 py-2">
                ID: {result.analysis_id.slice(0, 8)}…
              </div>
            </div>

            {/* Score grid */}
            <div className="grid sm:grid-cols-3 gap-5">
              <div className="sm:col-span-1 rounded-2xl border border-white/8 bg-zinc-900/60 p-6 flex flex-col items-center justify-center">
                <ScoreRing score={result.overall_similarity} label="Overall" />
              </div>
              <div className="sm:col-span-2 rounded-2xl border border-white/8 bg-zinc-900/60 p-6 flex flex-col justify-center gap-5">
                <ScoreBar label="Semantic Similarity" value={result.semantic_similarity} delay={0.2} />
                <ScoreBar label="Lexical Similarity"  value={result.lexical_similarity}  delay={0.4} />
                <ScoreBar label="Overall Similarity"  value={result.overall_similarity}  delay={0.6} />
              </div>
            </div>

            {/* Message */}
            {result.message && (
              <Alert variant="info">{result.message}</Alert>
            )}

            {/* No-reference state */}
            {result.matches.length === 0 && (
              <div className="text-center py-16 rounded-2xl border border-dashed border-white/8">
                <AlertCircle className="size-10 mx-auto mb-4 text-zinc-600" />
                <p className="font-medium text-zinc-400 mb-1">No significant matches found</p>
                <p className="text-sm text-zinc-600">
                  Similarity is below the detection threshold or no reference documents exist.
                </p>
              </div>
            )}

            {/* Match cards */}
            {result.matches.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-zinc-200 mb-4">
                  {result.matches.length} Match{result.matches.length !== 1 ? 'es' : ''} Detected
                </h2>
                <div className="space-y-3">
                  {result.matches.map((m, i) => (
                    <MatchCard key={i} match={m} index={i} />
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </div>
    </div>
  );
}
