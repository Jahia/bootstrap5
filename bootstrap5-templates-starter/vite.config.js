import { defineConfig } from "vite";
import jahia from "@jahia/vite-plugin";
import sbom from "rollup-plugin-sbom";

export default defineConfig({
  plugins: [sbom({ specVersion: "1.4" }), jahia()],
});
