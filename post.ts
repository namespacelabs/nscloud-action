import * as core from "@actions/core";
import { execSync } from "child_process";
import * as common from "./common";

async function run(): Promise<void> {
	let clusterId = core.getState(common.clusterIdKey);

	execSync(`ns cluster destroy ${clusterId} --force`, { stdio: "inherit" });
}

run();
