import * as core from "@actions/core";
import { assert } from "console";

async function run(): Promise<void> {
	try {
		const isDefined = (i: any) => !!i;

		const { GITHUB_REPOSITORY, GITHUB_ACTOR, GITHUB_SHA } = process.env;
		assert(
			[GITHUB_REPOSITORY, GITHUB_ACTOR, GITHUB_SHA].every(isDefined),
			"Missing required environment value. Are you running in GitHub Actions?"
		);

		console.log(
			`main run: repo: ${GITHUB_REPOSITORY}, author: ${GITHUB_ACTOR}, commit: ${GITHUB_SHA}`
		);
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
