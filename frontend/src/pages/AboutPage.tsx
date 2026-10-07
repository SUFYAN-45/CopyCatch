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
  Terminal,
  ArrowDown
} from 'lucide-react';

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
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
    bg: 'bg-indigo-500/10',
  },
  {
    title: 'Scikit-Learn',
    subtitle: 'TF-IDF & N-Grams',
    desc: 'Sublinear term frequency vectorizer with unigram to trigram vocabulary analysis and word containment checking.',
    icon: Terminal,
    color: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/10',
  },
  {
    title: 'FastAPI',
    subtitle: 'Python 3.13 Backend',
    desc: 'High-performance asynchronous REST API architecture handling multipart document uploads and analysis pipelines.',
    icon: Cpu,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'React & Vite',
    subtitle: 'Modern UI Engine',
    desc: 'TypeScript-powered reactive single-page frontend with responsive layouts and fluid state transitions.',
    icon: Binary,
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Tailwind CSS',
    subtitle: 'Custom Design System',
    desc: 'Sophisticated typography, tailored color tokens, dark elevation layers, and responsive CSS grid architectures.',
    icon: Layers,
    color: 'text-sky-400',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/10',
  },
  {
    title: 'Local JSON Storage',
    subtitle: 'Zero External Database',
    desc: 'File-based persistence ensuring 100% data sovereignty, zero cloud database leaks, and complete local execution.',
    icon: BookMarked,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
  },
];

const SEVERITY_BANDS = [
  { range: '0 – 20%',  label: 'Very Low Similarity', desc: 'Negligible overlap; original phrasing and conceptual framing.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { range: '21 – 40%', label: 'Low Similarity',      desc: 'Incidental terminology or conventional domain phrasing.', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  { range: '41 – 60%', label: 'Moderate Similarity', desc: 'Partial paraphrasing or localized matching passages detected.', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { range: '61 – 80%', label: 'High Similarity',     desc: 'Substantial textual and semantic correspondence identified.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { range: '81 – 100%',label: 'Very High Similarity',desc: 'Near-verbatim reproduction or extensive replication across multiple sections.', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
];

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1 text-xs font-mono font-medium text-indigo-300">
            <Cpu className="size-3.5" />
            <span>NLP Pipeline & Mathematical Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            How CopyCatch Analyzes Text
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            CopyCatch executes a multi-stage NLP pipeline that evaluates conceptual meaning through transformer embeddings and literal word usage through statistical n-grams.
          </p>
        </div>

        {/* ── Section 1: The 6-Stage NLP Pipeline ─────────────────────── */}
        <section className="space-y-6">
          <div className="border-b border-white/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Six-Stage Detection Pipeline
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                From raw byte ingestion to forensic ranked similarity reporting.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-400">
              End-to-End Local Execution
            </span>
          </div>

          <div className="space-y-4">
            {PIPELINE_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.step} className="relative">
                  <div className="surface-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] hover:border-white/[0.13] transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xl sm:text-2xl font-bold text-indigo-400">
                          {stage.step}
                        </span>
                        <div className="size-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                          <Icon className="size-4.5 text-indigo-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                          {stage.title}
                        </h3>
                      </div>

                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.06]">
                        {stage.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                      {stage.desc}
                    </p>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>Parameters:</span>
                      <span className="text-indigo-300 font-medium">{stage.metrics}</span>
                    </div>
                  </div>

                  {/* Flow connector arrow (except last) */}
                  {idx < PIPELINE_STAGES.length - 1 && (
                    <div className="flex justify-center my-1 text-zinc-700">
                      <ArrowDown className="size-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section 2: Severity Classification Bands ────────────────── */}
        <section className="space-y-6">
          <div className="border-b border-white/[0.06] pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Calibrated Similarity Classifications
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Objective evaluation criteria based on hybrid similarity percentages.
            </p>
          </div>

          <div className="surface-card rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="divide-y divide-white/[0.05]">
              {SEVERITY_BANDS.map((band) => (
                <div 
                  key={band.label}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-zinc-400 w-20 shrink-0">
                      {band.range}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${band.bg} ${band.border} ${band.color}`}>
                      {band.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 sm:text-right max-w-md">
                    {band.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: Technology Stack ─────────────────────────────── */}
        <section className="space-y-6">
          <div className="border-b border-white/[0.06] pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Technology Stack
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Engineered with proven Python NLP toolchains and a responsive TypeScript frontend.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.title}
                  className="surface-card surface-card-hover rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`size-10 rounded-xl ${tech.bg} border ${tech.border} flex items-center justify-center`}>
                        <Icon className={`size-5 ${tech.color}`} />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                        Core Tech
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {tech.title}
                      </h3>
                      <span className="text-xs font-mono text-indigo-300 font-medium block mt-0.5">
                        {tech.subtitle}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {tech.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
