import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileSearch, 
  LayoutDashboard, 
  BookOpen, 
  Info, 
  Menu, 
  X,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/',         label: 'Home',         icon: LayoutDashboard },
  { to: '/analyze',  label: 'Analyze',      icon: FileSearch },
  { to: '/history',  label: 'History',      icon: BookOpen },
  { to: '/about',    label: 'How It Works', icon: Info },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/[0.07] bg-[#090a0f]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          onClick={() => setMobileOpen(false)}
        >
          {/* Geometric Product Icon */}
          <div className="relative size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/20 border border-indigo-400/30 group-hover:shadow-indigo-500/30 transition-shadow">
            <FileSearch className="size-4.5 text-white stroke-[2.2]" />
            <div className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-indigo-300 ring-2 ring-[#090a0f]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-[15px] tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                Copy<span className="text-indigo-400">Catch</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                AI NLP
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-normal tracking-normal mt-0.5 hidden sm:block">
              Forensic Plagiarism Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] rounded-xl px-2 py-1">
          {NAV_ITEMS.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/analyze"
            id="nav-cta-analyze"
            className="group inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all duration-150 shadow-md shadow-indigo-600/20 border border-indigo-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span>Run Analysis</span>
            <ArrowRight className="size-3.5 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          id="navbar-menu-toggle"
          type="button"
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="md:hidden border-b border-white/[0.08] bg-[#0c0e15]/95 backdrop-blur-xl px-4 py-4 space-y-1.5 shadow-2xl"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </div>
                  {isActive && <span className="size-1.5 rounded-full bg-indigo-400" />}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-white/[0.06]">
              <Link
                to="/analyze"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/25"
              >
                <span>Run Analysis</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
