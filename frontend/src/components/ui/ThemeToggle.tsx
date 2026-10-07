import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check local storage first
    const saved = localStorage.getItem('copycatch-theme');
    if (saved) return saved === 'dark';
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('copycatch-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('copycatch-theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative p-2 rounded-lg text-content-secondary hover:text-content hover:bg-surface-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent overflow-hidden flex items-center justify-center"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          y: isDark ? 0 : -30,
          opacity: isDark ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="size-4.5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          y: isDark ? 30 : 0,
          opacity: isDark ? 0 : 1
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="size-4.5" />
      </motion.div>
      
      {/* Invisible placeholder to maintain width/height */}
      <div className="size-4.5 opacity-0" />
    </button>
  );
}
