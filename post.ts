import * as core from "@actions/core";

async function run(): Promise<void> {
	console.log(`post-run path is ${process.env.PATH}`);
}

run();