// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-28 bg-gray-200 rounded-xl" />
        <div className="h-28 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-10 bg-gray-200 rounded-xl" />
      <div className="grid gap-3">
        <div className="h-24 bg-gray-200 rounded-md" />
        <div className="h-24 bg-gray-200 rounded-md" />
      </div>
    </div>
  )
}
