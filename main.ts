import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { exec, execSync } from "child_process";

async function run(): Promise<void> {
	try {
		const { GITHUB_REPOSITORY, GITHUB_ACTOR, GITHUB_SHA } = process.env;

		console.log(
			`main run: repo: ${GITHUB_REPOSITORY}, author: ${GITHUB_ACTOR}, commit: ${GITHUB_SHA}`
		);

		let id_token = await core.getIDToken();
		if (id_token != "") {
			console.log("fetched token");
		}

		// Download the specific version of the tool, e.g. as a tarball
		const pathToTarball = await tc.downloadTool(getDownloadURL());

		// Extract the tarball onto the runner
		const pathToCLI = await tc.extractTar(pathToTarball);

		// Expose the tool by adding it to the PATH
		core.addPath(pathToCLI);

		execSync("ns version", { stdio: "inherit" });
		execSync("echo test", { stdio: "inherit" });
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
