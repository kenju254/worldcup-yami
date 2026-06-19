"use client";

import { useTheme } from "./ThemeProvider";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div>
        <h1 className="text-gradient" style={{ margin: 0 }}>World Cup 2026</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '4px' }}>Real-time updates & Highlights</p>
      </div>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
