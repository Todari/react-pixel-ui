# React Pixel UI

React Pixel UI is a React design system that provides pixelated UI components.

## Key Features

- 🎨 Pixelated UI components
- 🎮 Retro game style design system
- 🛠 Customizable pixelation settings
- 📦 Modular package structure

## Tech Stack

- 🏎 [Turborepo](https://turbo.build/repo) - Monorepo build system
- ⚛️ [React](https://reactjs.org/) - UI library
- 💅 [@emotion/react](https://emotion.sh/) - CSS-in-JS styling
- 📚 [Storybook](https://storybook.js.org/) - UI component documentation
- 📦 [Changeset](https://github.com/changesets/changesets) - Versioning and changelog management

## Package Structure

- `apps/docs`: Storybook-based component documentation site
- `packages/pixel-ui`: Core React components
- `packages/use-pixelated-css`: Pixelated CSS transformation Hook
- `packages/typescript-config`: Shared TypeScript configuration
- `packages/eslint-config`: Shared ESLint configuration

## Getting Started

- Install dependencies
```bash
pnpm install
```

- Run storybook
```bash
turbo dev
```

- Build
```bash
turbo build
```