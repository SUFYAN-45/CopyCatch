import { 
  Sparkles, 
  Search, 
  Layers, 
  BarChart2, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Binary, 
  Terminal, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';

const PIPELINE_STAGES = [
  {
    step: '01',
    icon: FileText,
    badge: 'Security & Validation',
    title: 'Document Ingestion',
    desc: 'Ingests PDF, DOCX, and TXT files. Sanitizes file names to defend against directory traversal attacks, inspects file magic-bytes for MIME validation, and enforces strict 15 MB size boundaries.',
    metrics: 'PDF · DOCX · TXT · 15 MB Max',
  },
  {
    step: '02',
    icon: Search,
    badge: 'Normalization & Tokenization',
    title: 'Text Extraction & Preprocessing',
    desc: 'Extracts unicode text via format-specialized parsers (pypdf, python-docx, UTF-8/Latin-1 fallback). Cleans non-printable characters, normalizes whitespace, and partitions content into overlapping sentence windows (~50 words each) with exact character-offset tracking.',
    metrics: 'Sliding sentence windows · ~50 words',
  },
  {
    step: '03',
    icon: Sparkles,
    badge: 'Dense Vector Semantics',
    title: 'Semantic Similarity (Transformer Embeddings)',
    desc: 'Each text chunk is mapped into a 384-dimensional dense semantic vector using the all-MiniLM-L6-v2 sentence transformer. Normalized cosine dot products compute conceptual similarity, capturing rewrites and paraphrases that share no exact words.',
    metrics: 'all-MiniLM-L6-v2 · 384 Dimensions',
  },
  {
    step: '04',
    icon: Layers,
    badge: 'N-Gram Surface Overlap',
    title: 'Lexical Similarity (TF-IDF & Containment)',
    desc: 'Sublinear TF-IDF vectorizers (unigrams through trigrams) calculate document-wide cosine similarity. A complementary word 3-gram containment metric calculates literal verbatim phrase reproduction.',
    metrics: 'Sublinear TF-IDF · Word 3-Grams',
  },
  {
    step: '05',
    icon: BarChart2,
    badge: 'Mathematical Fusion',
    title: 'Hybrid Scoring & Classification',
    desc: 'Computes a calibrated composite score: Hybrid = (0.60 × Semantic) + (0.40 × Lexical). The final percentage is clamped from 0.0% to 100.0% and classified into five standardized objective similarity bands.',
    metrics: '60/40 Hybrid Weighted Formula',
  },
  {
    step: '06',
    icon: ShieldCheck,
    badge: 'Forensic Output',
    title: 'Match Extraction & Reporting',
    desc: 'Passage pairs exceeding a 50% similarity threshold are extracted with submitted and matched text snippets, deduplicated, and ranked. The complete forensic analysis is serialized to a persistent JSON document report on disk.',
    metrics: '50% Threshold · JSON Serialization',
  },
];

const TECH_STACK = [
  {
    title: 'Sentence Transformers',
    subtitle: 'all-MiniLM-L6-v2',
    desc: 'Dense 384-dimensional semantic embedding model optimized for rapid local inference without GPU requirements.',
    icon: Sparkles,
    color: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-500/20',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  {
    title: 'Scikit-Learn',
    subtitle: 'TF-IDF & N-Grams',
    desc: 'Sublinear term frequency vectorizer with unigram to trigram vocabulary analysis and word containment checking.',
    icon: Terminal,
    color: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-500/20',
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
  },
  {
    title: 'FastAPI',
    subtitle: 'Python 3.13 Backend',
    desc: 'High-performance asynchronous REST API architecture handling multipart document uploads and analysis pipelines.',
    icon: Cpu,
    color: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    title: 'React & Vite',
    subtitle: 'Modern UI Engine',
    desc: 'TypeScript-powered reactive single-page frontend with responsive layouts and fluid state transitions.',
    icon: Binary,
    color: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-500/20',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
];

const CLASSIFICATION_TIERS = [
  { range: '80% – 100%', label: 'Very High Similarity', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', desc: 'Extensive verbatim duplication or direct synonym replacement throughout the document.' },
  { range: '60% – 79.9%', label: 'High Similarity', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', desc: 'Substantial structural overlap and paragraph-level paraphrase matches against the corpus.' },
  { range: '40% – 59.9%', label: 'Moderate Similarity', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20', desc: 'Shared conceptual framework and isolated passage matches; may include standard terminology.' },
  { range: '20% – 39.9%', label: 'Low Similarity', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/20', desc: 'Incidental topic overlap or generic boilerplate phrases without systematic reproduction.' },
  { range: '0% – 19.9%', label: 'Minimal / No Similarity', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', desc: 'Essentially original phrasing with no significant correlation to the indexed reference corpus.' },
];

export default function AboutPage() {
  return (
    <PageContainer withGrid={false}>
      <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
        
        {/* Centered Header Section */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 56px auto' }} className="space-y-3">
          <div className="flex justify-center">
            <span 
              className="rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20"
              style={{ padding: '4px 14px' }}
            >
              NLP Pipeline
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-content tracking-tight">
            How CopyCatch Analyzes Text
          </h1>
          <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
            A comprehensive overview of the algorithmic mechanisms, mathematical scoring models, and multi-stage extraction pipeline powering CopyCatch.
          </p>
        </div>

        {/* ── 6-STAGE PIPELINE GRID ───────────────────────────────────── */}
        <div className="space-y-6" style={{ marginBottom: '56px' }}>
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-content tracking-tight">
                The 6-Stage Forensic Pipeline
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
                Every document executes through this sequential process from upload to match serialization.
              </p>
            </div>
            <Zap className="size-5 text-accent hidden sm:block" />
          </div>

          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            style={{ gap: '24px' }}
          >
            {PIPELINE_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="surface-card rounded-2xl border border-border-subtle hover:border-border-medium transition-colors shadow-sm"
                  style={{ 
                    padding: '28px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between' 
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="font-mono text-xs font-bold text-accent bg-accent/10 rounded-lg border border-accent/20"
                        style={{ padding: '4px 10px' }}
                      >
                        STAGE {stage.step}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-content-muted uppercase tracking-wider">
                        {stage.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="size-9 rounded-xl bg-highlight border border-border-subtle flex items-center justify-center shrink-0 text-content">
                        <Icon className="size-4.5 text-accent" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-content leading-snug">
                        {stage.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-content-secondary leading-relaxed pt-1">
                      {stage.desc}
                    </p>
                  </div>

                  <div 
                    className="border-t border-border-subtle text-[11px] font-mono text-content-muted"
                    style={{ paddingTop: '16px', marginTop: '16px' }}
                  >
                    Parameters: {stage.metrics}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CLASSIFICATION CRITERIA TABLE ───────────────────────────── */}
        <div className="space-y-4" style={{ marginBottom: '56px' }}>
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-content tracking-tight">
              Classification Standard &amp; Similarity Tiers
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Objective risk classification based on composite 60/40 similarity scores.
            </p>
          </div>

          <div className="surface-card rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
            <div className="divide-y divide-border-subtle">
              {CLASSIFICATION_TIERS.map((tier) => (
                <div 
                  key={tier.label} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-highlight/50 transition-colors"
                  style={{ padding: '16px 24px' }}
                >
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <span className="font-mono text-xs font-bold text-content w-24">
                      {tier.range}
                    </span>
                    <span 
                      className={`rounded-md text-xs font-semibold border ${tier.bg} ${tier.border} ${tier.color}`}
                      style={{ padding: '2px 10px' }}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-content-secondary sm:w-2/3 leading-relaxed">
                    {tier.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CORE TECHNOLOGY STACK ───────────────────────────────────── */}
        <div className="space-y-4" style={{ marginBottom: '56px' }}>
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-content tracking-tight">
              Core Engineering Stack
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Underlying algorithmic toolkits and infrastructure.
            </p>
          </div>

          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ gap: '24px' }}
          >
            {TECH_STACK.map((tech) => {
              const Icon = tech.icon;
              return (
                <div 
                  key={tech.title} 
                  className="surface-card rounded-2xl border border-border-subtle space-y-3 shadow-sm hover:border-border-medium transition-colors"
                  style={{ padding: '24px' }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-xl flex items-center justify-center border ${tech.bg} ${tech.border}`}>
                      <Icon className={`size-4.5 ${tech.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-content">{tech.title}</h4>
                      <p className="text-[11px] font-mono text-content-muted">{tech.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div 
          className="surface-card rounded-2xl border border-border-subtle text-center space-y-4 shadow-sm"
          style={{ padding: '40px 24px' }}
        >
          <h3 className="text-xl font-bold text-content">Experience the pipeline in action</h3>
          <p className="text-xs sm:text-sm text-content-secondary max-w-lg mx-auto leading-relaxed">
            Upload a document now to trigger the semantic vector and lexical containment engine.
          </p>
          <div className="pt-2">
            <Link
              to="/analyze"
              className="btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <span>Launch Analyzer</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}