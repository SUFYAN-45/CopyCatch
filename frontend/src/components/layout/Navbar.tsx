import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FileSearch, LayoutDashboard, BookOpen, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/',         label: 'Home',      icon: LayoutDashboard },
  { to: '/analyze',  label: 'Analyze',   icon: FileSearch },
  { to: '/history',  label: 'History',   icon: BookOpen },
  { to: '/about',    label: 'How It Works', icon: Info },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-3 rounded-2xl border border-white/8 bg-zinc-950/80 backdrop-blur-xl px-5 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
            <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <FileSearch className="size-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              Copy<span className="text-indigo-400">Catch</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-white/8"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/analyze"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors duration-150 shadow-lg shadow-indigo-600/25"
            >
              Run Analysis
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            id="navbar-menu-toggle"
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden mx-4 mt-2 rounded-2xl border border-white/8 bg-zinc-950/95 backdrop-blur-xl p-4 space-y-1"
          >
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    active ? 'bg-indigo-600/20 text-indigo-300' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
