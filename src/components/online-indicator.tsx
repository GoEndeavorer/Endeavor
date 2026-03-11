"use client";

import { useState, useEffect } from "react";

export function OnlineIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    function handleOnline() { setOnline(true); }
    function handleOffline() { setOnline(false); }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] bg-red-500/90 px-4 py-2 text-center text-xs font-semibold text-black">
      You are offline. Some features may be unavailable.
    </div>
  );
}
