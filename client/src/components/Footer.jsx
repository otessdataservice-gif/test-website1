import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400 sm:flex-row sm:px-6">
        <p>&copy; {new Date().getFullYear()} TaskFlow</p>
        <nav className="flex items-center gap-4" aria-label="Legal">
          <Link to="/terms" className="rounded hover:text-emerald-700 dark:hover:text-emerald-400">
            Terms
          </Link>
          <Link to="/privacy" className="rounded hover:text-emerald-700 dark:hover:text-emerald-400">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
