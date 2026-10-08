export function ToolLoadingSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-stone-200 h-28 flex items-center justify-between">
        <div className="space-y-3 w-2/3">
          <div className="h-4 bg-stone-200 rounded w-1/4"></div>
          <div className="h-6 bg-stone-200 rounded w-1/2"></div>
        </div>
        <div className="h-10 bg-stone-200 rounded-xl w-32"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-stone-200 h-96 space-y-4">
          <div className="h-4 bg-stone-200 rounded w-1/3"></div>
          <div className="h-64 bg-stone-100 rounded-2xl"></div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-stone-200 h-96 space-y-4">
          <div className="h-4 bg-stone-200 rounded w-1/3"></div>
          <div className="h-64 bg-stone-100 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
