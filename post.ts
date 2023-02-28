import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { ClusterIdKey, ensureFreshTenantToken } from "./common";

async function run(): Promise<void> {
	try {
		const clusterId = core.getState(ClusterIdKey);

		if (clusterId != "" && core.getInput("preview") != "true") {
			// Re-auth in case the previous token has expired.
			await ensureFreshTenantToken();

			// TODO replace with suspend & print instructions how to revive it.
			await exec.exec(`ns cluster destroy ${clusterId} --force`);
		}
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
