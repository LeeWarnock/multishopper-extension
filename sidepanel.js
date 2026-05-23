// Default retailers
const DEFAULT_RETAILERS = [
    { id: 'amazon', name: 'Amazon', searchUrl: 'https://www.amazon.com/s?k={query}', isDefault: true },
    { id: 'walmart', name: 'Walmart', searchUrl: 'https://www.walmart.com/search?q={query}', isDefault: true },
    { id: 'ebay', name: 'eBay', searchUrl: 'https://www.ebay.com/sch/i.html?_nkw={query}', isDefault: true },
    { id: 'target', name: 'Target', searchUrl: 'https://www.target.com/s?searchTerm={query}', isDefault: true },
    { id: 'bestbuy', name: 'Best Buy', searchUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st={query}', isDefault: true },
    { id: 'costco', name: 'Costco', searchUrl: 'https://www.costco.com/CatalogSearch?keyword={query}', isDefault: true }
];

// State
let retailers = [];
let selectedRetailers = new Set();

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const retailersList = document.getElementById('retailersList');
const addSiteBtn = document.getElementById('addSiteBtn');
const addSiteForm = document.getElementById('addSiteForm');
const siteNameInput = document.getElementById('siteName');
const siteUrlInput = document.getElementById('siteUrl');
const cancelAdd = document.getElementById('cancelAdd');
const confirmAdd = document.getElementById('confirmAdd');
const status = document.getElementById('status');

// Initialize
async function init() {
    await loadRetailers();
    renderRetailers();
    setupListeners();
}

// Load from storage
async function loadRetailers() {
    const result = await chrome.storage.sync.get(['retailers', 'selectedRetailers']);
    
    if (result.retailers) {
        retailers = result.retailers;
        // Merge with new defaults
        DEFAULT_RETAILERS.forEach(def => {
            if (!retailers.find(r => r.id === def.id)) {
                retailers.push(def);
            }
        });
    } else {
        retailers = [...DEFAULT_RETAILERS];
    }
    
    if (result.selectedRetailers) {
        selectedRetailers = new Set(result.selectedRetailers);
    } else {
        selectedRetailers = new Set(retailers.map(r => r.id));
    }
    
    await saveRetailers();
}

// Save to storage
async function saveRetailers() {
    await chrome.storage.sync.set({
        retailers: retailers,
        selectedRetailers: [...selectedRetailers]
    });
}

// Render retailers list
function renderRetailers() {
    retailersList.innerHTML = '';
    
    retailers.forEach(retailer => {
        const item = document.createElement('div');
        item.className = `retailer-item${selectedRetailers.has(retailer.id) ? ' selected' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `r-${retailer.id}`;
        checkbox.checked = selectedRetailers.has(retailer.id);
        
        const label = document.createElement('label');
        label.htmlFor = `r-${retailer.id}`;
        label.textContent = retailer.name;
        
        item.appendChild(checkbox);
        item.appendChild(label);
        
        if (!retailer.isDefault) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeRetailer(retailer.id);
            };
            item.appendChild(removeBtn);
        }
        
        item.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                checkbox.checked = !checkbox.checked;
                toggleRetailer(retailer.id);
            }
        };
        
        checkbox.onchange = () => toggleRetailer(retailer.id);
        
        retailersList.appendChild(item);
    });
}

// Toggle retailer selection
async function toggleRetailer(id) {
    if (selectedRetailers.has(id)) {
        selectedRetailers.delete(id);
    } else {
        selectedRetailers.add(id);
    }
    await saveRetailers();
    renderRetailers();
}

// Remove a custom retailer
async function removeRetailer(id) {
    retailers = retailers.filter(r => r.id !== id);
    selectedRetailers.delete(id);
    await saveRetailers();
    renderRetailers();
}

// Add a new retailer
async function addRetailer(name, searchUrl) {
    const id = 'custom-' + Date.now();
    retailers.push({ id, name, searchUrl, isDefault: false });
    selectedRetailers.add(id);
    await saveRetailers();
    renderRetailers();
}

// Perform search
async function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showStatus('Please enter a product name', 'error');
        return;
    }
    
    if (selectedRetailers.size === 0) {
        showStatus('Please select at least one retailer', 'error');
        return;
    }
    
    // Get selected retailers data
    const selected = retailers.filter(r => selectedRetailers.has(r.id));
    
    // Send message to background script to open split view
    chrome.runtime.sendMessage({
        action: 'openSplitView',
        query: query,
        retailers: selected
    });
    
    showStatus('Opening split view...', 'success');
}

// Show status message
function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');
    
    setTimeout(() => {
        status.classList.add('hidden');
    }, 3000);
}

// Setup event listeners
function setupListeners() {
    searchBtn.onclick = performSearch;
    
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') performSearch();
    };
    
    addSiteBtn.onclick = () => {
        addSiteForm.classList.remove('hidden');
        siteNameInput.focus();
    };
    
    cancelAdd.onclick = () => {
        addSiteForm.classList.add('hidden');
        siteNameInput.value = '';
        siteUrlInput.value = '';
    };
    
    confirmAdd.onclick = async () => {
        const name = siteNameInput.value.trim();
        const url = siteUrlInput.value.trim();
        
        if (!name) {
            showStatus('Enter a site name', 'error');
            return;
        }
        if (!url || !url.includes('{query}')) {
            showStatus('URL must contain {query}', 'error');
            return;
        }
        
        await addRetailer(name, url);
        addSiteForm.classList.add('hidden');
        siteNameInput.value = '';
        siteUrlInput.value = '';
        showStatus('Retailer added!', 'success');
    };
}

// Start
init();
