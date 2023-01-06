import * as core from "@actions/core";

async function run() {
	const isDefined = (i) => !!i;

	const { GITHUB_REPOSITORY, GITHUB_ACTOR, GITHUB_SHA } = process.env;
	if (![GITHUB_REPOSITORY, GITHUB_ACTOR, GITHUB_SHA].every(isDefined)) {
		core.setFailed("Missing required environment value. Are you running in GitHub Actions?");
	}

	core.notice(`repo: ${GITHUB_REPOSITORY}, author: ${GITHUB_ACTOR}, commit: ${GITHUB_SHA}`);
}

exports.run = run;

/* istanbul ignore next */
if (require.main === module) {
	run();
}
