import { createEnvAddressGetter } from "@concero/contract-utils";

import { envPrefixes } from "../constants";

export const { getEnvAddress } = createEnvAddressGetter({
	prefixes: envPrefixes,
});
