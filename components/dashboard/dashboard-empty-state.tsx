export function DashboardEmptyState({
  title,
  description = "This workspace is ready.\nContent coming soon.",
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="glass-card w-full max-w-lg px-8 py-12">
        <h2 className="font-display text-3xl text-white">{title}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#A7A7A7]">
          {description}
        </p>
      </div>
    </div>
  )
}
