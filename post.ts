import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { ClusterIdKey, ensureFreshTenantToken } from "./common";

async function run(): Promise<void> {
	try {
		const clusterId = core.getState(ClusterIdKey);

		if (clusterId != "" && core.getInput("preview") != "true") {
			// Re-auth in case the previous token has expired.
			await ensureFreshTenantToken();

			// TODO print instructions how to revive it once release is suspend by default
			await exec.exec(`nsc cluster release ${clusterId}`);
		}
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
