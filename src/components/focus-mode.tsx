"use client";

import { useState, useEffect, createContext, useContext } from "react";

type FocusModeContextType = {
  focusMode: boolean;
  toggleFocusMode: () => void;
};

const FocusModeContext = createContext<FocusModeContextType>({
  focusMode: false,
  toggleFocusMode: () => {},
});

export function useFocusMode() {
  return useContext(FocusModeContext);
}

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("endeavor-focus-mode");
    if (stored === "true") setFocusMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("endeavor-focus-mode", String(focusMode));
    if (focusMode) {
      document.body.classList.add("focus-mode");
    } else {
      document.body.classList.remove("focus-mode");
    }
  }, [focusMode]);

  const toggleFocusMode = () => setFocusMode((prev) => !prev);

  return (
    <FocusModeContext.Provider value={{ focusMode, toggleFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function FocusModeToggle() {
  const { focusMode, toggleFocusMode } = useFocusMode();

  return (
    <button
      onClick={toggleFocusMode}
      className={`fixed bottom-14 right-4 z-[70] flex items-center gap-2 border px-3 py-1.5 text-xs font-mono transition-all ${
        focusMode
          ? "border-code-green/50 bg-code-green/10 text-code-green"
          : "border-medium-gray/20 bg-black text-medium-gray hover:text-light-gray"
      }`}
      title={focusMode ? "Exit focus mode" : "Enter focus mode (hide distractions)"}
    >
      <span>{focusMode ? "[*]" : "[ ]"}</span>
      <span>{focusMode ? "Focus ON" : "Focus"}</span>
    </button>
  );
}
