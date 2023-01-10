import { execSync } from "child_process";

async function run(): Promise<void> {
	execSync("ns version", { stdio: "inherit" });
}

run();
