# React, TypeScript, and shadcn/ui Project Setup Guide

This guide describes how to initialize and configure a React codebase supporting TypeScript, Tailwind CSS, and the shadcn/ui component system.

## Prerequisite: Installing Dependencies
You will need to install the core npm packages for motion and icon styling:
```bash
npm install motion lucide-react clsx tailwind-merge
```

## Step 1: Initializing a React + TypeScript Project
If starting from scratch, create a React + TypeScript app using Vite:
```bash
npx create-vite@latest pawpal-react-app --template react-ts
cd pawpal-react-app
```

## Step 2: Set up Tailwind CSS
Install Tailwind CSS and its peers, then run the init command to generate both `tailwind.config.js` and `postcss.config.js`:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure your template paths in `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add the Tailwind directives to your CSS file (e.g., `src/index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Step 3: Initialize shadcn/ui CLI
Run the shadcn-ui initialization command:
```bash
npx shadcn-ui@latest init
```

The CLI will prompt you with configuration questions. Below is the recommended setup:
- **TypeScript**: Yes
- **Style**: Default
- **Base color**: Slate
- **Tailwind CSS file**: `src/index.css` (or `app/globals.css` if using Next.js)
- **CSS variables for colors**: Yes
- **tailwind.config.js path**: `tailwind.config.js`
- **Configure import alias**: Yes (`@/*`)

This will create a `components.json` configuration file at your root and generate a utility library file `lib/utils.ts` for handling class mergers (`clsx` + `tailwind-merge` which the `cn` function relies on).

## Default Components Directory Structure
The components are placed in:
- Component registry: `/components/ui/`
- Custom components: `/components/blocks/`

### Why is `/components/ui` Important?
1. **Separation of Concerns**: It acts as the "source of truth" for reusable, atomic primitives (such as Buttons, Modals, Badges, inputs) managed by shadcn/ui.
2. **CLI Updates**: The shadcn-ui CLI expects components to reside in this directory. If you add components later (e.g., `npx shadcn-ui add button`), it automatically writes them into `/components/ui/button.tsx`. Keeping this folder organized avoids imports breaking.
3. **Collaboration**: A standard naming scheme enables team members to immediately know where to look for global UI elements.

## Step 4: Adding Custom Components
After copying the components:
1. `cards-stack.tsx` -> Move/copy to `/components/ui/cards-stack.tsx` or `/components/blocks/cards-stack.tsx`.
2. `interactive-hover-button.tsx` -> Move/copy to `/components/ui/interactive-hover-button.tsx`.

You can then import them in your views:
```tsx
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack";
```
