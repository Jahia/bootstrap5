import { defineConfig } from "vite";
import jahia from "@jahia/vite-plugin";

/**
 * Fixes the GraalVM error:
 *   "react/jsx-runtime does not provide an export named 'default'"
 *
 * Root cause: react-bootstrap contains CJS code that does require('react/jsx-runtime').
 * Rollup merges this with the named ESM imports, producing:
 *   import require$$6, { jsxs, jsx, Fragment } from "react/jsx-runtime";
 *
 * GraalVM rejects this because react/jsx-runtime has no default export in ESM.
 *
 * Fix: split the merged import so there is no default import at runtime;
 * the default variable is reconstructed locally from the named exports.
 */
const fixJsxRuntimeDefaultImport = {
  name: "fix-jsx-runtime-default-import",
  generateBundle(options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== "chunk") continue;
      if (!chunk.code.includes('"react/jsx-runtime"')) continue;
      chunk.code = chunk.code.replace(
        /import ([\w$]+), \{ ([^}]+) \} from "react\/jsx-runtime";/,
        (_, defaultVar, namedExports) => {
          const names = namedExports.split(",").map((n) => n.trim()).join(", ");
          return `import { ${namedExports} } from "react/jsx-runtime"; const ${defaultVar} = { ${names} };`;
        },
      );
    }
  },
};

export default defineConfig({
  plugins: [jahia(), fixJsxRuntimeDefaultImport],
});
