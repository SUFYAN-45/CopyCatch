import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  FileSearch, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  FileText,
  Layers,
  CheckCircle2,
  Database
} from 'lucide-react';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ScoreBar } from '../components/ui/ScoreBar';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Semantic Understanding',
    desc: 'Dense 384-dimensional vector embeddings understand conceptual equivalence, complex paraphrases, and context beyond keywords.',
    tag: 'all-MiniLM-L6-v2',
  },
  {
    icon: Zap,
    title: 'Hybrid Scoring Engine',
    desc: 'Calibrated mathematical fusion combines 60% semantic similarity with 40% lexical n-gram containment for optimal precision.',
    tag: '60/40 Formula',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-Format Support',
    desc: 'Native ingestion for PDF, DOCX, and TXT files up to 15 MB with robust memory buffers and encoding recovery fallbacks.',
    tag: 'PDF · DOCX · TXT',
  },
  {
    icon: BookOpen,
    title: 'Reference Corpus',
    desc: 'Manage your own indexed reference library. Upload any number of canonical papers to establish an authoritative comparison base.',
    tag: 'Local Corpus',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Build Reference Library',
    desc: 'Upload reference papers, articles, or previous student submissions to populate your indexed local corpus.',
    icon: Database,
    detail: 'Supports single or batch uploads up to 15 MB per file.',
  },
  {
    step: '02',
    title: 'Upload Document to Analyze',
    desc: 'Select or drag-and-drop the target document you need to audit for academic or textual similarity.',
    icon: FileText,
    detail: 'Automated format validation and clean text normalization.',
  },
  {
    step: '03',
    title: 'Understand Matches',
    desc: 'Explore forensic side-by-side passage comparisons, semantic vs lexical breakdowns, and objective risk classifications.',
    icon: Layers,
    detail: 'Ranked passage cards with exact character offsets.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-grid-pattern overflow-hidden">
      
      {/* Subtle background radial ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-radial-gradient pointer-events-none" />

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Small Category Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300">
              <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>AI-Powered NLP Similarity Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-white tracking-tight leading-[1.12]">
              Detect Similarity.<br />
              <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
                Understand the Match.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
              CopyCatch combines transformer embeddings with TF-IDF lexical n-grams to surface exact phrasing, rewritten passages, and contextual overlap against your indexed corpus.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/analyze"
                id="hero-cta-analyze"
                className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-600/25 border border-indigo-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span>Start Analyzing</span>
                <ArrowRight className="size-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/about"
                id="hero-cta-about"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] border border-white/[0.08] rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>How It Works</span>
              </Link>
            </div>

            {/* Technical Highlights list */}
            <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-indigo-400" />
                Dense MiniLM-L6-v2 Embeddings
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-violet-400" />
                Sublinear TF-IDF + 3-Grams
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                100% Offline Local Pipeline
              </span>
            </div>
          </motion.div>

          {/* Right Column: Realistic CopyCatch Analysis Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full"
          >
            <div className="surface-card rounded-2xl border border-white/[0.1] shadow-2xl p-5 sm:p-6 space-y-5">
              
              {/* Document Header in Preview */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText className="size-4.5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-100 truncate">
                        research_paper_draft.docx
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      1.4 MB · 14 Matches Detected
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-indigo-500/10 text-indigo-300 border-indigo-500/25">
                    Moderate Similarity
                  </span>
                </div>
              </div>

              {/* Score Breakdown Section */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#0b0d14] rounded-xl p-4 border border-white/[0.04]">
                <div className="sm:col-span-5 flex flex-col items-center justify-center">
                  <ScoreRing score={49.1} size={130} strokeWidth={8} label="Overall Match" />
                </div>
                <div className="sm:col-span-7 space-y-3.5 pt-2 sm:pt-0">
                  <ScoreBar 
                    label="Semantic Similarity" 
                    value={65.1} 
                    helperText="Conceptual" 
                    accentColor="indigo" 
                    delay={0.2}
                  />
                  <ScoreBar 
                    label="Lexical Similarity" 
                    value={25.0} 
                    helperText="Word Overlap" 
                    accentColor="violet" 
                    delay={0.3}
                  />
                  <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Formula: 0.60(Sem) + 0.40(Lex)</span>
                    <span className="text-indigo-300 font-semibold">Score: 49.1%</span>
                  </div>
                </div>
              </div>

              {/* Realistic Match Comparison Preview */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0c0e15] overflow-hidden">
                <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 font-mono">
                      Hybrid Match
                    </span>
                    <span className="text-xs text-zinc-400 truncate font-mono">
                      Ref: game_theory_handbook.docx
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-amber-400">
                    74.3% Match
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] text-xs">
                  <div className="p-3.5 space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Your Document
                    </p>
                    <p className="text-zinc-300 leading-relaxed text-[11px] font-sans">
                      "An Introduction to Game Theory, Oxford University Press, 2004. Algorithmic Game Theory, Cambridge University Press, 2007..."
                    </p>
                  </div>
                  <div className="p-3.5 space-y-1 bg-white/[0.01]">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                      Matched Source
                    </p>
                    <p className="text-zinc-300 leading-relaxed text-[11px] font-sans">
                      "Game Theory, Cambridge University Press, 2013. Algorithmic Game Theory, Cambridge University Press, 2007. Games of Strategy..."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.06] py-20 bg-[#07080d]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-400 mb-2 block">
              High Precision NLP Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              Built for Forensic Depth, Not Just Surface Checks
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Every stage of the pipeline is calibrated to identify meaning and phrase structure without false positives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, tag }) => (
              <div
                key={title}
                className="surface-card surface-card-hover rounded-2xl p-6 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="size-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:border-indigo-500/30 transition-colors">
                    <Icon className="size-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/[0.05]">
                  <span className="text-[11px] font-mono text-indigo-300 font-medium">
                    {tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Workflow Steps Section ──────────────────────────────────── */}
      <section className="relative border-t border-white/[0.06] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-400 mb-2 block">
              Structured Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              Three Simple Steps to Detailed Forensic Results
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              No cloud accounts or external subscriptions required. Runs completely locally on your hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ step, title, desc, icon: Icon, detail }) => (
              <div
                key={step}
                className="surface-card rounded-2xl p-6 sm:p-7 relative flex flex-col justify-between border border-white/[0.07] hover:border-white/[0.12] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-bold text-indigo-400/90 tracking-tight">
                      {step}
                    </span>
                    <div className="size-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                      <Icon className="size-5 text-zinc-300" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2.5">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                    {desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.05]">
                  <p className="text-[11px] font-mono text-zinc-400">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-14 surface-card rounded-2xl p-8 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-[#0f111a] to-violet-950/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-bold text-white mb-1.5">
                Ready to analyze your first document?
              </h3>
              <p className="text-sm text-zinc-400 max-w-lg">
                Upload your files into the workspace to inspect similarity scores and detailed passage comparisons.
              </p>
            </div>
            <Link
              to="/analyze"
              id="steps-cta"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/25 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <FileSearch className="size-4" />
              <span>Launch Analyzer</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
