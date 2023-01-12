import * as path from "path";
import * as fs from "fs";

export const clusterIdKey = "clusterId";

export function tmpFile(file: string): string {
	let tmpDir = path.join(process.env.RUNNER_TEMP, "ns");

	if (!fs.existsSync(tmpDir)) {
		fs.mkdirSync(tmpDir);
	}

	return path.join(tmpDir, file);
}
