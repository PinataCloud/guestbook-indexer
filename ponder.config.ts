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
      address: "0xF89E1749D28a5fEbB984584D795Abe17218AA2a7",
      network: "arbitrum",
      startBlock: 333596361
    },
  },
});
