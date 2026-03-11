export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin border-2 border-medium-gray border-t-code-green" />
        <p className="text-sm text-medium-gray">Loading...</p>
      </div>
    </div>
  );
}
