## Customization

### Changing the Site Title

To change the title that appears in the browser tab, edit the ```<title>``` tag in ```index.html```.

```html
<!-- index.html -->
<head>
  ...
  <title>Your New Wiki Title</title>
  ...
</head>
```

### Changing the Browser Icon (Favicon)

To change the icon that appears in the browser tab, modify the ```<link rel="icon">``` tag in the ```<head>``` of ```index.html```. You can use a link to an image file (```.ico```, ```.png```, ```.svg```) or an inline SVG data URI, as is currently done.

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

The logo used in the header is the ```StoryMCLogoIcon``` component. To change it:

1.  Open ```components/icons.tsx```.
2.  Find the ```StoryMCLogoIcon``` component.
3.  Replace the SVG code inside it with your own logo's SVG code.

You can also change the site name text next to the logo by editing the ```<span>``` tag inside the ```<header>``` in ```App.tsx```.