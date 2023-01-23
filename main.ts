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

		// Start downloading kubectl while we prepare the cluster.
		let kubectl = prepareKubectl();

		execSync("ns version", { stdio: "inherit" });

		let idFile = common.tmpFile("clusterId.txt");
		let registryFile = common.tmpFile("registry.txt");
		let cmd = `ns cluster create --output_to=${idFile} --output_registry_to=${registryFile}`;
		if (core.getInput("preview") != "true") {
			cmd = cmd + " --ephemeral";
		}
		execSync(cmd, { stdio: "inherit" });

		let clusterId = fs.readFileSync(idFile, "utf8");
		core.saveState(common.clusterIdKey, clusterId);

		prepareKubeconfig(clusterId);

		await kubectl;

		let registry = fs.readFileSync(registryFile, "utf8");
		core.setOutput("registry-address", registry);

		console.log(
			"Successfully created an nscloud cluster.\n`kubectl` has been installed and preconfigured."
		);
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

function prepareKubeconfig(clusterId: string) {
	let out = common.tmpFile("kubeconfig.txt");
	execSync(`ns cluster kubeconfig ${clusterId} --output_to=${out}`, {
		stdio: "inherit",
	});

	let kubeconfig = fs.readFileSync(out, "utf8");
	core.exportVariable("KUBECONFIG", kubeconfig);
}

async function prepareKubectl() {
	let out = common.tmpFile("kubectl.txt");
	execSync(`ns sdk download --sdks=kubectl --output_to=${out} --log_actions=false`, {
		stdio: "inherit",
	});

	let kubectlPath = fs.readFileSync(out, "utf8");
	core.addPath(kubectlPath);
}

run();
