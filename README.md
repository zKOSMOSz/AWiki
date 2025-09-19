# AWiki

This is a static wiki built with React and TypeScript. You can easily create your own wiki without any extra effort.

<img width="700" height="762" alt="image" src="https://github.com/user-attachments/assets/c6fdbf73-30bd-4e1d-9463-a2087cbef8e3" />

## Project Structure

-   `index.html`: The main HTML file and entry point for the application.
-   `index.tsx`: Mounts the main React application to the DOM.
-   `App.tsx`: The root React component that handles the overall layout, state management, and routing between wiki pages.
-   `wiki-manifest.json`: A JSON file that defines the navigation structure of the sidebar. This is the single source of truth for what pages exist and how they are organized.
-   `wiki/`: A directory containing all the wiki content as Markdown (`.md`) files.
-   `components/`: Contains all the reusable React components, such as the sidebar, markdown renderer, and icons.
-   `types.ts`: Defines the TypeScript types used throughout the application, like `WikiPage` and `WikiSection`.

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

### Custom Icons

To use a custom icon, use its name in the `iconName` field.

**Available Custom Icons:**

-   `InfoIcon`
-   `BookIcon`
-   `UserPlusIcon`
-   `BeakerIcon`
-   `WineIcon`
-   `DocumentTextIcon`
-   `MicrophoneIcon`
-   `FolderIcon`
-   `ClockIcon`
-   `ShieldCheckIcon`
-   `BuildingLibraryIcon`

## Customization

### Changing the Site Title

To change the title that appears in the browser tab, edit the `<title>` tag in `index.html`.

```html
<!-- index.html -->
<head>
  ...
  <title>Your New Wiki Title</title>
  ...
</head>
```

### Changing the Browser Icon (Favicon)

To change the icon that appears in the browser tab, modify the `<link rel="icon">` tag in the `<head>` of `index.html`. You can use a link to an image file (`.ico`, `.png`, `.svg`) or an inline SVG data URI, as is currently done.

```html
<!-- index.html -->
<head>
  ...
  <!-- Replace with your own icon -->
  <link rel="icon" href="https://your-domain.com/favicon.ico">
  ...
</head>
```

### Changing the In-App Logo

The logo used in the header is the `StoryMCLogoIcon` component. To change it:

1.  Open `components/icons.tsx`.
2.  Find the `StoryMCLogoIcon` component.
3.  Replace the SVG code inside it with your own logo's SVG code.

You can also change the site name text next to the logo by editing the `<span>` tag inside the `<header>` in `App.tsx`.
