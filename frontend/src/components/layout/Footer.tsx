import { Link } from 'react-router-dom';
import { FileSearch, GitBranch, Shield, Sparkles, Terminal } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-border-strong bg-base mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-accent/90 flex items-center justify-center border border-accent-hover/30 shadow-sm">
                <FileSearch className="size-4 text-white stroke-[2.2]" />
              </div>
              <span className="font-bold text-lg tracking-tight text-content">
                Copy<span className="text-accent">Catch</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-highlight text-content-muted border border-border-subtle">
                v1.0.0
              </span>
            </div>
            <p className="text-sm text-content-secondary leading-relaxed max-w-xs">
              Algorithmic plagiarism and semantic similarity detection system combining dense vector embeddings with lexical n-gram analysis.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-content-secondary bg-surface border border-border-subtle rounded-md px-2.5 py-1">
                <Sparkles className="size-3 text-purple-600 dark:text-purple-400" /> all-MiniLM-L6-v2
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-content-secondary bg-surface border border-border-subtle rounded-md px-2.5 py-1">
                <Terminal className="size-3 text-cyan-600 dark:text-cyan-400" /> TF-IDF + N-Grams
              </span>
            </div>
          </div>

          {/* Tools & Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content font-mono">
              Tools & Navigation
            </h4>
            <ul className="space-y-3 text-sm text-content-secondary">
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
                <Link to="/about" className="hover:text-accent transition-colors">NLP Pipeline & Architecture</Link>
              </li>
            </ul>
          </div>

          {/* Resources & Engineering */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content font-mono">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-content-secondary">
              <li>
                <a
                  href="https://github.com/SUFYAN-45/CopyCatch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors inline-flex items-center gap-2"
                >
                  <GitBranch className="size-4" /> GitHub Repository
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="size-4 text-emerald-600 dark:text-emerald-400" /> Local Storage & Privacy
              </li>
              <li className="text-xs">
                Final Year Engineering Capstone
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom border & copyright */}
        <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
          <p>&copy; {CURRENT_YEAR} CopyCatch. Intelligent Plagiarism Detection.</p>
          <p className="text-center sm:text-right">
            Designed for objective textual analysis and academic similarity research.
          </p>
        </div>
      </div>
    </footer>
  );
}
