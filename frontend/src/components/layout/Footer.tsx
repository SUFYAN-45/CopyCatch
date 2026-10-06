import { Link } from 'react-router-dom';
import { FileSearch, GitBranch } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/6 bg-zinc-950/60 backdrop-blur-sm mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-indigo-600/80 flex items-center justify-center">
            <FileSearch className="size-3.5 text-white" />
          </div>
          <span className="font-medium text-zinc-400">CopyCatch</span>
          <span>— Detect Similarity. Understand the Match.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/about" className="hover:text-zinc-300 transition-colors">How It Works</Link>
          <a
            href="https://github.com/SUFYAN-45/CopyCatch"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <GitBranch className="size-4" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
