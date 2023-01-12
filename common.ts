import * as path from "path";
import * as fs from "fs";

export const clusterIdKey = "clusterId";

export function tmpFile(file: string): string {
	fs.mkdirSync(path.join(process.env.RUNNER_TEMP, "ns"));

	return path.join(process.env.RUNNER_TEMP, "ns", file);
}
