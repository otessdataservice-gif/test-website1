import { Link } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

/**
 * One header for the whole app. On the dashboard it shows the signed in user
 * and a logout button; on public pages it shows the login and register links.
 */
export default function Header({ variant = 'public' }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo to={variant === 'app' ? '/dashboard' : '/'} />

        <div className="flex items-center gap-2 sm:gap-3">
          {variant === 'app' && user ? (
            <>
              <span className="hidden text-sm text-neutral-600 dark:text-neutral-400 sm:inline">
                Signed in as{' '}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{user.name}</span>
              </span>
              <ThemeToggle />
              <button type="button" onClick={logout} className="btn btn-secondary btn-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
