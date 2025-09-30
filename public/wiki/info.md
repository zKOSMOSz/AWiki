# AWiki

This is a static wiki built with React and TypeScript. You can easily create your own wiki without any extra effort.

![AWiki](https://github.com/user-attachments/assets/927299a2-a8f2-4813-b59d-75a67e65b878)

## Project Structure

-   `index.html`: The main HTML file and entry point for the application.
-   `index.tsx`: Mounts the main React application to the DOM.
-   `public/logo.png`: The site logo and favicon image file.
-   `App.tsx`: The root React component that handles the overall layout, state management, and routing between wiki pages.
-   `wiki-manifest.json`: A JSON file that defines the navigation structure of the sidebar. This is the single source of truth for what pages exist and how they are organized.
-   `wiki/`: A directory containing all the wiki content as Markdown (`.md`) files.
-   `components/`: Contains all the reusable React components, such as the sidebar, markdown renderer, and icons.
-   `types.ts`: Defines the TypeScript types used throughout the application, like `WikiPage` and `WikiSection`.

## Custom Components

This wiki supports custom markdown components to enhance your content.

> This is a standard blockquote. It has a vertical line to the left, perfect for quoting text.

> [!NOTE] This is a note. It's useful for providing additional information that isn't critical.

> [!TIP] It can also have a custom title
> This is a tip. Use it to give helpful advice to your readers.

> [!WARNING] This is a warning. It's important and should be read carefully.

> [!CAUTION] This is a caution block. It indicates a potential for data loss or other negative outcomes.

> [!DETAILS] Click to see more details
> You can hide content inside a collapsible section.
>
> - It can contain lists
> - And other **markdown** elements.

> [!DETAILS] Another collapsible section
> This is the content of the second details block. You can put any markdown content here.

> [!DETAILS] And a third one
> You can have as many as you need, and they will stack nicely.