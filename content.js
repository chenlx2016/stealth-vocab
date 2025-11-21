// Content script for Stealth Vocab Extension
// Handles keyboard shortcuts with proper user gesture context

console.log('Stealth Vocab content script loaded');

document.addEventListener('keydown', (event) => {
  // Check for Ctrl+Shift+V (Windows/Linux) or Cmd+Shift+V (Mac)
  const isCtrlShiftV = event.ctrlKey && event.shiftKey && event.key === 'V';
  const isCmdShiftV = event.metaKey && event.shiftKey && event.key === 'V';

  if (isCtrlShiftV || isCmdShiftV) {
    event.preventDefault();
    event.stopPropagation();

    console.log('Keyboard shortcut detected in content script');

    // Send message to background script with user gesture context
    chrome.runtime.sendMessage({
      action: 'toggle-sidepanel',
      timestamp: Date.now()
    });

    console.log('Message sent to background script');
  }
});

// Also handle the extension icon click as fallback
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked, opening side panel');
  chrome.runtime.sendMessage({
    action: 'toggle-sidepanel',
    timestamp: Date.now()
  });
});