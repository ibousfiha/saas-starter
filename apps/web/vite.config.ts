import { lingui, linguiTransformerBabelPreset } from "@lingui/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const port = Number(process.env.PORT ?? 3001);
const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:3000";

export default defineConfig({
	plugins: [
		tailwindcss(),
		tanstackRouter({ autoCodeSplitting: true, target: "react" }),
		lingui(),
		babel({ presets: [linguiTransformerBabelPreset()] }),
		react(),
	],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		port,
		proxy: {
			"/api": apiTarget,
			"/rpc": apiTarget,
		},
		strictPort: true,
	},
});
