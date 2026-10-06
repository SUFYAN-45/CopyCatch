import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileSearch, Sparkles, ShieldCheck, Zap, BookOpen } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Semantic Understanding',
    desc: 'Goes beyond keyword matching — our AI embeddings understand meaning, paraphrases, and contextual similarity.',
  },
  {
    icon: Zap,
    title: 'Hybrid Scoring Engine',
    desc: 'Combines dense vector semantics with TF-IDF lexical n-gram analysis for comprehensive, calibrated scores.',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-Format Support',
    desc: 'Accepts TXT, PDF, and DOCX documents up to 15 MB. Extraction handles corrupt encodings gracefully.',
  },
  {
    icon: BookOpen,
    title: 'Reference Corpus',
    desc: 'Build and manage your own reference library. Upload any number of documents to compare against.',
  },
];

const STEPS = [
  { step: '01', title: 'Upload Reference Docs', desc: 'Build your corpus by uploading any number of TXT, PDF, or DOCX files.' },
  { step: '02', title: 'Submit a Document',     desc: 'Drop the document you want to check into the Analyze panel.' },
  { step: '03', title: 'Review Results',        desc: 'Examine per-passage match cards, similarity scores, and classification.' },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex-1 bg-grid flex flex-col items-center justify-center text-center px-6 pt-36 pb-24 overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-violet-600/8 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-8">
            <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
            NLP-Powered Plagiarism Detection
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Detect Similarity.<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Understand the Match.
            </span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto mb-10">
            CopyCatch is a precision similarity-detection engine that combines semantic AI embeddings
            with lexical n-gram analysis to surface exactly where documents overlap.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/analyze"
              id="hero-cta-analyze"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors duration-150 shadow-xl shadow-indigo-600/30"
            >
              Start Analyzing <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/about"
              id="hero-cta-about"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-zinc-300 bg-white/6 hover:bg-white/10 border border-white/10 rounded-xl transition-colors duration-150"
            >
              How It Works
            </Link>
          </div>
        </motion.div>

        {/* Score preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 w-full max-w-2xl mx-auto rounded-2xl border border-white/8 bg-zinc-900/70 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="size-3 rounded-full bg-red-500" />
            <div className="size-3 rounded-full bg-amber-500" />
            <div className="size-3 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-zinc-500 font-mono">analysis_report.json</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Overall',  value: '73.4%', color: 'text-amber-400' },
              { label: 'Semantic', value: '81.2%', color: 'text-indigo-400' },
              { label: 'Lexical',  value: '62.1%', color: 'text-violet-400' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/4 p-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            {[
              { label: 'Overall Similarity',  pct: 73 },
              { label: 'Semantic Similarity', pct: 81 },
              { label: 'Lexical Similarity',  pct: 62 },
            ].map((b) => (
              <div key={b.label} className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{b.label}</span>
                  <span>{b.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/6">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Built for Precision</h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Every layer of the pipeline is tuned for accuracy — not just speed.
            </p>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={item}
                className="rounded-2xl border border-white/8 bg-zinc-900/50 p-6 hover:border-indigo-500/30 hover:bg-zinc-900/80 transition-all duration-200 group"
              >
                <div className="size-10 rounded-xl bg-indigo-600/15 flex items-center justify-center mb-4 group-hover:bg-indigo-600/25 transition-colors">
                  <Icon className="size-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/6 bg-zinc-950/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Three Steps to Results</h2>
            <p className="text-zinc-400">No account needed. No setup beyond uploading your files.</p>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {STEPS.map(({ step, title, desc }) => (
              <motion.div
                key={step}
                variants={item}
                className="flex items-start gap-6 rounded-2xl border border-white/8 bg-zinc-900/50 p-6"
              >
                <span className="text-3xl font-black text-indigo-600/40 font-mono shrink-0 w-12">{step}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-zinc-400">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-12">
            <Link
              to="/analyze"
              id="steps-cta"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/25"
            >
              <FileSearch className="size-4" /> Open Analyzer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
