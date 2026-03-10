export function Footer() {
  return (
    <footer className="border-t border-medium-gray/30 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm text-medium-gray">
          &copy; {new Date().getFullYear()} Endeavor. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
