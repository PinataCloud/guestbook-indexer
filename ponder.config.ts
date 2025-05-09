import { createConfig } from "ponder";
import { http } from "viem";

import { GuestbookAbi } from "./abis/GuestbookAbi";

export default createConfig({
	networks: {
		arbitrum: {
			chainId: 42161,
			transport: http(process.env.PONDER_RPC_URL_42161),
			pollingInterval: 1_500,
		},
	},
	contracts: {
		Guestbook: {
			abi: GuestbookAbi,
			address: "0x64db8B9EccdFeaC65cdC8c1B0F25d79431BB8B7E",
			network: "arbitrum",
			startBlock: 333596361,
		},
	},
});
