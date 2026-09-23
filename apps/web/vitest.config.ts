import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		environment: "jsdom",
		exclude: ["e2e/**", "node_modules/**", "dist/**"],
		globals: true,
		name: "web",
	},
});
