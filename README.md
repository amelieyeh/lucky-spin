# Lucky Spin

A customizable spinning wheel app. Load JSON data to configure wheel segments, spin, and see where fate takes you!

**Live Demo**: https://amelieyeh.github.io/lucky-spin/

## Usage

1. Open `index.html` in a browser (or serve with any static file server)
2. Select a JSON file from the dropdown or import your own
3. Click "Spin!" and wait for the wheel to stop
4. The arrow at the top points to your result

## JSON Format

```json
{
  "title": "Wheel Title",
  "description": "Optional description",
  "origin": "Starting point (optional, for context)",
  "spinText": "Spin!",
  "map": "Taiwan",
  "items": [
    { "label": "Option 1", "city": "City A", "color": "#FF6B6B" },
    { "label": "Option 2", "city": "City B", "color": "#4ECDC4" }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Display title |
| `description` | No | Shown below title |
| `origin` | No | Starting point context (e.g. departure station) |
| `spinText` | No | Custom spin button text (default: "Spin!") |
| `map` | No | Country shape layout: `"Taiwan"`, or `""` for plain grid |
| `items[].label` | Yes | Cell display text |
| `items[].city` | No | City/region shown in result |
| `items[].color` | Yes | Cell highlight color (hex) |

Place JSON files in the `data/` directory to make them available in the dropdown.

## Tech Stack

- Vanilla HTML + JavaScript
- CSS Modules
- Canvas API for wheel rendering
