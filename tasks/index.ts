import { deployFiatTokenTask } from "./deployFiatToken/deployFiatToken.task";
import fiatTokenChangeAdmin from "./fiatTokenChangeAdmin.task";
import fiatTokenTransferOwnership from "./fiatTokenTransferOwnership.task";
import transferUsdcTask from "./transferUsdc.task";

export default {
	deployFiatTokenTask,
	fiatTokenTransferOwnership,
	fiatTokenChangeAdmin,
	transferUsdcTask,
};
