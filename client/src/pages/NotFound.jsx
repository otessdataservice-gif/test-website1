import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16 text-center sm:px-6">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">404</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            The page you asked for does not exist.
          </p>
          <Link to="/" className="btn btn-primary mt-6">
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
