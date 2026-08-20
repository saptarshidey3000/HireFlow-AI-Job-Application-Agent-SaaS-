export function DashboardEmptyState({
  title,
  description = "This workspace is ready.\nContent coming soon.",
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full max-w-lg rounded-lg border-2 border-[#2d3835] bg-[#181818] px-8 py-12 shadow-[4px_4px_0px_0px_#0d3b2e]">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-white">{title}</h2>
        <p className="mt-3 whitespace-pre-line text-xs font-medium leading-relaxed text-[#A7A7A7]">
          {description}
        </p>
      </div>
    </div>
  )
}
