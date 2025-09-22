# AWiki

This is a static wiki built with React and TypeScript. You can easily create your own wiki without any extra effort. It features a clean, modern interface inspired by documentation sites like Nextra and GitBook.

> [!WARNING]
> This project currently requires a code review, as it was initially built using AI. We would welcome a review from anyone with knowledge of React, TypeScript, and static site generation.

<img width="820" height="980" alt="image" src="https://github.com/user-attachments/assets/06294ed0-4f63-42e2-b6c4-f619e096bccf" />

## Project Structure

-   `index.html`: The main HTML file and entry point for the application.
-   `index.tsx`: Mounts the main React application to the DOM.
-   `public/logo.png`: The site logo and favicon image file.
-   `src/config.ts`: A configuration file to easily change the site name.
-   `App.tsx`: The root React component that handles the overall layout, state management, and routing between wiki pages.
-   `wiki-manifest.json`: A JSON file that defines the navigation structure of the sidebar. This is the single source of truth for what pages exist and how they are organized.
-   `wiki/`: A directory containing all the wiki content as Markdown (`.md`) files.
-   `components/`: Contains all the reusable React components, such as the sidebar, markdown renderer, and icons.
-   `types.ts`: Defines the TypeScript types used throughout the application, like `WikiPage` and `WikiSection`.

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

### Changing the Site Name and Title

To make customization easier, the site name is managed from a single configuration file.

1.  **Open `src/config.ts`:**

    ```typescript
    export const SITE_NAME = "Your New Wiki Name";
    ```

2.  **Change the `SITE_NAME` variable.** This will automatically update:
    -   The site name in the header.
    -   The site name in the mobile sidebar.
    -   The browser tab title (document title).

For the initial title that appears before the application loads, you can also update the `<title>` tag in `index.html`.

```html
<!-- index.html -->
<head>
  ...
  <title>Your New Wiki Name</title>
  ...
</head>
```

### Changing the Logo and Favicon

The application uses a single image file for both the browser icon (favicon) and the main logo in the header.

To change the logo, simply replace the `public/logo.png` file with your own image. For best results, use a square image.
