const CARDS = [
  { key: 'total', label: 'Total tasks' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
];

export default function StatsCards({ stats }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {CARDS.map(({ key, label }) => (
        <div key={key} className="card px-4 py-4">
          <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
              {stats[key]}
            </span>
            {key === 'completed' && stats.total > 0 && (
              <span className="text-sm text-emerald-700 dark:text-emerald-400">
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
