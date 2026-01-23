import { createEnvUpdater } from "@concero/contract-utils";

import { envPrefixes } from "../constants";
import { EnvFileName, EnvPrefixes } from "../types/deploymentVariables";

const { updateEnvAddress, updateEnvVariable } = createEnvUpdater<EnvPrefixes, EnvFileName>({
	prefixes: envPrefixes,
	basePath: process.cwd(),
});

export { updateEnvAddress, updateEnvVariable };
