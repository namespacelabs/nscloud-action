import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as common from "./common";
import * as fs from "fs";
import { execSync } from "child_process";
import * as path from "path";

async function run(): Promise<void> {
	try {
		// Download the specific version of the tool, e.g. as a tarball
		const pathToTarball = await tc.downloadTool(getDownloadURL(), null, null, {
			CI: process.env.CI,
			"User-Agent": "nscloud-action",
		});

		// Extract the tarball onto the runner
		const pathToCLI = await tc.extractTar(pathToTarball);

		// Expose the tool by adding it to the PATH
		core.addPath(pathToCLI);

		execSync("ns version", { stdio: "inherit" });

		execSync("ns cluster create --ephemeral=true --output_to=./clusterId.txt", {
			stdio: "inherit",
		});

		let clusterId = fs.readFileSync("./clusterId.txt", "utf8");
		core.saveState(common.clusterIdKey, clusterId);

		prepareKubectl(pathToCLI, clusterId);
	} catch (error) {
		core.setFailed(error.message);
	}
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

function prepareKubectl(pathToCLI: string, clusterId: string) {
	const kubectlScript = `#!/bin/sh

set -e

./ns cluster kubectl ${clusterId} -- $@`;

	fs.writeFileSync(path.join(pathToCLI, "kubectl"), kubectlScript, { mode: 0o777 });
}

run();
