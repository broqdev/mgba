import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const wasmDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(wasmDir, "../../../build-wasm/wasm");
const distDir = resolve(wasmDir, "dist");
const packageFiles = ["mgba.d.ts", "mgba.js", "mgba.wasm", "mgba.wasm.map"];

if (!existsSync(sourceDir)) {
	console.error(`Build artifacts not found at ${sourceDir}`);
	process.exit(1);
}

mkdirSync(distDir, { recursive: true });
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const file of packageFiles) {
	const source = resolve(sourceDir, file);
	if (!existsSync(source)) {
		console.error(`Build artifact not found at ${source}`);
		process.exit(1);
	}

	cpSync(source, resolve(distDir, file));
}
