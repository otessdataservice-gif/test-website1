export default function Spinner({ label = 'Loading', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 ${className}`}>
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-emerald-600 dark:border-neutral-700 dark:border-t-emerald-500"
      />
      <span>{label}</span>
    </span>
  );
}
