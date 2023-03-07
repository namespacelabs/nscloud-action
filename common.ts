import * as path from "path";
import * as fs from "fs";
import * as exec from "@actions/exec";

export const ClusterIdKey = "clusterId";

export function tmpFile(file: string): string {
	const tmpDir = path.join(process.env.RUNNER_TEMP, "ns");

	if (!fs.existsSync(tmpDir)) {
		fs.mkdirSync(tmpDir);
	}

	return path.join(tmpDir, file);
}

export async function ensureFreshTenantToken() {
	await exec.exec("nsc auth exchange-github-token");
}
