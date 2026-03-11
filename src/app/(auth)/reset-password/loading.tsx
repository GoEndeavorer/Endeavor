export default function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="h-8 w-40 animate-pulse bg-medium-gray/10" />
        <div className="h-4 w-56 animate-pulse bg-medium-gray/10" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse bg-medium-gray/10" />
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse bg-medium-gray/10" />
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
        </div>
        <div className="h-4 w-32 mx-auto animate-pulse bg-medium-gray/10" />
      </div>
    </div>
  );
}
