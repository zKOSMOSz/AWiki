## Changing the Site Name and Title

To make customization easier, the site name is managed from a single configuration file.

### 1. Edit the Configuration File

Open the file located at `src/config.ts`. Inside, you will find a single line:

```typescript
export const SITE_NAME = "AWiki";
```

Change the value `"AWiki"` to your desired site name. This change will automatically update the name displayed in the site's header, sidebar, and browser tab title.

### 2. Update the Initial HTML Title

The app will automatically set the browser tab title when it loads. However, to ensure the correct title shows up immediately before the app has fully loaded, you should also update the `<title>` tag in `index.html`.

```html
<!-- index.html -->
<head>
  ...
  <title>Your New Wiki Title</title>
  ...
</head>
```

### Changing the Logo and Favicon

The application uses a single image file for both the browser icon (favicon) and the main logo in the header.

To change the logo, simply replace the `public/logo.png` file with your own image. For best results, use a square image.
