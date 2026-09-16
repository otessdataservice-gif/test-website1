import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MIN_PASSWORD = 8;

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const name = form.name.trim();
    const email = form.email.trim();

    // The backend validates all of this again; this is just faster feedback.
    if (!name || !email || !form.password) {
      setError('Fill in your name, email and password.');
      return;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (form.password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await register(name, email, form.password);
      toast.success('Account created. Welcome to TaskFlow.');
      navigate('/dashboard', { replace: true });
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            It takes about twenty seconds and your list is ready straight away.
          </p>

          <form onSubmit={handleSubmit} className="card mt-6 p-5 sm:p-6" noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="label">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="input"
                  value={form.name}
                  onChange={update('name')}
                  disabled={submitting}
                  required
                />
              </div>

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
                  autoComplete="new-password"
                  className="input"
                  value={form.password}
                  onChange={update('password')}
                  disabled={submitting}
                  minLength={MIN_PASSWORD}
                  required
                  aria-describedby="password-hint"
                />
                <p id="password-hint" className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  At least {MIN_PASSWORD} characters.
                </p>
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
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already registered?{' '}
            <Link
              to="/login"
              className="rounded font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
