## Changing the Site Title

To change the title that appears in the browser tab, edit the `<title>` tag in `index.html`.

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

You can also change the site name text next to the logo by editing the `<span>` tag inside the `<header>` in `App.tsx`.