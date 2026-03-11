"use client";

import { useEffect, useRef } from "react";

type Shortcut = {
  keys: string[];
  label: string;
  section: string;
};

type KeyboardShortcutsModalProps = {
  open: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
};

function groupBySection(shortcuts: Shortcut[]): Record<string, Shortcut[]> {
  const groups: Record<string, Shortcut[]> = {};
  for (const s of shortcuts) {
    if (!groups[s.section]) groups[s.section] = [];
    groups[s.section].push(s);
  }
  return groups;
}

function KeyLabel({ keyName }: { keyName: string }) {
  const display =
    keyName === "Escape"
      ? "Esc"
      : keyName === "/"
        ? "/"
        : keyName;

  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded border border-medium-gray/30 bg-medium-gray/10 font-mono text-xs text-code-green">
      {display}
    </kbd>
  );
}

export function KeyboardShortcutsModal({
  open,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const sections = groupBySection(shortcuts);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg mx-4 rounded-lg border border-medium-gray/20 bg-black shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-medium-gray/20">
          <h2 className="font-mono text-sm font-semibold text-code-green tracking-wide uppercase">
            // keyboard_shortcuts
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded border border-medium-gray/20 text-medium-gray hover:text-light-gray hover:border-medium-gray/40 transition-colors font-mono text-xs"
          >
            x
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-5">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <h3 className="font-mono text-xs text-medium-gray uppercase tracking-wider mb-3">
                {`/* ${section} */`}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut) => (
                  <div
                    key={shortcut.keys.join("+")}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="font-mono text-sm text-light-gray">
                      {shortcut.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && (
                            <span className="text-medium-gray font-mono text-xs">
                              then
                            </span>
                          )}
                          <KeyLabel keyName={k} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-medium-gray/20">
          <p className="font-mono text-xs text-medium-gray text-center">
            Press <KeyLabel keyName="?" /> anytime to toggle this panel
          </p>
        </div>
      </div>
    </div>
  );
}
