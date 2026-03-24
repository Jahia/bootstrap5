# Islands Decision Guide — When (Not) to Use React Islands

> This guide covers Sprint 5's deliverable: a decision framework for client-side
> islands in `bootstrap5-js-rendering`.

---

## TL;DR

**Almost never.** All 12 Bootstrap 5 components in this module are rendered
fully on the server. Bootstrap's `data-bs-*` attribute system handles every
interactive behaviour without any React islands.

---

## What is an island?

A React island (`<Island component={...} />` from `@jahia/javascript-modules-library`)
hydrates a component on the client. The server renders static HTML; the browser
replaces it with an interactive React component.

Islands are appropriate when the component:
- Needs browser-only APIs (geolocation, Web Audio, canvas, `window.matchMedia`)
- Maintains client-side state that changes after the initial render
- Reacts to real-time data (WebSocket, polling)
- Requires DOM measurements before rendering (infinite scroll, masonry)

---

## Why Bootstrap 5 components don't need islands

Bootstrap 5 is designed around declarative HTML. The JS bundle scans the DOM on
`DOMContentLoaded` and wires up every `data-bs-toggle`, `data-bs-target`, etc.
it finds — no JavaScript framework required.

| Bootstrap component | Interaction mechanism | Island needed? |
|---|---|---|
| Alert dismiss | `data-bs-dismiss="alert"` | ❌ No |
| Accordion | `data-bs-toggle="collapse"` | ❌ No |
| Tabs | `data-bs-toggle="tab"` | ❌ No |
| Carousel | `data-bs-ride="carousel"` | ❌ No |
| Navbar collapse | `data-bs-toggle="collapse"` | ❌ No |
| Dropdown | `data-bs-toggle="dropdown"` | ❌ No |
| Modal (login) | `data-bs-toggle="modal"` | ❌ No |
| Popover | `new bootstrap.Popover(el)` via inline script | ❌ No (inline script) |
| Tabs deep-linking | Inline `<script>` via `<AddResources>` | ❌ No |

---

## Decision tree

```
Does the component need to render on the server (SEO, initial paint)?
├── YES → Use SSR only (*.server.tsx). This is always preferred.
│         Does it need any interactivity?
│         ├── NO → Done. Pure SSR.
│         ├── YES, Bootstrap data-bs-* handles it → Done. Pure SSR + Bootstrap JS.
│         └── YES, needs real-time/browser-only state
│               └── Use <Island> for the interactive subtree only.
│                   Keep the static shell in the SSR view.
└── NO (pure browser widget) → Use *.client.tsx entry point directly.
```

---

## If you do need an island

### 1. Create the client component

`src/components/MyComponent/my-component.client.tsx`:

```tsx
import { Island } from "@jahia/javascript-modules-library";

// This file is bundled into dist/client/ by @jahia/vite-plugin.
// It is NOT a jahiaComponent registration.

export default function MyWidget({ initialValue }: { initialValue: string }) {
  const [value, setValue] = React.useState(initialValue);
  // ... interactive logic
  return <div>{value}</div>;
}
```

### 2. Mount the island from the server view

`src/components/MyComponent/default.server.tsx`:

```tsx
import { Island, jahiaComponent } from "@jahia/javascript-modules-library";

jahiaComponent(
  { nodeType: "bootstrap5nt:myComponent", componentType: "view", name: "default" },
  ({ someValue }) => (
    <div className="my-component">
      {/* Static shell rendered on server */}
      <h2>Static title</h2>

      {/* Interactive subtree hydrated on client */}
      <Island
        componentName="my-component"
        componentProps={{ initialValue: someValue ?? "" }}
        fallback={<div>Loading…</div>}
      />
    </div>
  ),
);
```

`componentName` must match the filename stem of the client entry point
(`my-component.client.tsx` → `"my-component"`).

### 3. Props must be serialisable

Props passed to `<Island>` are serialised to JSON and embedded in the HTML.
Use only strings, numbers, booleans, plain objects, and arrays.
Never pass JCR node objects.

---

## Current status in this module

No islands are used. The only inline script present is the Tabs deep-linking
init (`AddResources type="inline"`), which is a plain vanilla JS snippet, not
a React island.

### Why Popover doesn't need an island

Bootstrap 5's Popover requires an explicit `new bootstrap.Popover(el)` call
(unlike most BS5 components which auto-init). This is handled via an inline
`<script>` injected by `<AddResources>` — not a React island. The component
remains purely server-rendered.

---

## Performance note

Each island adds:
- A serialised JSON payload embedded in the HTML (prop transfer)
- A client-side hydration pass
- A separate JS chunk in `dist/client/`

Avoid islands for anything Bootstrap 5 already handles. The goal is **zero islands
in live mode** for this module.
