import * as core from "@actions/core";
import * as fs from "fs";
import { commandExists } from "command-exists";
import * as exec from "@actions/exec";
import { ClusterIdKey, ensureFreshTenantToken, tmpFile } from "./common";

async function run(): Promise<void> {
	await commandExists("nsc")
		.then(createCluster)
		.catch(function () {
			core.setFailed(`Namespace Cloud CLI not found.

Please add a step this step to your workflow's job definition:

- uses: namespacelabs/nscloud-setup@v0.0.1`);
		});
}

async function createCluster(): Promise<void> {
	try {
		// Start downloading kubectl while we prepare the cluster.
		const kubectlDir = downloadKubectl();

		await ensureFreshTenantToken();

		const idFile = tmpFile("clusterId.txt");
		const registryFile = tmpFile("registry.txt");
		await exec.exec(makeClusterCreate(idFile, registryFile));

		const clusterId = fs.readFileSync(idFile, "utf8");
		core.saveState(ClusterIdKey, clusterId);

		const kubeConfig = await prepareKubeconfig(clusterId);
		core.exportVariable("KUBECONFIG", kubeConfig);

		core.addPath(await kubectlDir);

		const registry = fs.readFileSync(registryFile, "utf8");
		core.setOutput("registry-address", registry);

		console.log(`Successfully created an nscloud cluster.
\`kubectl\` has been installed and preconfigured.

You can find logs and jump into SSH at https://cloud.namespace.so/clusters/${clusterId}
Or install \`nsc\` from https://github.com/namespacelabs/foundation/releases/latest
and follow the cluster logs with \`nsc cluster logs ${clusterId} -f\``);
	} catch (error) {
		core.setFailed(error.message);
	}
}

// Returns the path to the generated kubeconfig.
async function prepareKubeconfig(clusterId: string) {
	const out = tmpFile("kubeconfig.txt");

	await exec.exec(`nsc cluster kubeconfig ${clusterId} --output_to=${out}`);

	return fs.readFileSync(out, "utf8");
}

// Returns the path to the downloaded kubectl binary's directory.
async function downloadKubectl() {
	const out = tmpFile("kubectl.txt");

	await exec.exec(`nsc sdk download --sdks=kubectl --output_to=${out} --log_actions=false`);

	return fs.readFileSync(out, "utf8");
}

function makeClusterCreate(idFile: string, registryFile: string) {
	// XXX Have a output parameter that emits cluster state as JSON.
	let cmd = `nsc cluster create --output_to=${idFile} --output_registry_to=${registryFile}`;
	if (core.getInput("preview") != "true") {
		cmd = cmd + " --ephemeral";
	}
	if (core.getInput("wait-kube-system") == "true") {
		cmd = cmd + " --wait_kube_system";
	}
	return cmd;
}

run();
