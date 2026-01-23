import { HardhatRuntimeEnvironment } from "hardhat/types";

import { conceroNetworks, getViemReceiptConfig } from "../constants";
import { DEPLOY_CONFIG_TESTNET } from "../constants/deployConfigTestnet";
import { copyMetadataForVerification, saveVerificationData } from "../tasks/utils";
import { EnvFileName } from "../types/deploymentVariables";
import {
	IDeployResult,
	err,
	genericDeploy,
	getEnvVar,
	getFallbackClients,
	getNetworkEnvKey,
	getViemAccount,
	log,
	updateEnvVariable,
} from "../utils";

export const deployFiatTokenProxy = async (
	hre: HardhatRuntimeEnvironment,
): Promise<IDeployResult> => {
	const { name: srcChainName } = hre.network;
	const srcChain = conceroNetworks[srcChainName as keyof typeof conceroNetworks];
	const { type: networkType } = srcChain;

	const implementation = getEnvVar(`USDC_${getNetworkEnvKey(srcChainName)}`);

	const viemAccount = getViemAccount(networkType, "deployer");
	const { walletClient, publicClient } = getFallbackClients(srcChain, viemAccount);

	let gasLimit = 0;
	const config = DEPLOY_CONFIG_TESTNET[srcChainName];
	if (config) {
		gasLimit = config.proxy?.gasLimit || 0;
	}

	const deployment = await genericDeploy(
		{
			hre,
			contractName: "FiatTokenProxy",
			txParams: {
				gasLimit: BigInt(gasLimit),
			},
		},
		implementation,
	);

	updateEnvVariable(
		`USDC_PROXY_${getNetworkEnvKey(deployment.chainName)}`,
		deployment.address,
		`deployments.${deployment.chainType}` as EnvFileName,
	);

	const fiatTokenProxyAdminAddress = getEnvVar(
		`USDC_PROXY_ADMIN_${getNetworkEnvKey(srcChainName)}`,
	);

	const { abi: fiatTokenProxyAbi } = await import(
		"../artifacts/contracts/usdc/v1/FiatTokenProxy.sol/FiatTokenProxy.json"
	);

	try {
		const changeAdminTxHash = await walletClient.writeContract({
			address: deployment.address as `0x${string}`,
			abi: fiatTokenProxyAbi,
			functionName: "changeAdmin",
			account: viemAccount,
			args: [fiatTokenProxyAdminAddress as `0x${string}`],
		});

		await publicClient.waitForTransactionReceipt({
			...getViemReceiptConfig(srcChain),
			hash: changeAdminTxHash,
		});

		log(`Change admin completed: ${changeAdminTxHash}`, "deployFiatTokenProxy", srcChainName);
	} catch (error) {
		err(`Failed to change admin: ${error}`, "deployFiatTokenProxy", srcChainName);
	}

	try {
		await saveVerificationData(
			srcChainName,
			"FiatTokenProxy",
			deployment.address,
			deployment.receipt.hash,
		);
		await copyMetadataForVerification(srcChainName, "FiatTokenProxy");
	} catch (error) {
		log(
			`Warning: Failed to save verification data: ${error}`,
			"deployFiatTokenProxy",
			srcChainName,
		);
	}

	return deployment;
};
