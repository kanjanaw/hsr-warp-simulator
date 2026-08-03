# Image loading optimization

Changes in this version:

- StarRailRes assets now use jsDelivr CDN instead of raw.githubusercontent.com.
- Added preconnect and DNS prefetch for the image CDN.
- Added `font-display: swap` to avoid blocking the first render.
- Initial preload now targets only the active banner and adjacent banners.
- Remaining banner images load gradually while the browser is idle.
- Banner switching waits only for the hero and featured 5-star image.
- Featured 4-star images load in the background and no longer block switching.
- Featured 4-star preview images use lazy loading and low fetch priority.
- Existing promise cache and `decode()` protection remain enabled.
