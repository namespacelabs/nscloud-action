import * as core from "@actions/core";
import { assert } from "console";

try {
	const isDefined = (i) => !!i;

	const { GITHUB_REPOSITORY, GITHUB_ACTOR, GITHUB_SHA } = process.env;
	assert(
		[GITHUB_REPOSITORY, GITHUB_ACTOR, GITHUB_SHA].every(isDefined),
		"Missing required environment value. Are you running in GitHub Actions?"
	);

	console.log(`repo: ${GITHUB_REPOSITORY}, author: ${GITHUB_ACTOR}, commit: ${GITHUB_SHA}`);
} catch (error) {
	core.setFailed(error.message);
}
