import Header from '../components/Header';
import Footer from '../components/Footer';

function Page({ title, updated, children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {title}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Last updated {updated}</p>
        <div className="mt-6 space-y-5 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-50">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export function Terms() {
  return (
    <Page title="Terms of use" updated="15 September 2026">
      <p>
        TaskFlow is a demonstration task manager. By creating an account you agree to the terms
        below.
      </p>

      <Section heading="Your account">
        <p>
          You are responsible for keeping your password private and for everything done from your
          account. Register with an email address you control, and tell us if you think someone else
          has access.
        </p>
      </Section>

      <Section heading="Acceptable use">
        <p>
          Do not use TaskFlow to store unlawful content, to attack the service, or to try to reach
          another person&apos;s tasks. Accounts that do any of this can be removed without notice.
        </p>
      </Section>

      <Section heading="Availability">
        <p>
          The service is provided as it is, with no guarantee of uptime or of data retention. This is
          a demonstration project, so keep a copy of anything you cannot afford to lose.
        </p>
      </Section>

      <Section heading="Ending your use">
        <p>
          You can stop using TaskFlow at any time. Ask us to remove your account and we will delete
          the account and its tasks.
        </p>
      </Section>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy policy" updated="15 September 2026">
      <p>This page explains what TaskFlow stores and why.</p>

      <Section heading="What we store">
        <p>
          Your name, your email address, a hashed version of your password, and the tasks you create.
          That is the whole list.
        </p>
      </Section>

      <Section heading="How your password is handled">
        <p>
          Passwords are hashed with bcrypt before they are saved. The plain password is never written
          to the database or to logs, and the hash is never sent back to the browser.
        </p>
      </Section>

      <Section heading="Who can see your tasks">
        <p>
          Only you. Every task is linked to your account, and the server checks that link on every
          read, edit, completion and delete.
        </p>
      </Section>

      <Section heading="Cookies and tracking">
        <p>
          TaskFlow sets no advertising or analytics cookies. Your login token and your light or dark
          mode preference are kept in your own browser storage, and logging out removes the token.
        </p>
      </Section>

      <Section heading="Deleting your data">
        <p>
          Deleting a task removes it from the database. Ask us to close your account and the account
          and all of its tasks are removed.
        </p>
      </Section>
    </Page>
  );
}
