## How to Add or Modify Wiki Pages

The wiki's content and structure are designed to be easily updated.

### 1. Create or Edit a Markdown File

All page content is stored in `.md` files inside the `wiki/` directory. You can create subdirectories to keep things organized (e.g., `wiki/modify/custom/custom.md`).

-   To create a new page, add a new `.md` file in the `wiki/` directory.
-   To edit an existing page, simply modify the corresponding `.md` file.

### 2. Update the Wiki Manifest

After creating your markdown file, you must register it in `wiki-manifest.json` to make it appear in the sidebar navigation.

Open `wiki-manifest.json` and add a new JSON object to the main array or a section's `children` array.

#### Example: Adding a New Page

To add a new page titled "Styling" under the "Modify" section:

1.  **Create the file:** `wiki/modify/styling.md` with your content.

2.  **Update `wiki-manifest.json`:** Find the "Modify" section and add the new page object to its `children` array.

    ```json
    {
      "type": "section",
      "id": "modify",
      "title": "Modify",
      "iconName": "🍷",
      "path": "modify/modify.md",
      "children": [
        {
          "type": "page",
          "id": "custom",
          "title": "Custom",
          "iconName": "👤",
          "path": "modify/custom/custom.md"
        },
        {
          "type": "page",
          "id": "styling",
          "title": "Styling",
          "iconName": "🎨",
          "path": "modify/styling.md"
        }
      ]
    }
    ```
    **Note:** Make sure the `id` is unique. For the `iconName`, you can use either a standard emoji or one of the custom icon names listed below.

#### Example: Adding a New Top-Level Section

To add a new section called "Guides":

1.  **Create content files:** e.g., `wiki/guides/getting-started.md`

2.  **Update `wiki-manifest.json`:** Add a new section object to the root array.

    ```json
    [
      {
        "type": "page",
        "id": "info",
        "title": "Info",
        "iconName": "📁",
        "path": "info.md"
      },
      // ... other existing pages and sections
      {
        "type": "section",
        "id": "guides",
        "title": "Guides",
        "children": [
          {
            "type": "page",
            "id": "getting-started",
            "title": "Getting Started",
            "iconName": "🚀",
            "path": "guides/getting-started.md"
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
  "id": "styling",
  "title": "Styling",
  "iconName": "🎨",
  "path": "modify/styling.md"
}
```