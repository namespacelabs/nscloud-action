import { spawnSync } from "child_process";

async function run(): Promise<void> {
	console.log(`post-run path is ${process.env.PATH}`);

	spawnSync("ns version", { stdio: "inherit" });
}

run();
