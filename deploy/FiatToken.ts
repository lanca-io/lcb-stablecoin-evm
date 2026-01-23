import { HardhatRuntimeEnvironment } from "hardhat/types";

import { DEPLOY_CONFIG_TESTNET } from "../constants/deployConfigTestnet";
import { copyMetadataForVerification, saveVerificationData } from "../tasks/utils";
import { EnvFileName } from "../types/deploymentVariables";
import { IDeployResult, genericDeploy, getNetworkEnvKey, log, updateEnvVariable } from "../utils";

export const deployFiatToken = async (hre: HardhatRuntimeEnvironment): Promise<IDeployResult> => {
	const { name } = hre.network;

	let gasLimit = 0;
	const config = DEPLOY_CONFIG_TESTNET[name];
	if (config) {
		gasLimit = config.usdc?.gasLimit || 0;
	}

	const signatureCheckerDeployment = await genericDeploy({
		hre,
		contractName: "SignatureChecker",
	});

	const signatureCheckerAddress = signatureCheckerDeployment.address;

	const deployment = await genericDeploy({
		hre,
		contractName: "FiatTokenV2_2",
		txParams: {
			gasLimit: BigInt(gasLimit),
			libraries: {
				SignatureChecker: signatureCheckerAddress,
			},
		},
	});

	updateEnvVariable(
		`USDC_${getNetworkEnvKey(deployment.chainName)}`,
		deployment.address,
		`deployments.${deployment.chainType}` as EnvFileName,
	);

	await saveVerificationData(
		name,
		"SignatureChecker",
		signatureCheckerAddress,
		signatureCheckerDeployment.receipt.hash,
	);
	await saveVerificationData(name, "FiatTokenV2_2", deployment.address, deployment.receipt.hash);

	await copyMetadataForVerification(name, "SignatureChecker");
	await copyMetadataForVerification(name, "FiatTokenV2_2");

	if (hre.network.live) {
		try {
			log("Verifying FiatTokenV2_2 contract...", "deployFiatToken", name);
			await hre.run("verify:verify", {
				address: deployment.address,
				constructorArguments: [],
				libraries: {
					SignatureChecker: signatureCheckerAddress,
				},
			});
		} catch (error) {
			log(`Verification failed: ${error}`, "deployFiatToken", name);
		}
	}

	return deployment;
};
