## How to Add or Modify Wiki Pages

The wiki's content and structure are designed to be easily updated.

### 1. Create or Edit a Markdown File

All page content is stored in `.md` files inside the `wiki/` directory. You can create subdirectories to keep things organized (e.g., `wiki/raznoe/towny.md`).

-   To create a new page, add a new `.md` file in the `wiki/` directory.
-   To edit an existing page, simply modify the corresponding `.md` file.

### 2. Update the Wiki Manifest

After creating your markdown file, you must register it in `wiki-manifest.json` to make it appear in the sidebar navigation.

Open `wiki-manifest.json` and add a new JSON object to the main array or a section's `children` array.

#### Example: Adding a New Page

To add a new page titled "Factions" under the "Разное" (Miscellaneous) section:

1.  **Create the file:** `wiki/raznoe/factions.md` with your content.

2.  **Update `wiki-manifest.json`:** Find the "Разное" section and add the new page object to its `children` array.

    ```json
    {
      "type": "section",
      "id": "raznoe",
      "title": "Разное",
      "children": [
        // ... existing pages
        {
          "type": "page",
          "id": "factions",
          "title": "Factions",
          "iconName": "⚔️",
          "path": "raznoe/factions.md"
        }
      ]
    }
    ```
    **Note:** Make sure the `id` is unique. For the `iconName`, you can use either a standard emoji or one of the custom icon names listed below.

#### Example: Adding a New Top-Level Section

To add a new section called "Economy":

1.  **Create content files:** e.g., `wiki/economy/shop.md`

2.  **Update `wiki-manifest.json`:** Add a new section object to the root array.

    ```json
    [
      // ... existing pages and sections
      {
        "type": "section",
        "id": "economy",
        "title": "Economy",
        "children": [
          {
            "type": "page",
            "id": "shop",
            "title": "Server Shop",
            "iconName": "🛒",
            "path": "economy/shop.md"
          }
        ]
      }
    ]
    ```

## Using Icons

You can use either standard emoji characters or the provided set of custom SVG icons for pages and sections in the sidebar.

### Using Emojis

To use an emoji, simply place the character in the `iconName` field in `wiki-manifest.json`.

```json
{
  "type": "page",
  "id": "factions",
  "title": "Factions",
  "iconName": "⚔️",
  "path": "raznoe/factions.md"
}
```