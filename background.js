// Background script for Stealth Vocab Extension
// Handles global hotkey commands and extension lifecycle

let sidePanelOpen = false;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Stealth Vocab extension installed');

  // Set side panel to open when extension icon is clicked
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Handle keyboard shortcut from content script
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === 'toggle-sidepanel' && sender.tab?.id) {
    console.log('Received toggle request from tab:', sender.tab.id);
    toggleSidePanelForTab(sender.tab.id);
    return true; // Keep message channel open for async response
  }
});

// Handle command from manifest (backup method)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-sidepanel') {
    console.log('Command received from manifest');
    // This method has limitations, prefer content script approach
    chrome.action.openPopup();
  }
});

async function toggleSidePanelForTab(tabId) {
  try {
    console.log('Attempting to open side panel for tab:', tabId);

    // Enable side panel for this tab
    await chrome.sidePanel.setOptions({
      tabId: tabId,
      enabled: true
    });

    // Open side panel - this works because it's triggered by user gesture
    chrome.sidePanel.open({ tabId: tabId });
    sidePanelOpen = true;
    console.log('Side panel opened successfully for tab:', tabId);

  } catch (error) {
    console.error('Error opening side panel:', error);

    // Fallback: simulate extension icon click
    chrome.action.openPopup();
  }
}

async function getCurrentWindowId() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab.windowId;
  } catch (error) {
    console.error('Error getting current window ID:', error);
    return chrome.windows.WINDOW_ID_CURRENT;
  }
}

// Handle side panel state changes
chrome.sidePanel.onClosed.addListener(() => {
  sidePanelOpen = false;
  console.log('Side panel was closed');
});