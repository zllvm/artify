# Project Overview

This is a monorepo containing both backend and frontend applications. The backend is a Node.js server using Express, and the frontend is a React application.

## Folder Structure

- `/apps/backend`: Node.js backend source code in TypeScript under `src`.
- `/apps/frontend`: React frontend source code in TypeScript with `.tsx` components.
- `/packages/shared`: Shared utilities and type definitions used by both backend and frontend.

## Project Layout

- Managed with pnpm and TurboRepo.
- `pnpm-workspace.yaml` and `turbo.json` handle workspace and build orchestrations.
- Backend source is in `/apps/backend/src`, build output in `/apps/backend/dist`.
- Frontend source is in `/apps/frontend/src`, build output in `/apps/frontend/dist`.
- Shared code in `/packages/shared/src`.

## Libraries and Frameworks

- Backend: Node.js, Express, TypeScript.
- Frontend: React, TypeScript (.tsx files for components).

## Styling Guidelines

- React frontend uses separate CSS files colocated with components, e.g., `MyComponent.css` imported in `MyComponent.tsx`.
- No Tailwind CSS or inline styles.
- CSS Modules may be used for scoped styling.
- Global CSS files limited to common resets or utility styles in `/apps/frontend/src/styles/global.css`.
- CSS variables (custom properties) are used appropriately for theming and dynamic styling with `var(--variable-name)` syntax.
- Avoid inline style props for CSS variables; prefer definitions in CSS files.
- Css !important is discouraged; use specificity and proper cascading instead.
- Do not use inline styles in JSX; use CSS classes instead.

## Visual Guidelines

- Use a consistent color palette and typography across the app.
- Follow a clean, modern design aesthetic with ample whitespace.
- Ensure responsive design for various screen sizes.
- Avoid overly complex layouts; prioritize usability and clarity.
- Use consistent button styles, form elements, and spacing.
- Use icons and images that align with the overall design language.
- Avoid moving effects on hover; prefer subtle color or shadow changes.

## Coding Standards

- Use semicolons at the end of statements.
- Use single quotes for strings.
- Prefer function components and hooks in React.
- Use async/await for asynchronous operations in backend.
- Avoid importing from build output folders (`dist`); import from source or package entry points.

## React Functional Components

- Do not use `React.FC` or `React.FunctionComponent` types for defining components.
- Define components as plain functions with explicit typed props.
- Preferred style example:

```tsx
type GreetingProps = { name: string };

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}

export default Greeting;
```

- Avoid `React.FC` because it implicitly adds `children` and can cause less precise typings.
- Use React hooks (`useState`, `useEffect`, etc.) inside function components as needed.
- Favor small, focused components to improve readability and testability.

## Other Guidelines

- Separate concerns clearly between frontend and backend code.
- Write unit tests for backend APIs and React components.

## Additional Notes

- Separate concerns clearly between frontend and backend.
- Write unit tests for backend APIs and React components.
- Environment variables and secrets are managed with `.env` files.
- Code targets Node.js 22+ and modern browsers supporting ES6+.
