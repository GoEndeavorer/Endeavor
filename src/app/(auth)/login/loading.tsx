export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="h-8 w-24 animate-pulse bg-medium-gray/10" />
        <div className="h-6 w-40 animate-pulse bg-medium-gray/10" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-12 animate-pulse bg-medium-gray/10" />
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse bg-medium-gray/10" />
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
        </div>
        <div className="h-4 w-48 mx-auto animate-pulse bg-medium-gray/10" />
      </div>
    </div>
  );
}
