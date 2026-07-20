import nextEnv from "@next/env";
import { defineConfig } from "vitest/config";
import path from "node:path";

const { loadEnvConfig } = nextEnv;
if (process.env.RUN_SUPABASE_INTEGRATION === "true") {
  const originalNodeEnv = process.env.NODE_ENV;
  Reflect.set(process.env, "NODE_ENV", "development");
  loadEnvConfig(process.cwd(), true, console, true);
  if (originalNodeEnv === undefined) {
    Reflect.deleteProperty(process.env, "NODE_ENV");
  } else {
    Reflect.set(process.env, "NODE_ENV", originalNodeEnv);
  }
} else {
  loadEnvConfig(process.cwd());
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    testTimeout: 20_000,
    coverage: { reporter: ["text", "html"], include: ["src/lib/**/*.ts"] },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
