import { motion } from 'framer-motion';
import { Sparkles, Search, Layers, BarChart2, FileText, BookMarked, Shield } from 'lucide-react';

const PIPELINE = [
  {
    step: '01',
    icon: FileText,
    title: 'Document Ingestion',
    desc: 'Upload TXT, PDF, or DOCX. CopyCatch validates the file via magic-byte inspection, sanitizes the filename against path-traversal attacks, and enforces a 15 MB size limit.',
  },
  {
    step: '02',
    icon: Search,
    title: 'Text Extraction & Preprocessing',
    desc: 'Raw bytes are parsed by format-specific extractors (pypdf, python-docx, UTF-8/Latin-1 fallback). Text is then cleaned, normalized, and split into overlapping sentence windows (~50 words each) for fine-grained analysis.',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'Semantic Similarity (AI Embeddings)',
    desc: 'Each text chunk is encoded into a 384-dimensional dense vector using the all-MiniLM-L6-v2 sentence transformer. Cosine similarity is computed between every submission chunk and every reference chunk using matrix dot products.',
  },
  {
    step: '04',
    icon: Layers,
    title: 'Lexical Similarity (TF-IDF + N-Grams)',
    desc: 'Scikit-learn\'s TF-IDF vectorizer (sublinear TF, unigrams–trigrams) computes full-document cosine similarity. A separate word 3-gram containment score captures near-verbatim matches.',
  },
  {
    step: '05',
    icon: BarChart2,
    title: 'Hybrid Scoring & Classification',
    desc: 'Scores are combined: Hybrid = (0.60 × Semantic) + (0.40 × Lexical). The final score is classified into five bands: Very Low, Low, Moderate, High, and Very High Similarity.',
  },
  {
    step: '06',
    icon: Shield,
    title: 'Match Extraction & Reporting',
    desc: 'Passage pairs exceeding a 50% similarity threshold are extracted, tagged by type (semantic / lexical / hybrid), deduplicated, and ranked. The full report is persisted as a JSON file on disk.',
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.5 } } };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-grid pt-28 pb-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-6">
            <BookMarked className="size-3" /> Technical Overview
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">How CopyCatch Works</h1>
          <p className="text-zinc-400 leading-relaxed">
            CopyCatch is not a simple keyword matcher. It runs a multi-stage NLP pipeline that
            understands <em className="text-zinc-200">meaning</em>, not just text surface overlap.
          </p>
        </motion.div>

        {/* Pipeline */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative"
        >
          {/* Timeline line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/20 to-transparent" />

          <div className="space-y-8">
            {PIPELINE.map(({ step, icon: Icon, title, desc }) => (
              <motion.div key={step} variants={item} className="flex gap-6">
                {/* Step dot */}
                <div className="relative shrink-0">
                  <div className="size-11 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center z-10 relative">
                    <Icon className="size-5 text-indigo-400" />
                  </div>
                </div>
                {/* Content */}
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-zinc-600 font-mono tracking-widest">{step}</span>
                    <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 rounded-2xl border border-white/8 bg-zinc-900/50 p-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Technology Stack</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              ['Semantic Model',   'all-MiniLM-L6-v2 (Sentence Transformers)'],
              ['Lexical Engine',   'Scikit-learn TF-IDF + N-gram Containment'],
              ['API Framework',   'FastAPI (Python 3.13)'],
              ['Document Parsing','pypdf · python-docx · stdlib text'],
              ['Storage',         'Local JSON filesystem (no external DB)'],
              ['Frontend',        'React 18 · Vite · Tailwind CSS · Framer Motion'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-zinc-600 shrink-0 w-36">{label}</span>
                <span className="text-zinc-300 font-mono text-xs leading-relaxed">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
