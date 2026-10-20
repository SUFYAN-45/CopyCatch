import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Sparkles,
  Layers,
  FileSearch,
  BookOpen,
  Zap,
  FileCode2,
  FileType,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ScoreBar } from '../components/ui/ScoreBar';

interface HeroScenario {
  id: string;
  tabLabel: string;
  filename: string;
  filesize: string;
  riskBadge: string;
  riskStyle: string;
  overall: number;
  semantic: number;
  lexical: number;
  sourceFile: string;
  matchScore: number;
  submittedPassage: string;
  matchedPassage: string;
}

const HERO_SCENARIOS: HeroScenario[] = [
  {
    id: 'paraphrased',
    tabLabel: 'Paraphrased Draft',
    filename: 'research_paper_draft.docx',
    filesize: '1.4 MB',
    riskBadge: 'Moderate Risk',
    riskStyle: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    overall: 73.4,
    semantic: 81.2,
    lexical: 62.1,
    sourceFile: 'game_theory_handbook.docx',
    matchScore: 81.2,
    submittedPassage: '"An Introduction to Game Theory, Oxford University Press, 2004."',
    matchedPassage: '"Game Theory, Cambridge University Press, 2013."',
  },
  {
    id: 'direct',
    tabLabel: 'Direct Copy',
    filename: 'literature_review_v2.pdf',
    filesize: '842 KB',
    riskBadge: 'Very High Similarity',
    riskStyle: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    overall: 94.2,
    semantic: 96.0,
    lexical: 91.5,
    sourceFile: 'attention_is_all_you_need.pdf',
    matchScore: 96.0,
    submittedPassage: '"Transformers utilize self-attention mechanisms to compute representations of input sequences without using recurrent architectures."',
    matchedPassage: '"The Transformer relies entirely on self-attention mechanisms to compute representations of its input and output without using sequence-aligned RNNs."',
  },
  {
    id: 'original',
    tabLabel: 'Original Work',
    filename: 'capstone_thesis_final.docx',
    filesize: '2.1 MB',
    riskBadge: 'Minimal Similarity',
    riskStyle: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    overall: 11.8,
    semantic: 16.5,
    lexical: 4.8,
    sourceFile: 'distributed_systems_survey.pdf',
    matchScore: 16.5,
    submittedPassage: '"Our experimental evaluation across 4 benchmark datasets demonstrated an empirical speedup of 34% with zero loss in classification accuracy."',
    matchedPassage: '"Evaluation was conducted across multiple datasets measuring performance characteristics."',
  },
];

export default function LandingPage() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const currentScenario = HERO_SCENARIOS[selectedScenarioIndex];

  return (
    <div className="relative w-full flex-1 flex flex-col">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[520px] bg-radial-gradient pointer-events-none" />

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section style={{ padding: '64px 0' }}>
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center" style={{ gap: '48px' }}>

            {/* Left Column: Hero Copy */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6"
            >
              <div
                className="inline-flex items-center gap-2 rounded-full border border-border-medium bg-surface text-xs font-semibold text-content-secondary shadow-sm"
                style={{ padding: '6px 14px' }}
              >
                <span className="size-2 rounded-full bg-accent animate-pulse" />
                <span>Dual-Channel NLP Plagiarism Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-content tracking-tight leading-[1.12]">
                Detect Similarity.<br />
                <span className="bg-gradient-to-r from-accent via-blue-600 to-indigo-600 dark:from-accent-light dark:via-accent dark:to-indigo-400 bg-clip-text text-transparent">
                  Understand the Match.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-content-secondary leading-relaxed max-w-xl">
                Compare documents against your indexed reference corpus to surface exact phrasing, rewritten passages, and contextual overlap using dense transformer embeddings and n-gram analysis.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/analyze"
                  id="hero-cta-analyze"
                  className="btn-hero"
                  style={{ textDecoration: 'none' }}
                >
                  <FileSearch className="size-4.5" />
                  <span>Start Document Analysis</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/about"
                  id="hero-cta-about"
                  className="btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <span>How It Works</span>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-content-muted">
                <span className="flex items-center gap-1.5"><FileType className="size-4 text-accent" /> PDF &middot; DOCX &middot; TXT</span>
                <span className="flex items-center gap-1.5"><Sparkles className="size-4 text-purple-500" /> Semantic + Lexical</span>
                <span className="flex items-center gap-1.5"><Zap className="size-4 text-amber-500" /> Local Processing</span>
              </div>
            </motion.div>

            {/* Right Column: Realistic Sample Product Preview with Interactive Scenarios */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-5 w-full"
            >
              <div
                className="surface-card shadow-xl relative overflow-hidden"
                style={{ padding: '24px 28px', borderRadius: '16px' }}
              >
                {/* Interactive Scenario Pill Tabs */}
                <div className="flex items-center gap-1 p-1 bg-highlight/80 border border-border-subtle rounded-xl mb-4">
                  {HERO_SCENARIOS.map((sc, idx) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setSelectedScenarioIndex(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate text-center ${selectedScenarioIndex === idx
                        ? 'bg-surface text-content shadow-sm border border-border-medium'
                        : 'text-content-secondary hover:text-content'
                        }`}
                    >
                      {sc.tabLabel}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentScenario.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Sample Badge & Info */}
                    <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                          <FileText className="size-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-content truncate font-mono">
                            {currentScenario.filename}
                          </h3>
                          <p className="text-[11px] text-content-muted font-mono">
                            {currentScenario.filesize} &middot; Sample Report
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${currentScenario.riskStyle}`}>
                        {currentScenario.riskBadge}
                      </span>
                    </div>

                    {/* Score gauge + Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-4">
                      <div className="sm:col-span-5 flex justify-center">
                        <ScoreRing
                          score={currentScenario.overall}
                          size={140}
                          strokeWidth={8}
                          label="Overall Match"
                          sublabel="Sample Preview"
                        />
                      </div>
                      <div className="sm:col-span-7 space-y-4">
                        <ScoreBar
                          label="Semantic Similarity"
                          value={currentScenario.semantic}
                          helperText="Conceptual Embeddings"
                          accentColor="purple"
                          delay={0.05}
                        />
                        <ScoreBar
                          label="Lexical Similarity"
                          value={currentScenario.lexical}
                          helperText="Surface Word Overlap"
                          accentColor="cyan"
                          delay={0.1}
                        />
                      </div>
                    </div>

                    {/* Sample Match Card */}
                    <div
                      className="rounded-xl border border-border-subtle bg-base overflow-hidden text-xs"
                      style={{ marginTop: '16px' }}
                    >
                      <div className="px-4 py-2 border-b border-border-subtle flex justify-between items-center bg-surface">
                        <span className="font-mono text-[11px] font-medium text-content-secondary truncate max-w-[200px]">
                          {currentScenario.sourceFile}
                        </span>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold text-xs">
                          {currentScenario.matchScore.toFixed(1)}% Match
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
                        <div style={{ padding: '12px 14px' }} className="bg-rose-50/50 dark:bg-rose-950/15">
                          <p className="text-[10px] font-mono font-semibold text-rose-700 dark:text-rose-400 mb-1">
                            SUBMITTED PASSAGE
                          </p>
                          <p className="text-content-secondary leading-relaxed text-xs">
                            {currentScenario.submittedPassage}
                          </p>
                        </div>
                        <div style={{ padding: '12px 14px' }} className="bg-emerald-50/50 dark:bg-emerald-950/15">
                          <p className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                            MATCHED SOURCE
                          </p>
                          <p className="text-content-secondary leading-relaxed text-xs">
                            {currentScenario.matchedPassage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CAPABILITIES SECTION ───────────────────────────────────────── */}
      <section className="border-t border-border-subtle bg-surface" style={{ padding: '72px 0' }}>
        <div className="page-container">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono font-bold text-accent tracking-wider uppercase">Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-content tracking-tight mt-1 mb-3">
              Built to Understand Similarity
            </h2>
            <p className="text-xs font-mono font-bold text-accent tracking-wider uppercase">
              Every stage of the pipeline is calibrated to identify true contextual meaning and phrase structure without false positives.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            {[
              {
                icon: Sparkles,
                title: "Semantic Vectors",
                desc: "Dense 384-dimensional vector embeddings capture conceptual rewrites and paraphrasing across languages."
              },
              {
                icon: Zap,
                title: "Hybrid Scoring Engine",
                desc: "Calibrated 60/40 mathematical fusion balances semantic cosine distance with lexical n-gram containment."
              },
              {
                icon: FileCode2,
                title: "Multi-Format Ingestion",
                desc: "Direct text extraction for native PDF, Microsoft Word DOCX, and Plain Text files up to 15 MB."
              },
              {
                icon: BookOpen,
                title: "Managed Reference Corpus",
                desc: "Build and query your authoritative local document corpus with instant indexing and per-document removal."
              }
            ].map((f, i) => (
              <div
                key={i}
                className="surface-card flex flex-col h-full group hover:border-border-medium transition-colors"
                style={{ padding: '28px', borderRadius: '12px' }}
              >
                <div
                  className="size-11 rounded-xl bg-highlight border border-border-subtle flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors"
                  style={{ marginBottom: '16px' }}
                >
                  <f.icon className="size-5 text-content group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-content mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed flex-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-STEP WORKFLOW & METHODOLOGY ──────────────────────────────── */}
      <section className="border-t border-border-subtle" style={{ padding: '72px 0' }}>
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center" style={{ gap: '48px' }}>

            {/* Left: 3-step workflow */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono font-bold text-accent tracking-wider uppercase">Workflow</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-content tracking-tight">
                From Document to Forensic Insight
              </h2>
              <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
                CopyCatch doesn't merely search for identical keywords. It constructs a linguistic fingerprint of your document using a multi-phase NLP architecture.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '8px' }}>
                {[
                  {
                    step: '01',
                    title: 'Index Reference Documents',
                    desc: 'Upload reference articles, publications, or past submissions to build your private comparative baseline.'
                  },
                  {
                    step: '02',
                    title: 'Submit Target Document',
                    desc: 'Drop in the target document (.pdf, .docx, .txt). Content is extracted, sanitized, and windowed into overlapping chunks.'
                  },
                  {
                    step: '03',
                    title: 'Inspect Forensic Match Evidence',
                    desc: 'Review the composite similarity index and side-by-side passage comparisons highlighting matching sentences.'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="size-9 rounded-xl bg-accent/10 text-accent font-mono font-bold text-sm border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-content text-sm sm:text-base">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Architecture summary card */}
            <div
              className="lg:col-span-6 surface-card space-y-6 border border-border-subtle shadow-md"
              style={{ padding: '32px', borderRadius: '16px' }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <Cpu className="size-5 text-accent" />
                  <h3 className="font-semibold text-content text-sm sm:text-base">Hybrid Scoring Architecture</h3>
                </div>
                <span className="text-xs font-mono font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  Calibrated
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-content font-medium flex items-center gap-2">
                      <Sparkles className="size-4 text-purple-500" /> Semantic Channel (Vectors)
                    </span>
                    <span className="text-content-muted font-mono font-bold">60% Weight</span>
                  </div>
                  <div className="h-2.5 w-full bg-highlight rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[60%]" />
                  </div>
                  <p className="text-[11px] text-content-muted mt-1.5 font-mono">
                    Dense embeddings via all-MiniLM-L6-v2 transformer model
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-content font-medium flex items-center gap-2">
                      <Layers className="size-4 text-cyan-500" /> Lexical Channel (N-Grams)
                    </span>
                    <span className="text-content-muted font-mono font-bold">40% Weight</span>
                  </div>
                  <div className="h-2.5 w-full bg-highlight rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full w-[40%]" />
                  </div>
                  <p className="text-[11px] text-content-muted mt-1.5 font-mono">
                    TF-IDF unigram-to-trigram + exact 3-gram containment
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-content flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Unified Composite Score
                </span>
                <span className="font-mono font-bold text-accent text-base">0.0% – 100.0%</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ────────────────────────────────────────────── */}
      <section className="border-t border-border-subtle bg-surface">
        <div className="page-container">
          <div
            className="surface-card rounded-2xl mx-auto shadow-sm"
            style={{
              padding: '64px 32px',
              margin: '48px 0',
              textAlign: 'center',
              maxWidth: '840px'
            }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-content tracking-tight">
                Ready to understand what overlaps?
              </h2>
              <p className="text-sm sm:text-base text-content-secondary leading-relaxed max-w-lg mx-auto">
                Upload your target document and compare it against indexed reference material in seconds.
              </p>
              <div className="pt-2 flex justify-center">
                <Link
                  to="/analyze"
                  id="footer-cta-analyze"
                  className="btn-hero"
                  style={{ textDecoration: 'none' }}
                >
                  <FileSearch className="size-5" />
                  <span>Start Document Analysis</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}