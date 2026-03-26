# Adding a Component

## Step 1 — Define the node type in the CND

Create `bootstrap5-js-rendering/src/components/MyComponent/definition.cnd`:

```cnd
[bootstrap5nt:myComponent] > jnt:content, bootstrap5mix:component
 - title (string) i18n
 - variant (string, choicelist[resourceBundle]) < 'primary', 'secondary', 'danger'
```

Key points:
- Always extend `jnt:content` and `bootstrap5mix:component`
- Use `i18n` for user-facing text properties
- Use `choicelist[resourceBundle]` for enumerated values with labels
- Choicelist with auto-mixin injection: `choicelist[gridTypeInitializer5,resourceBundle]` (see [CND definitions](cnd-definitions.md))
- Namespaces (`bootstrap5nt`, `bootstrap5mix`, `jnt`, `jmix`, `mix`) are declared in `settings/definitions.cnd` — do **not** repeat them in component files
- Cross-component mixins (`bootstrap5mix:image`, `bootstrap5mix:padding`, etc.) are also in `settings/definitions.cnd` — reference them freely

## Step 2 — Add i18n labels

Edit `bootstrap5-js-rendering/resources/bootstrap5-js-rendering.properties`:

```properties
# Component label
bootstrap5nt_myComponent=My Component

# Property labels
bootstrap5nt_myComponent.title=Title
bootstrap5nt_myComponent.variant=Variant

# Enum value labels
bootstrap5nt_myComponent.variant.primary=Primary
bootstrap5nt_myComponent.variant.secondary=Secondary
bootstrap5nt_myComponent.variant.danger=Danger
```

Add the same keys to the other language files (`_fr.properties`, `_de.properties`, etc.).

## Step 3 — Create the TSX view file

Create `bootstrap5-js-rendering/src/components/MyComponent/default.server.tsx`:

```tsx
import React from "react";
import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";

jahiaComponent(
  {
    nodeType: "bootstrap5nt:myComponent",
    name: "default",
    componentType: "view",
    displayName: "My Component",
  },
  function MyComponentView() {
    const { currentNode } = useServerContext();

    const title = currentNode.getPropertyAsString("title") ?? "";
    const variant = currentNode.getPropertyAsString("variant") ?? "primary";

    return (
      <div className={`my-component text-${variant}`}>
        <h3>{title}</h3>
      </div>
    );
  }
);
```

## Step 4 — Register the export

Edit `bootstrap5-js-rendering/src/index.ts` (or wherever the barrel file is) to import the new file:

```ts
import "./components/MyComponent/default.server";
```

## Step 5 — (Optional) Add a Content Editor form

Create `bootstrap5-js-rendering/META-INF/jahia-content-editor-forms/fieldsets/bootstrap5nt_myComponent.json` to control field ordering and grouping:

```json
{
  "type": "fieldset",
  "name": "bootstrap5nt:myComponent",
  "priority": 1.0,
  "rank": -1.0,
  "fields": [
    { "name": "title", "rank": 1 },
    { "name": "variant", "rank": 2 }
  ]
}
```

## Step 6 — Build and deploy

```bash
cd bootstrap5-js-rendering
node/node node/node_modules/.bin/npm run build:maven

curl -X POST http://localhost:8080/modules/api/provisioning \
  -u root:1234 \
  -F 'script=[{"installOrUpgradeModule":"package.tgz","ignoreChecks":true}]' \
  -F 'file=@dist/package.tgz;filename=package.tgz'
```

## Accessing node properties

```tsx
const { currentNode, renderContext } = useServerContext();

// Simple string property
const title = currentNode.getPropertyAsString("title") ?? "";

// Boolean property
const show = currentNode.getPropertyAsString("show") === "true";

// Weakref → node
const imageProp = currentNode.getProperty("image");
const imageNode = imageProp ? imageProp.getNode() as JCRNodeWrapper : undefined;
const imageUrl = imageNode ? String(imageNode.getUrl()) : "";

// Mixin check
const hasColors = currentNode.isNodeType("bootstrap5mix:colors");
const bgColor = hasColors ? currentNode.getPropertyAsString("backgroundColor") : "";

// Edit mode detection
const isEdit = renderContext.isEditMode() as unknown as boolean;

// Child nodes
const items = getChildNodes(currentNode, nodeType: "bootstrap5nt:myItem");
```

## Adding child components (orderable list pattern)

CND:

```cnd
[bootstrap5nt:myList] > jnt:content, bootstrap5mix:component, jmix:list, jmix:orderedList
 orderable
 + bootstrap5nt:myItem (bootstrap5nt:myItem) = bootstrap5nt:myItem

[bootstrap5nt:myItem] > jnt:content, bootstrap5mix:component, mix:title
 - title (string) i18n
```

Parent view — render children inline:

```tsx
import { getChildNodes, RenderChildren } from "@jahia/javascript-modules-library";

const items = getChildNodes(currentNode).filter(n => n.isNodeType("bootstrap5nt:myItem"));

return (
  <div>
    {items.map(item => (
      <div key={item.getIdentifier()}>
        {/* render inline or use <Render node={item} /> */}
        {item.getPropertyAsString("title")}
      </div>
    ))}
  </div>
);
```
