import { exec } from "child_process";

async function run(): Promise<void> {
	console.log(`post-run path is ${process.env.PATH}`);
	exec("ns version");
}

run();
