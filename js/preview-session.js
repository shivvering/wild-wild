(function () {
  var IDLE_MS = 45 * 60 * 1000;
  var CHECK_MS = 60 * 1000;
  var BUMP_THROTTLE_MS = 30 * 1000;
  var STORAGE_KEY = "ww-preview-last-activity";

  if (window.location.pathname === "/password") return;

  function now() {
    return Date.now();
  }

  function getLastActivity() {
    var value = localStorage.getItem(STORAGE_KEY);
    return value ? parseInt(value, 10) : 0;
  }

  function setLastActivity(timestamp) {
    localStorage.setItem(STORAGE_KEY, String(timestamp));
  }

  function isIdle() {
    var last = getLastActivity();
    return last > 0 && now() - last >= IDLE_MS;
  }

  var loggingOut = false;

  function logout() {
    if (loggingOut) return;
    loggingOut = true;

    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .catch(function () {})
      .finally(function () {
        localStorage.removeItem(STORAGE_KEY);
        window.location.replace("/password");
      });
  }

  var lastBump = 0;

  function bumpActivity() {
    if (isIdle()) {
      logout();
      return;
    }

    var current = now();
    if (current - lastBump < BUMP_THROTTLE_MS) return;
    lastBump = current;
    setLastActivity(current);
  }

  function checkIdle() {
    if (isIdle()) logout();
  }

  if (!getLastActivity()) {
    setLastActivity(now());
  } else if (isIdle()) {
    logout();
    return;
  }

  [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click",
  ].forEach(function (eventName) {
    document.addEventListener(eventName, bumpActivity, { passive: true });
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") checkIdle();
  });

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY && event.newValue === null) {
      window.location.replace("/password");
    }
  });

  setInterval(checkIdle, CHECK_MS);
})();
