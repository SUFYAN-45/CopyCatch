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
import { ThemeToggle } from '../ui/ThemeToggle';

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
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border-subtle bg-base/80 backdrop-blur-xl transition-colors">
      <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1"
          onClick={() => setMobileOpen(false)}
        >
          <div className="relative size-9 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <FileSearch className="size-4.5 text-white stroke-[2.2]" />
            <div className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent-light ring-2 ring-base" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-[15px] tracking-tight text-content group-hover:text-accent transition-colors">
                Copy<span className="text-accent">Catch</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider text-accent bg-accent/10 border border-accent/20">
                AI NLP
              </span>
            </div>
            <span className="text-[10px] text-content-secondary font-normal tracking-normal mt-0.5 hidden sm:block">
              Forensic Plagiarism Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-elevated border border-border-subtle rounded-xl px-2 py-1 shadow-sm">
          {NAV_ITEMS.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive ? 'text-content' : 'text-content-secondary hover:text-content'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-highlight border border-border-subtle"
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

        {/* Right Section: Theme & CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/analyze"
            id="nav-cta-analyze"
            className="group inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all duration-150 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>Run Analysis</span>
            <ArrowRight className="size-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger & Theme */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            id="navbar-menu-toggle"
            type="button"
            className="p-2 rounded-lg text-content-secondary hover:text-content hover:bg-highlight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="md:hidden border-b border-border-subtle bg-base/95 backdrop-blur-xl px-4 py-4 space-y-1.5 shadow-2xl"
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
                      ? 'bg-accent/10 text-accent border border-accent/20' 
                      : 'text-content-secondary hover:bg-highlight hover:text-content'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </div>
                  {isActive && <span className="size-1.5 rounded-full bg-accent" />}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-border-subtle">
              <Link
                to="/analyze"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-colors shadow-sm"
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
