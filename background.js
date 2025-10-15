
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "focus-youtube-search") return;

  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tab || !tab.id || !/^https:\/\/www\.youtube\.com\//.test(tab.url || "")) return;

  // Ask the content script on that tab to focus the search box
  chrome.tabs.sendMessage(tab.id, {type: "focusSearch"});
});
