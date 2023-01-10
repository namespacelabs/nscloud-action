import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as common from "./common";
import * as fs from "fs";
import { execSync } from "child_process";

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

		const id_token = await core.getIDToken();
		const { GITHUB_REPOSITORY } = process.env;

		execSync(`ns login robot github.com/${GITHUB_REPOSITORY} --log_actions`, {
			stdio: "inherit",
			input: `${id_token}\n`,
		});

		execSync("ns cluster create --ephemeral=true --output_to=./clusterId.txt", {
			stdio: "inherit",
		});

		core.saveState(common.clusterIdKey, fs.readFileSync("./clusterId.txt", "utf8"));
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
			console.log(`Unsupported architecture: ${RUNNER_ARCH}`);
			break;
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
			console.log(`Unsupported operating system: ${RUNNER_OS}`);
			break;
	}

	return `https://get.namespace.so/packages/ns/latest?arch=${arch}&os=${os}`;
}

run();
