import { execSync } from "child_process";

async function run(): Promise<void> {
	console.log(`post-run path is ${process.env.PATH}`);

	execSync("ns version", { stdio: "inherit" });
}

run();
