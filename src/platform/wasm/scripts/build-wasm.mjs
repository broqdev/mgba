import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const wasmDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(wasmDir, "../../..");
const buildDir = resolve(repoRoot, process.env.BUILD_DIR || "build-wasm");
const binDir = join(wasmDir, "node_modules", ".bin");
const require = createRequire(import.meta.url);

const executable = (name) =>
	process.platform === "win32" ? join(binDir, `${name}.cmd`) : join(binDir, name);

const existingPathEntries = [
	"/opt/homebrew/bin",
	"/usr/local/bin",
].filter(existsSync);

const env = {
	...process.env,
	PATH: [...existingPathEntries, process.env.PATH || ""].join(delimiter),
};

const cmakeFlags = (process.env.CMAKE_FLAGS || "").trim().split(/\s+/).filter(Boolean);

function run(command, args, cwd) {
	const result = spawnSync(command, args, {
		cwd,
		env,
		stdio: "inherit",
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

function ensureSdkToolAliases() {
	const { paths } = require("emsdk");
	const llvmDir = paths().llvm;
	const llvmAr = join(llvmDir, "llvm-ar");
	const llvmRanlib = join(llvmDir, "llvm-ranlib");

	if (existsSync(llvmRanlib)) {
		return;
	}

	try {
		symlinkSync("llvm-ar", llvmRanlib);
	} catch {
		writeFileSync(llvmRanlib, `#!/bin/sh\nexec "${llvmAr}" s "$@"\n`, {
			mode: 0o755,
		});
	}
}

mkdirSync(buildDir, { recursive: true });
ensureSdkToolAliases();

run(executable("emcmake"), [
	"cmake",
	"..",
	"-DCMAKE_POLICY_VERSION_MINIMUM=3.5",
	...cmakeFlags,
], buildDir);
run(executable("emmake"), ["make", "install", "DESTDIR=install"], buildDir);
