# Warp simulator data

`masterData.js` is the single source of truth for 5-star characters and signature Light Cones.

Each character record contains:
- Character ID and image URLs
- Display name and internal archive key
- Element and Path
- Signature Light Cone ID, name and image URLs

`bannerArchive.js` only stores Version / Phase / featured character keys / featured 4-star names. It resolves character and Light Cone data through `masterData.js`, preventing duplicated names and mismatched images.
