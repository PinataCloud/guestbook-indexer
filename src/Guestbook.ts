import { ponder } from "ponder:registry";
import schema from "ponder:schema";
import { pinata } from "./pinata";
import { fetchWeb3BioProfile, extractProfileInfo } from "./web3bio";
import { buffer } from "node:stream/consumers";
import { group } from "node:console";
import { or } from "ponder";

type UriData = {
  message: string;
  imageUrl: string;
};

// Function to fetch and parse IPFS or HTTP content
async function fetchFromUri(uri: string): Promise<UriData | undefined> {
  try {
    const res = await pinata.gateways.public.get(uri);
    if (!res.data) {
      throw Error("Problem fetching content");
    }
    const data = res.data as unknown as UriData;
    return data;
  } catch (error) {
    console.error(`Error fetching URI ${uri}:`, error);
    return undefined;
  }
}

ponder.on("Guestbook:NewEntry", async ({ event, context }) => {
  const { signer, message, imageUrl, timestamp } = event.args;

  // Generate a unique ID for this entry
  const id = `${event.transaction.hash}-${event.log.logIndex}`;

  // Fetch Web3.bio profile data
  const profiles = await fetchWeb3BioProfile(signer);
  const profileInfo = extractProfileInfo(profiles);

  // Store or update account information using the proper upsert pattern
  await context.db
    .insert(schema.account)
    .values({
      address: signer,
      farcasterName: profileInfo.farcasterName,
      farcasterDisplayName: profileInfo.farcasterDisplayName,
      farcasterAvatar: profileInfo.farcasterAvatar,
      farcasterDescription: profileInfo.farcasterDescription,
      farcasterFollowers: profileInfo.farcasterFollowers,
      ensName: profileInfo.ensName,
      lensHandle: profileInfo.lensHandle,
      lastUpdated: Number(timestamp),
    })
    .onConflictDoUpdate(() => ({
      farcasterName: profileInfo.farcasterName,
      farcasterDisplayName: profileInfo.farcasterDisplayName,
      farcasterAvatar: profileInfo.farcasterAvatar,
      farcasterDescription: profileInfo.farcasterDescription,
      farcasterFollowers: profileInfo.farcasterFollowers,
      ensName: profileInfo.ensName,
      lensHandle: profileInfo.lensHandle,
      lastUpdated: Number(timestamp),
    }));


  // Store the guestbook entry
  await context.db.insert(schema.guestbookEntry).values({
    id,
    signer,
    message,
    imageUrl,
    timestamp: Number(timestamp),
    accountId: signer,
  });

  function stringifyWithBigInt(value: any) {
    return JSON.stringify(value, (_, v) =>
      typeof v === 'bigint' ? `${v}n` : v
    );
  }
  const serializedEvent = stringifyWithBigInt(event);
  const blob = new Blob([serializedEvent])
  const file = new File([blob], "event.json", { type: "application/json" })

  const store = await pinata.upload.public.file(file)
    .keyvalues({
      id,
      signer,
      message,
      imageUrl,
      timestamp: Number(timestamp).toString(),
      accountId: signer,
    })
    .group("9003e1ad-b0d9-45b2-baed-7baae19781a3")

  // Used to parse event.json to restore BigInt
  // function parse(text) {
  //     return JSON.parse(text, (_, value) => {
  //         if (typeof value === 'string') {
  //             const m = value.match(/(-?\d+)n/);
  //             if (m && m[0] === value) {
  //                 value = BigInt(m[1]);
  //             }
  //         }
  //         return value;
  //     });
  // }

  console.log("Event stored: ", store.cid)
});
