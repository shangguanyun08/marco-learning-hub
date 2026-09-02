(function installActiveStudyTracker() {
  "use strict";

  const script = document.currentScript;
  const appId = script?.dataset.appId || "";
  const courseName = script?.dataset.course || "Learning site";
  const API_URL = "https://marco-round1-missed-mastery.alexsoton.chatgpt.site/api/shared/activity";
  const ACTIVE_WINDOW_MS = 90_000;
  const HEARTBEAT_MS = 20_000;
  let lastEngagedAt = 0;
  let lastSavedMinute = "";
  let saving = false;

  if (!appId) return;

  async function saveMinute() {
    if (saving || document.visibilityState !== "visible") return;
    if (!lastEngagedAt || Date.now() - lastEngagedAt > ACTIVE_WINDOW_MS) return;
    const activeAt = new Date().toISOString();
    const minute = activeAt.slice(0, 16);
    if (minute === lastSavedMinute) return;
    saving = true;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        cache: "no-store",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ appId, courseName, activeAt }),
      });
      if (response.ok) lastSavedMinute = minute;
    } catch {
      // A later heartbeat retries quietly when the connection returns.
    } finally {
      saving = false;
    }
  }

  function markEngaged() {
    if (document.visibilityState !== "visible") return;
    lastEngagedAt = Date.now();
    void saveMinute();
  }

  ["pointerdown", "keydown", "input", "scroll", "touchstart"].forEach(function(eventName) {
    window.addEventListener(eventName, markEngaged, { passive: true, capture: true });
  });
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") markEngaged();
  });
  window.setInterval(function() { void saveMinute(); }, HEARTBEAT_MS);
})();
