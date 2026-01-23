import { HardhatRuntimeEnvironment } from "hardhat/types";

import { DEPLOY_CONFIG_TESTNET } from "../constants/deployConfigTestnet";
import { EnvFileName } from "../types/deploymentVariables";
import {
	IDeployResult,
	genericDeploy,
	getEnvVar,
	getNetworkEnvKey,
	updateEnvVariable,
} from "../utils";

export const deployFiatTokenProxyAdmin = async (
	hre: HardhatRuntimeEnvironment,
): Promise<IDeployResult> => {
	const { name: srcChainName } = hre.network;

	const implementation = getEnvVar(`USDC_${getNetworkEnvKey(srcChainName)}`);

	let gasLimit = 0;
	const config = DEPLOY_CONFIG_TESTNET[srcChainName];
	if (config) {
		gasLimit = config.proxyAdmin?.gasLimit || 0;
	}

	const deployment = await genericDeploy(
		{
			hre,
			contractName: "AdminUpgradeabilityProxy",
			txParams: {
				gasLimit: BigInt(gasLimit),
			},
		},
		implementation,
	);

	updateEnvVariable(
		`USDC_PROXY_ADMIN_${getNetworkEnvKey(deployment.chainName)}`,
		deployment.address,
		`deployments.${deployment.chainType}` as EnvFileName,
	);

	return deployment;
};
