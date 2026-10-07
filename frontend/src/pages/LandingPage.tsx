import { motion } from 'framer-motion';
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
  FileType
} from 'lucide-react';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ScoreBar } from '../components/ui/ScoreBar';
import { PageContainer } from '../components/layout/PageContainer';

export default function LandingPage() {
  return (
    <PageContainer className="p-0 sm:p-0 lg:p-0 xl:p-0" withGrid={false}>
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-radial-gradient pointer-events-none" />

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 pb-20 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          
          {/* Left Column: Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border-medium bg-highlight px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-content-secondary tracking-wide uppercase">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              AI-Powered Similarity Analysis
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-content tracking-tight leading-[1.15]">
              Detect Similarity.<br />
              Understand the Match.
            </h1>

            <p className="text-base sm:text-lg text-content-secondary leading-relaxed max-w-lg">
              Compare your documents against your indexed reference corpus to surface exact phrasing, rewritten passages, and contextual overlap using advanced NLP.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/analyze"
                className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>Start Analyzing</span>
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-content-secondary bg-surface hover:bg-highlight border border-border-subtle hover:border-border-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>How It Works</span>
              </Link>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-mono text-content-muted">
              <span className="flex items-center gap-1.5"><FileType className="size-3.5" /> PDF &middot; DOCX &middot; TXT</span>
              <span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> Semantic + Lexical</span>
              <span className="flex items-center gap-1.5"><Zap className="size-3.5" /> Local Processing</span>
            </div>
          </motion.div>

          {/* Right Column: Realistic Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-6 w-full relative"
          >
            <div className="relative surface-elevated rounded-2xl border border-border-subtle shadow-2xl p-6 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-content">research_paper_draft.docx</h3>
                    <p className="text-[11px] text-content-muted font-mono">1.4 MB &middot; 14 Matches Detected</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  Moderate Risk
                </span>
              </div>

              <div className="grid grid-cols-12 gap-6 items-center">
                <div className="col-span-5 flex justify-center">
                  <ScoreRing score={73.4} size={140} strokeWidth={8} label="Overall Match" />
                </div>
                <div className="col-span-7 space-y-4">
                  <ScoreBar label="Semantic Similarity" value={81.2} helperText="Conceptual" accentColor="purple" delay={0.2} />
                  <ScoreBar label="Lexical Similarity" value={62.1} helperText="Word Overlap" accentColor="cyan" delay={0.3} />
                </div>
              </div>

              <div className="rounded-xl border border-border-subtle bg-base overflow-hidden text-xs shadow-sm">
                <div className="px-4 py-2 border-b border-border-subtle flex justify-between items-center bg-surface">
                  <span className="font-mono text-[10px] text-content-muted">game_theory_handbook.docx</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">81.2%</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-border-subtle">
                  <div className="p-3 bg-red-50 dark:bg-red-950/20">
                    <p className="text-[10px] font-mono text-content-muted mb-1">YOUR DOCUMENT</p>
                    <p className="text-content-secondary font-sans leading-relaxed text-[11px]">An Introduction to Game Theory, Oxford University Press, 2004.</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20">
                    <p className="text-[10px] font-mono text-content-muted mb-1">MATCHED SOURCE</p>
                    <p className="text-content-secondary font-sans leading-relaxed text-[11px]">Game Theory, Cambridge University Press, 2013.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────── */}
      <section className="py-24 border-t border-border-subtle bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h4 className="text-xs font-bold text-accent tracking-widest uppercase mb-3">Capabilities</h4>
            <h2 className="text-3xl font-bold text-content tracking-tight mb-4">Built to Understand Similarity</h2>
            <p className="text-content-secondary max-w-2xl text-lg">Every stage of the pipeline is calibrated to identify meaning and phrase structure without false positives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Semantic Understanding", desc: "Dense 384-dimensional vector embeddings understand conceptual equivalence." },
              { icon: Zap, title: "Hybrid Scoring Engine", desc: "Mathematical fusion combines semantic similarity with lexical n-gram containment." },
              { icon: FileCode2, title: "Multi-Format Documents", desc: "Native ingestion for PDF, DOCX, and TXT files up to 15 MB." },
              { icon: BookOpen, title: "Reference Corpus", desc: "Manage your own indexed reference library for authoritative comparisons." }
            ].map((f, i) => (
              <div key={i} className="surface-card p-6 rounded-2xl flex flex-col h-full group">
                <div className="size-10 rounded-xl bg-highlight border border-border-subtle flex items-center justify-center mb-5 group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors">
                  <f.icon className="size-5 text-content-muted group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-content mb-2">{f.title}</h3>
                <p className="text-sm text-content-secondary leading-relaxed flex-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works / NLP Explanation ────────────────────────────────────────── */}
      <section className="py-24 border-t border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-content tracking-tight">From Document to Insight</h2>
              <p className="text-lg text-content-secondary leading-relaxed">
                CopyCatch doesn't just look for exact phrase matches. It builds a comprehensive fingerprint of your document using a hybrid NLP approach.
              </p>
              
              <div className="space-y-8 pt-4">
                <div className="flex gap-4">
                  <div className="shrink-0 size-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm border border-accent/20">01</div>
                  <div>
                    <h4 className="font-semibold text-content mb-1">Build Reference Corpus</h4>
                    <p className="text-sm text-content-secondary">Upload authoritative files (PDF, DOCX) to index into your personal library.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 size-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm border border-accent/20">02</div>
                  <div>
                    <h4 className="font-semibold text-content mb-1">Upload Target Document</h4>
                    <p className="text-sm text-content-secondary">Submit the document you wish to analyze against your indexed library.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 size-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm border border-accent/20">03</div>
                  <div>
                    <h4 className="font-semibold text-content mb-1">Analyze & Inspect</h4>
                    <p className="text-sm text-content-secondary">Review the hybrid score, semantic overlap, and pinpoint exact matching passages.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card rounded-2xl p-8 space-y-8">
              <h3 className="font-semibold text-content border-b border-border-subtle pb-4">Hybrid Scoring Architecture</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-content font-medium flex items-center gap-2"><Sparkles className="size-4 text-purple-500" /> Semantic (Vector Embeddings)</span>
                    <span className="text-content-muted font-mono">60% Weight</span>
                  </div>
                  <div className="h-2 w-full bg-highlight rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[60%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-content font-medium flex items-center gap-2"><Layers className="size-4 text-cyan-500" /> Lexical (TF-IDF N-grams)</span>
                    <span className="text-content-muted font-mono">40% Weight</span>
                  </div>
                  <div className="h-2 w-full bg-highlight rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[40%]" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
                <span className="text-sm font-semibold text-content">Final Hybrid Score</span>
                <span className="text-2xl font-bold text-accent">100%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="py-32 border-t border-border-subtle bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-content tracking-tight">Ready to understand what overlaps?</h2>
          <p className="text-lg text-content-secondary">
            Analyze your document against your reference corpus today.
          </p>
          <div className="pt-4">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <FileSearch className="size-5" />
              <span>Start Analysis &rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
