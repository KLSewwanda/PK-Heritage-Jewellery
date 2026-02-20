# PK Heritage Jewellery - Assets Folder

## Folder Structure

Place your images in the appropriate category folders:

```
assets/
├── necklaces/     → Necklace product images (necklace-1.jpg, necklace-2.jpg, etc.)
├── rings/         → Ring product images
├── earrings/      → Earring product images
├── bracelets/     → Bracelet product images
├── hero/          → Hero section background images
└── custom/        → Custom design showcase images
```

## Image Naming Convention

Each category has 6 items in the HTML. Name your images:

| Folder     | File Names                                               |
|------------|----------------------------------------------------------|
| necklaces  | `necklace-1.jpg` through `necklace-6.jpg`               |
| rings      | `ring-1.jpg` through `ring-6.jpg`                       |
| earrings   | `earring-1.jpg` through `earring-6.jpg`                 |
| bracelets  | `bracelet-1.jpg` through `bracelet-6.jpg`               |

## How to Add Images

1. Place your image files in the correct folder
2. In `index.html`, find the item's `.item-image` section
3. Add an `<img>` tag before or instead of the SVG placeholder:

```html
<div class="item-image">
    <img src="assets/necklaces/necklace-1.jpg" alt="Diamond Cascade Necklace">
    <!-- Remove or keep the SVG placeholder as fallback -->
</div>
```

## Recommended Image Specs

- **Format**: JPG or WebP for photos, PNG for transparent backgrounds
- **Size**: 600×600px or 800×600px recommended
- **Quality**: Compress to ~80% for fast loading
- **Aspect Ratio**: Square or 4:3 works best with the grid layout
