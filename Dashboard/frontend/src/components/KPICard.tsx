interface KPICardProps {
  value: string | number
  label: string
  variant?: 'default' | 'accent' | 'success' | 'danger'
}

export function KPICard({ value, label, variant = 'default' }: KPICardProps) {
  const borderColor =
    variant === 'danger'
      ? 'border-l-rose-500'
      : variant === 'success'
        ? 'border-l-emerald-500'
        : variant === 'accent'
          ? 'border-l-indigo-500'
          : 'border-l-zinc-600'

  return (
    <div
      className={`
        rounded-xl border border-white/5 bg-white/[0.02] p-5
        backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04]
        border-l-4 ${borderColor}
      `}
    >
      <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  )
}
