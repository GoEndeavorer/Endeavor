export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin border-2 border-medium-gray/30 border-t-code-green" />
        <div className="flex items-center justify-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full bg-code-green"
            style={{
              animation: "pulse-dot 1.4s ease-in-out infinite",
            }}
          />
          <p className="text-sm text-medium-gray">Loading...</p>
        </div>
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    </div>
  );
}
