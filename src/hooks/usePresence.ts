import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks user online/offline status automatically.
 * Sets is_online=true on mount and periodically,
 * sets is_online=false on logout, tab close, or visibility hidden.
 */
export function usePresence(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    const setOnline = () => {
      supabase
        .from("profiles")
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq("user_id", userId)
        .then();
    };

    const setOffline = () => {
      supabase
        .from("profiles")
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq("user_id", userId)
        .then();
    };

    // Go online immediately
    setOnline();

    // Heartbeat every 30s
    const heartbeat = setInterval(setOnline, 30000);

    // Visibility change
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setOnline();
      } else {
        setOffline();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Before unload (browser close / navigate away)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`;
      const body = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
      navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setOffline();
    };
  }, [userId]);
}
