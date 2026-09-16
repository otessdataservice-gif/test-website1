import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Log in to TaskFlow
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Enter the email and password you registered with.
          </p>

          <form onSubmit={handleSubmit} className="card mt-6 p-5 sm:p-6" noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input"
                  value={form.email}
                  onChange={update('email')}
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  value={form.password}
                  onChange={update('password')}
                  disabled={submitting}
                  required
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                >
                  {error}
                </p>
              )}
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary mt-6 w-full">
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
            No account yet?{' '}
            <Link
              to="/register"
              className="rounded font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
