import * as core from "@actions/core";
import * as fs from "fs";
import * as exec from "@actions/exec";
import { ClusterIdKey, ensureFreshTenantToken, tmpFile } from "./common";

async function run(): Promise<void> {
	var commandExists = require("command-exists");

	commandExists("nsc")
		.then(prepareCluster)
		.catch(function () {
			core.setFailed(`Namespace Cloud CLI not found.

Please add a step this step to your workflow's job definition:

- uses: namespacelabs/nscloud-setup@v0.0.1`);
		});
}

async function prepareCluster(): Promise<void> {
	try {
		// Start downloading kubectl while we prepare the cluster.
		const kubectlDir = downloadKubectl();

		await ensureFreshTenantToken();

		const registryFile = tmpFile("registry.txt");
		const cluster = await createCluster(registryFile);

		core.saveState(ClusterIdKey, cluster.cluster_id);

		const kubeConfig = await prepareKubeconfig(cluster.cluster_id);
		core.exportVariable("KUBECONFIG", kubeConfig);

		core.addPath(await kubectlDir);

		const registry = fs.readFileSync(registryFile, "utf8");
		core.setOutput("registry-address", registry);

		console.log(`Successfully created an nscloud cluster.
\`kubectl\` has been installed and preconfigured.

You can find logs and jump into SSH at ${cluster.app_url}
Or install \`nsc\` from https://github.com/namespacelabs/foundation/releases/latest
and follow the cluster logs with \`nsc cluster logs ${cluster.cluster_id} -f\``);
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

interface Cluster {
	app_url: string;
	cluster_id: string;
}

async function createCluster(registryFile: string): Promise<Cluster> {
	const out = tmpFile("cluster_metadata.txt");

	let cmd = `nsc cluster create --output_json_to=${out} --output_registry_to=${registryFile}`;
	if (core.getInput("preview") != "true") {
		cmd = cmd + " --ephemeral";
	}
	if (core.getInput("wait-kube-system") == "true") {
		cmd = cmd + " --wait_kube_system";
	}
	await exec.exec(cmd);

	return JSON.parse(fs.readFileSync(out, "utf8"));
}

run();
