// Split View Page Script

// State
let currentLayout = 'auto';

// DOM Elements
const splitContainer = document.getElementById('splitContainer');
const searchQueryEl = document.getElementById('searchQuery');
const layoutBtn = document.getElementById('layoutBtn');
const refreshAllBtn = document.getElementById('refreshAllBtn');

// Initialize
function init() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    const retailers = JSON.parse(params.get('retailers') || '[]');
    
    if (!query || retailers.length === 0) {
        showError('No search query or retailers specified');
        return;
    }
    
    // Display search query
    searchQueryEl.textContent = `"${query}"`;
    document.title = `${query} - Price Compare`;
    
    // Set grid layout based on number of retailers
    setGridLayout(retailers.length);
    
    // Create tiles
    retailers.forEach(retailer => {
        const tile = createTile(retailer, query);
        splitContainer.appendChild(tile);
    });
    
    // Setup header buttons
    setupHeaderButtons();
}

// Set the grid layout class
function setGridLayout(count) {
    splitContainer.className = 'split-container';
    
    if (count <= 2) {
        splitContainer.classList.add('grid-2');
    } else if (count === 3) {
        splitContainer.classList.add('grid-3');
    } else if (count === 4) {
        splitContainer.classList.add('grid-4');
    } else if (count === 5) {
        splitContainer.classList.add('grid-5');
    } else if (count === 6) {
        splitContainer.classList.add('grid-6');
    } else {
        splitContainer.classList.add('grid-many');
    }
}

// Create a tile for a retailer
function createTile(retailer, query) {
    const searchUrl = retailer.searchUrl.replace('{query}', encodeURIComponent(query));
    const faviconUrl = getFaviconUrl(searchUrl);
    
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.retailerId = retailer.id;
    
    tile.innerHTML = `
        <div class="tile-header">
            <div class="tile-title">
                <img src="${faviconUrl}" alt="" onerror="this.style.display='none'">
                <span>${retailer.name}</span>
            </div>
            <div class="tile-actions">
                <button class="tile-btn refresh-btn" title="Refresh">↻</button>
                <button class="tile-btn fullscreen-btn" title="Fullscreen">⛶</button>
                <button class="tile-btn external-btn" title="Open in new tab">↗</button>
            </div>
        </div>
        <div class="tile-content">
            <div class="tile-loading">
                <div class="spinner"></div>
                <p>Loading ${retailer.name}...</p>
            </div>
        </div>
    `;
    
    const tileContent = tile.querySelector('.tile-content');
    const loading = tile.querySelector('.tile-loading');
    
    // Create and add iframe
    const iframe = document.createElement('iframe');
    iframe.src = searchUrl;
    iframe.title = `${retailer.name} search results`;
    
    iframe.onload = () => {
        loading.style.display = 'none';
    };
    
    // Hide loading after timeout (in case onload doesn't fire due to cross-origin)
    setTimeout(() => {
        loading.style.display = 'none';
    }, 3000);
    
    tileContent.appendChild(iframe);
    
    // Setup tile buttons
    const refreshBtn = tile.querySelector('.refresh-btn');
    const fullscreenBtn = tile.querySelector('.fullscreen-btn');
    const externalBtn = tile.querySelector('.external-btn');
    
    refreshBtn.onclick = () => {
        loading.style.display = 'flex';
        iframe.src = iframe.src;
    };
    
    fullscreenBtn.onclick = () => {
        tile.classList.toggle('fullscreen');
    };
    
    externalBtn.onclick = () => {
        window.open(searchUrl, '_blank');
    };
    
    return tile;
}

// Get favicon URL from a URL
function getFaviconUrl(url) {
    try {
        const urlObj = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
        return '';
    }
}

// Setup header buttons
function setupHeaderButtons() {
    // Layout toggle (cycles through layouts)
    layoutBtn.onclick = () => {
        const tiles = splitContainer.querySelectorAll('.tile');
        const count = tiles.length;
        
        // Cycle through layouts
        const layouts = ['grid-2', 'grid-3', 'grid-4', 'grid-6', 'grid-many'];
        const currentClass = layouts.find(l => splitContainer.classList.contains(l)) || 'grid-many';
        const currentIndex = layouts.indexOf(currentClass);
        const nextIndex = (currentIndex + 1) % layouts.length;
        
        splitContainer.className = 'split-container ' + layouts[nextIndex];
    };
    
    // Refresh all
    refreshAllBtn.onclick = () => {
        const iframes = splitContainer.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const loading = iframe.closest('.tile').querySelector('.tile-loading');
            if (loading) loading.style.display = 'flex';
            iframe.src = iframe.src;
        });
    };
}

// Show error message
function showError(message) {
    splitContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8;">
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 16px;">❌</div>
                <h2 style="margin-bottom: 8px;">Error</h2>
                <p>${message}</p>
            </div>
        </div>
    `;
}

// Escape key to exit fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const fullscreen = document.querySelector('.tile.fullscreen');
        if (fullscreen) {
            fullscreen.classList.remove('fullscreen');
        }
    }
});

// Initialize
init();
