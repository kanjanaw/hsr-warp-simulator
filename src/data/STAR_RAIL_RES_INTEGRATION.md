# StarRailRes integration

Character reveal metadata is loaded from:

- `index_min/th/characters.json`
- `index_min/th/paths.json`
- `index_min/th/elements.json`

Source: https://github.com/Mar-7th/StarRailRes

The app keeps the banner, pity, rate-up, and history rules locally. StarRailRes is used only for localized character metadata and asset paths. If the network request fails, the reveal falls back to the existing item name and image.
