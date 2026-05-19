import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const wasmDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = resolve(wasmDir, "../../../build-wasm/wasm");

if (!existsSync(artifactDir)) {
	console.log("Skipping package prepare; run npm run build to create WASM artifacts.");
	process.exit(0);
}

const result = spawnSync("npm", ["run", "copy:dist"], {
	cwd: wasmDir,
	stdio: "inherit",
});

process.exit(result.status ?? 1);
