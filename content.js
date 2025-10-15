// Try to find the search input by class, with fallbacks and a light retry if it's not in the DOM yet.
function focusSearch() {
  const candidates = [
    '.yt-searchbox-input',        // your specified class
    'input#search',               // common fallback
    'input[name="search_query"]'  // extra fallback
  ];
  let input = null;
  for (const sel of candidates) {
    input = document.querySelector(sel);
    if (input) break;
  }
  if (input) {
    input.focus();
    input.select?.();
    return true;
  }
  return false;
}

// In case the element isn't there yet (SPA navigation), observe briefly.
function focusWithRetry() {
  if (focusSearch()) return;

  const observer = new MutationObserver(() => {
    if (focusSearch()) {
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement || document.body, {childList: true, subtree: true});

  // Safety stop after 3 seconds
  setTimeout(() => observer.disconnect(), 3000);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "focusSearch") {
    focusWithRetry();
  }
});

// Optional: If you *try* to catch Ctrl+K on-page (won’t beat Chrome’s reserved shortcut):
document.addEventListener('keydown', (e) => {
  const inEditable = e.target && (
    e.target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
  );
  // Only act if not already typing in a field
  if (!inEditable && e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k') {
    // This likely won't fire because Chrome intercepts Ctrl+K first.
    e.preventDefault();
    focusWithRetry();
  }
}, {capture: true});
