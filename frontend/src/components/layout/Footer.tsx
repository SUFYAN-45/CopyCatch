import { Link } from 'react-router-dom';
import { FileSearch, GitBranch, Shield, Sparkles, Terminal } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface mt-auto transition-colors">
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-8 sm:mb-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-accent flex items-center justify-center shadow-sm">
                <FileSearch className="size-4 text-white stroke-[2.2]" />
              </div>
              <span className="font-bold text-lg tracking-tight text-content">
                Copy<span className="text-accent">Catch</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-highlight text-content-secondary border border-border-subtle">
                v1.0.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-sm">
              Algorithmic plagiarism and semantic similarity detection system combining dense vector embeddings with lexical n-gram containment.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-content-secondary bg-highlight border border-border-subtle rounded-md px-2.5 py-1">
                <Sparkles className="size-3 text-purple-600 dark:text-purple-400" /> all-MiniLM-L6-v2
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-content-secondary bg-highlight border border-border-subtle rounded-md px-2.5 py-1">
                <Terminal className="size-3 text-cyan-600 dark:text-cyan-400" /> TF-IDF + N-Grams
              </span>
            </div>
          </div>

          {/* Tools & Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content font-mono">
              Tools &amp; Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-content-secondary">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Overview</Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-accent transition-colors">Analyze Document</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-accent transition-colors">Analysis History</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-colors">NLP Pipeline &amp; Architecture</Link>
              </li>
            </ul>
          </div>

          {/* Resources & Engineering */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content font-mono">
              Resources &amp; Engineering
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-content-secondary">
              <li>
                <a
                  href="https://github.com/SUFYAN-45/CopyCatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors inline-flex items-center gap-1.5"
                >
                  <GitBranch className="size-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Local Storage &amp; Privacy First</span>
              </li>
              <li className="text-xs text-content-muted">
                Final Year Engineering Capstone
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom border & copyright */}
        <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-content-muted">
          <p>&copy; {CURRENT_YEAR} CopyCatch. Intelligent Plagiarism Detection.</p>
          <p className="text-center sm:text-right">
            Designed for objective textual analysis and academic similarity research.
          </p>
        </div>
      </div>
    </footer>
  );
}