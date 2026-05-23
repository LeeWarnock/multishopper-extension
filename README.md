# The Cheapest Product - Chrome Extension

Compare product prices across multiple retailers in a split-view layout.

## GitHub Pages (Phone Access)

You can use the hosted web launcher from any phone:

- `https://YOUR_USERNAME.github.io/multishopper-extension/`

Notes:

- The hosted web version opens retailer searches in separate tabs.
- The extension-only iframe split view depends on Chrome extension permissions and cannot be fully reproduced on GitHub Pages.
- Main entry point is `index.html`.

## Features

- **Side Panel Interface** - Search for products from the browser sidebar
- **Split-View Results** - All retailer results displayed in one tab with resizable tiles
- **6 Default Retailers** - Amazon, Walmart, eBay, Target, Best Buy, Costco
- **Custom Retailers** - Add any site with a search URL
- **Header Stripping** - Bypasses X-Frame-Options to enable iframe embedding

## Installation

### From Source (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon in your Chrome toolbar
2. The side panel will open with the search interface
3. Enter a product name (e.g., "iPhone 15 Pro")
4. Select which retailers to search (all selected by default)
5. Click **Search All**
6. A new tab opens with a split-view of all retailer search results

### Managing Retailers

- **Toggle retailers** - Click checkboxes to include/exclude from search
- **Add custom site** - Click the **+** button and enter:
  - Site name (e.g., "Newegg")
  - Search URL with `{query}` placeholder (e.g., `https://newegg.com/p/pl?d={query}`)
- **Remove custom sites** - Hover over custom retailer and click **×**

### Split-View Controls

- **⊞** (Layout) - Cycle through different grid layouts
- **↻** (Refresh) - Reload all retailer frames
- **↻** (per tile) - Reload individual tile
- **⛶** (Fullscreen) - Expand tile to full screen (Esc to exit)
- **↗** (External) - Open retailer in new tab

## Permissions Explained

| Permission | Why It's Needed |
|------------|-----------------|
| `sidePanel` | Display search interface in side panel |
| `storage` | Save your retailer preferences |
| `declarativeNetRequest` | Remove iframe-blocking headers |
| `tabs` | Open split-view in new tab |
| `<all_urls>` | Load retailer websites in iframes |

## Adding Custom Icons (Optional)

Add PNG icons to the `icons` folder:
- `icon16.png` (16×16 pixels)
- `icon48.png` (48×48 pixels)  
- `icon128.png` (128×128 pixels)

Then update `manifest.json` to include:
```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

## Troubleshooting

**Some sites still don't load in iframes:**
- Some sites use JavaScript-based frame detection that can't be bypassed
- Use the **↗** button to open in a new tab instead

**Side panel not opening:**
- Make sure you're on a regular webpage (not chrome:// pages)
- Try right-clicking the extension icon and selecting "Open side panel"

## Tech Stack

- Plain HTML/CSS/JavaScript
- Chrome Extension Manifest V3
- Chrome Side Panel API
- DeclarativeNetRequest API for header modification
