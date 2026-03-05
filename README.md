# Lucky Spin

A customizable spinning wheel app. Load JSON data to configure wheel segments, spin, and see where fate takes you!

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
  "items": [
    { "label": "Option 1", "color": "#FF6B6B" },
    { "label": "Option 2", "color": "#4ECDC4" }
  ]
}
```

Place JSON files in the `data/` directory to make them available in the dropdown.

## Tech Stack

- Vanilla HTML + JavaScript
- CSS Modules
- Canvas API for wheel rendering
