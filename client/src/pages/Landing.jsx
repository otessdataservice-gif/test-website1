import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FEATURES = [
  {
    title: 'One list, always current',
    body: 'Add a task in two fields, edit it in place, and delete it when it stops mattering.',
  },
  {
    title: 'Tick things off',
    body: 'Mark a task complete, or put it back to active if it turns out you were not done.',
  },
  {
    title: 'Only you see your tasks',
    body: 'Every task is tied to your account and the server checks that on every request.',
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Task manager
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
              Organize your work. Finish what matters.
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
              TaskFlow keeps your to-do list in one place. Write down what you have to do, tick it
              off when it is done, and pick up the same list on any device you sign in from.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn btn-primary">
                Create free account
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Log in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              What you get
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="card p-5">
                  <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
