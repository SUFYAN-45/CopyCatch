import { 
  Sparkles, 
  Search, 
  Layers, 
  BarChart2, 
  FileText, 
  BookMarked, 
  ShieldCheck, 
  Cpu,
  Binary,
  Terminal
} from 'lucide-react';
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
    color: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-500/20',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    title: 'Scikit-Learn',
    subtitle: 'TF-IDF & N-Grams',
    desc: 'Sublinear term frequency vectorizer with unigram to trigram vocabulary analysis and word containment checking.',
    icon: Terminal,
    color: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-500/20',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
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
  {
    title: 'Tailwind CSS',
    subtitle: 'Custom Design System',
    desc: 'Sophisticated typography, tailored color tokens, dark elevation layers, and responsive CSS grid architectures.',
    icon: Layers,
    color: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-500/20',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
  },
  {
    title: 'Local JSON Storage',
    subtitle: 'Zero External Database',
    desc: 'File-based persistence ensuring 100% data sovereignty, zero cloud database leaks, and complete local execution.',
    icon: BookMarked,
    color: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/20',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
];

const SEVERITY_BANDS = [
  { range: '0 – 20%',  label: 'Very Low Similarity', desc: 'Negligible overlap; original phrasing and conceptual framing.', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
  { range: '21 – 40%', label: 'Low Similarity',      desc: 'Incidental terminology or conventional domain phrasing.', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/20' },
  { range: '41 – 60%', label: 'Moderate Similarity', desc: 'Partial paraphrasing or localized matching passages detected.', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20' },
  { range: '61 – 80%', label: 'High Similarity',     desc: 'Substantial textual and semantic correspondence identified.', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' },
  { range: '81 – 100%',label: 'Very High Similarity',desc: 'Near-verbatim reproduction or extensive replication across multiple sections.', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' },
];

export default function AboutPage() {
  return (
    <PageContainer withGrid={false} className="pt-10 pb-24">
      <div className="max-w-[1280px] mx-auto space-y-24">
        
        {/* Page Header */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-mono font-medium text-accent">
            <Cpu className="size-3.5" />
            <span>NLP Pipeline & Mathematical Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-content tracking-tight">
            How Copy<span className="text-accent">Catch</span> Analyzes Text
          </h1>

          <p className="text-base sm:text-lg text-content-secondary leading-relaxed max-w-2xl mx-auto">
            CopyCatch executes a multi-stage NLP pipeline that evaluates conceptual meaning through transformer embeddings and literal word usage through statistical n-grams.
          </p>
        </div>

        {/* ── Section 1: The 6-Stage NLP Pipeline (GRID LAYOUT) ─────────────── */}
        <section className="space-y-10">
          <div className="border-b border-border-subtle pb-5 text-center">
            <h2 className="text-2xl font-bold text-content tracking-tight">
              Six-Stage Detection Pipeline
            </h2>
            <p className="text-sm text-content-secondary mt-2">
              End-To-End Local Execution &bull; From raw byte ingestion to forensic ranked similarity reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {PIPELINE_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div key={stage.step} className="surface-card rounded-2xl p-6 sm:p-8 border border-border-subtle hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full group">
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div className="size-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                      <Icon className="size-6 text-accent" />
                    </div>
                    <span className="font-mono text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-accent to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity">
                      {stage.step}
                    </span>
                  </div>

                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-1 mb-3 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20">
                      {stage.badge}
                    </span>
                    <h3 className="text-lg font-bold text-content mb-3 leading-snug">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-content-secondary leading-relaxed mb-6">
                      {stage.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-content-muted mt-auto">
                    <span>Parameters:</span>
                    <span className="text-purple-600 dark:text-purple-300 font-semibold">{stage.metrics}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section: Formula Visual Block ─────────────────────────────── */}
        <section className="relative surface-card rounded-2xl p-10 sm:p-14 border border-border-subtle text-center overflow-hidden shadow-lg">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 via-accent to-blue-500 opacity-60" />
          <h2 className="text-sm font-bold text-content-muted mb-8 uppercase tracking-widest">Hybrid Scoring Formula</h2>
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-2xl sm:text-4xl font-mono font-black">
            <span className="text-content drop-shadow-sm">Hybrid</span>
            <span className="text-border-strong">=</span>
            <span className="text-purple-600 dark:text-purple-400 drop-shadow-sm">0.60 &times; Sem</span>
            <span className="text-border-strong">+</span>
            <span className="text-cyan-600 dark:text-cyan-400 drop-shadow-sm">0.40 &times; Lex</span>
          </div>
        </section>

        {/* ── Section 2: Severity Classification Bands ────────────────── */}
        <section className="space-y-10">
          <div className="border-b border-border-subtle pb-5 text-center">
            <h2 className="text-2xl font-bold text-content tracking-tight">
              Calibrated Similarity Classifications
            </h2>
            <p className="text-sm text-content-secondary mt-2">
              Objective evaluation criteria based on hybrid similarity percentages.
            </p>
          </div>

          <div className="surface-card rounded-2xl border border-border-subtle overflow-hidden max-w-4xl mx-auto shadow-sm">
            <div className="divide-y divide-border-subtle">
              {SEVERITY_BANDS.map((band) => (
                <div 
                  key={band.label}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-highlight transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-content-muted w-24 shrink-0">
                      {band.range}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${band.bg} ${band.border} ${band.color}`}>
                      {band.label}
                    </span>
                  </div>
                  <p className="text-sm text-content-secondary sm:text-right max-w-md leading-relaxed">
                    {band.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: Technology Stack ─────────────────────────────── */}
        <section className="space-y-10">
          <div className="border-b border-border-subtle pb-5 text-center">
            <h2 className="text-2xl font-bold text-content tracking-tight">
              Technology Stack
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_STACK.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.title} className="surface-card rounded-xl p-5 sm:p-6 border border-border-subtle flex flex-col sm:flex-row items-start gap-4 group hover:border-accent/30 hover:shadow-md transition-all">
                  <div className={`size-12 rounded-xl ${tech.bg} border ${tech.border} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className={`size-5 ${tech.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content group-hover:text-accent transition-colors">{tech.title}</h3>
                    <span className="text-xs font-mono font-medium text-content-muted block mb-2">{tech.subtitle}</span>
                    <p className="text-sm text-content-secondary leading-relaxed">{tech.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
