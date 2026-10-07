import { Link } from 'react-router-dom';
import { FileSearch, GitBranch, Shield, Sparkles, Terminal } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#07080c] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-indigo-600/90 flex items-center justify-center border border-indigo-400/30">
                <FileSearch className="size-3.5 text-white stroke-[2.2]" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">
                Copy<span className="text-indigo-400">Catch</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Algorithmic plagiarism and semantic similarity detection system combining dense vector embeddings (Sentence Transformers) with lexical n-gram analysis.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.06] rounded-md px-2 py-1">
                <Sparkles className="size-3 text-indigo-400" /> all-MiniLM-L6-v2
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.06] rounded-md px-2 py-1">
                <Terminal className="size-3 text-violet-400" /> TF-IDF + N-Grams
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link to="/" className="hover:text-zinc-200 transition-colors">Overview</Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-zinc-200 transition-colors">Analyze Document</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-zinc-200 transition-colors">Analysis History</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-zinc-200 transition-colors">NLP Pipeline & Architecture</Link>
              </li>
            </ul>
          </div>

          {/* Project Details */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
              Engineering
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <a
                  href="https://github.com/SUFYAN-45/CopyCatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <GitBranch className="size-3.5 text-zinc-400" /> GitHub Repository
                </a>
              </li>
              <li className="flex items-center gap-1 text-zinc-400">
                <Shield className="size-3.5 text-emerald-400" /> Local Storage & Privacy
              </li>
              <li className="text-[11px] text-zinc-400">
                Final Year Engineering Capstone
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom border & copyright */}
        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <p>© {CURRENT_YEAR} CopyCatch. Intelligent Plagiarism Detection.</p>
          <p className="text-zinc-400 text-center sm:text-right">
            Designed for objective textual analysis and academic similarity research.
          </p>
        </div>
      </div>
    </footer>
  );
}
