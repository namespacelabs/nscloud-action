import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as path from "path";
import * as fs from "fs";

export const clusterIdKey = "clusterId";

export function tmpFile(file: string): string {
	let tmpDir = path.join(process.env.RUNNER_TEMP, "ns");

	if (!fs.existsSync(tmpDir)) {
		fs.mkdirSync(tmpDir);
	}

	return path.join(tmpDir, file);
}

export async function installNs() {
	// Download the specific version of the tool, e.g. as a tarball
	const pathToTarball = await tc.downloadTool(getDownloadURL(), null, null, {
		CI: process.env.CI,
		"User-Agent": "nscloud-action",
	});

	// Extract the tarball onto the runner
	const pathToCLI = await tc.extractTar(pathToTarball);

	// Expose the tool by adding it to the PATH
	core.addPath(pathToCLI);

	core.exportVariable("NS_DO_NOT_UPDATE", "true");
}

function getDownloadURL(): string {
	const { RUNNER_ARCH, RUNNER_OS } = process.env;

	let arch = "";
	switch (RUNNER_ARCH) {
		case "X64":
			arch = "amd64";
			break;
		case "ARM64":
			arch = "arm64";
			break;
		default:
			throw new Error(`Unsupported architecture: ${RUNNER_ARCH}`);
	}

	let os = "";
	switch (RUNNER_OS) {
		case "macOS":
			os = "darwin";
			break;
		case "Linux":
			os = "linux";
			break;
		default:
			throw new Error(`Unsupported operating system: ${RUNNER_OS}`);
	}

	return `https://get.namespace.so/packages/ns/latest?arch=${arch}&os=${os}`;
}
