import * as path from "path";

export const clusterIdKey = "clusterId";

export function tmpFile(file: string): string {
	return path.join(process.env.RUNNER_TEMP, "ns", file);
}
