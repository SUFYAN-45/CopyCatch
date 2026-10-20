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
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-base/95 backdrop-blur-xl transition-colors" style={{ height: '72px' }}>
      <div className="page-container h-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
          style={{ textDecoration: 'none' }}
          onClick={() => setMobileOpen(false)}
        >
          <div className="relative size-9 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center shadow-sm">
            <FileSearch className="size-4.5 text-white stroke-[2.2]" />
            <div className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent-light ring-2 ring-base" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 leading-none">
              <span className="font-bold text-base tracking-tight text-content group-hover:text-accent transition-colors">
                Copy<span className="text-accent">Catch</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20">
                AI NLP
              </span>
            </div>
            <span className="text-[10px] text-content-secondary font-normal tracking-normal mt-0.5 hidden sm:block">
              Forensic Plagiarism Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links - explicit gap: 32px */}
        <nav className="hidden md:flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {NAV_ITEMS.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  isActive ? 'text-accent font-semibold' : 'text-content-secondary'
                }`}
                style={{ padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Theme Toggle & CTA */}
        <div className="hidden md:flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
          <Link
            to="/analyze"
            id="nav-cta-analyze"
            className="btn-primary"
            style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
          >
            <span>Run Analysis</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            id="navbar-menu-toggle"
            type="button"
            className="p-2 rounded-xl text-content-secondary hover:text-content hover:bg-highlight transition-colors cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
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
            className="md:hidden border-b border-border-subtle bg-base px-6 py-4 space-y-2 shadow-xl"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-accent/10 text-accent font-semibold' 
                      : 'text-content-secondary hover:bg-highlight hover:text-content'
                  }`}
                  style={{ textDecoration: 'none' }}
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
                className="btn-primary w-full"
                style={{ width: '100%', padding: '10px 20px' }}
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