import * as core from "@actions/core";
import * as common from "./common";
import * as fs from "fs";
import { execSync } from "child_process";

async function run(): Promise<void> {
	try {
		await common.installNs();

		core.setCommandEcho(true);

		// Start downloading kubectl while we prepare the cluster.
		let kubectl = prepareKubectl();

		execSync("ns auth exchange-github-token", { stdio: "inherit" });

		let idFile = common.tmpFile("clusterId.txt");
		let registryFile = common.tmpFile("registry.txt");
		let cmd = `ns cluster create --output_to=${idFile} --output_registry_to=${registryFile}`;
		if (core.getInput("preview") != "true") {
			cmd = cmd + " --ephemeral";
		}
		if (core.getInput("wait-kube-system") == "true") {
			cmd = cmd + " --wait_kube_system";
		}
		execSync(cmd, { stdio: "inherit" });

		let clusterId = fs.readFileSync(idFile, "utf8");
		core.saveState(common.clusterIdKey, clusterId);

		prepareKubeconfig(clusterId);

		await kubectl;

		let registry = fs.readFileSync(registryFile, "utf8");
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
