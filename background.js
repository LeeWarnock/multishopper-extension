// Background service worker

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openSplitView') {
        openSplitView(message.query, message.retailers);
    }
});

// Open split view in a new tab
async function openSplitView(query, retailers) {
    // Create the split view URL with query parameters
    const params = new URLSearchParams();
    params.set('query', query);
    params.set('retailers', JSON.stringify(retailers));
    
    const splitViewUrl = chrome.runtime.getURL('splitview.html') + '?' + params.toString();
    
    // Open in a new tab
    await chrome.tabs.create({ url: splitViewUrl });
}

// Enable side panel for all tabs
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
