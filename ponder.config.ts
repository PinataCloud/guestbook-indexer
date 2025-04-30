import { createConfig } from "ponder";
import { http } from "viem";

import { UnverifiedContractAbi } from "./abis/UnverifiedContractAbi";

export default createConfig({
  networks: {
    arbitrum: {
      chainId: 42161,
      transport: http(process.env.PONDER_RPC_URL_42161),
    },
  },
  contracts: {
    UnverifiedContract: {
      abi: UnverifiedContractAbi,
      address: "0x9229B7261685C222483f3f539EC14962c0B0b041",
      network: "arbitrum",
    },
  },
});
