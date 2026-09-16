import { useTheme } from '../context/ThemeContext';

/* Inline SVG rather than emoji: the sun and moon glyphs fall back to a box on
   some Windows font stacks. */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-secondary btn-sm h-9 w-9 p-0"
      aria-label={label}
      title={label}
      aria-pressed={isDark}
    >
      <span aria-hidden="true" className={isDark ? 'text-amber-500' : 'text-neutral-600'}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
