# AWiki

This is a static wiki built with React and TypeScript. You can easily create your own wiki without any extra effort.

![AWiki](https://github.com/user-attachments/assets/c6fdbf73-30bd-4e1d-9463-a2087cbef8e3)

## Project Structure

- `index.html`: The main HTML file and entry point for the application.
- `index.tsx`: Mounts the main React application to the DOM.
- `App.tsx`: The root React component that handles the overall layout, state management, and routing between wiki pages.
- `wiki-manifest.json`: A JSON file that defines the navigation structure of the sidebar. This is the single source of truth for what pages exist and how they are organized.
- `wiki/`: A directory containing all the wiki content as Markdown (`.md`) files.
- `components/`: Contains all the reusable React components, such as the sidebar, markdown renderer, and icons.
- `types.ts`: Defines the TypeScript types used throughout the application, like `WikiPage` and `WikiSection`.