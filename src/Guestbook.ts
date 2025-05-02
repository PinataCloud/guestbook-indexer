import { ponder } from "ponder:registry";
import schema from "ponder:schema";
import { pinata } from "./pinata";
import { fetchWeb3BioProfile, extractProfileInfo } from "./web3bio";

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
  const { signer, message: uri, timestamp } = event.args;

  // Generate a unique ID for this entry
  const id = `${event.transaction.hash}-${event.log.logIndex}`;

  // Fetch and parse the URI data
  const uriData = await fetchFromUri(uri);

  // Extract relevant data from the URI
  let entryMessage = '';
  let imageUrl = '';

  if (uriData) {
    // If the URI points to JSON data with specific fields
    if (typeof uriData === 'object' && uriData !== null) {
      entryMessage = uriData.message || '';
      imageUrl = uriData.imageUrl || '';
    } else if (typeof uriData === 'string') {
      // If the URI directly contains the message
      entryMessage = uriData;
    }
  } else {
    // If we couldn't fetch/parse the URI, use it as the message
    entryMessage = uri;
  }

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

  await context.db.insert(schema.uriData).values({
    id,
    uri,
    parsedData: uriData || {},
  });

  // Store the guestbook entry
  await context.db.insert(schema.guestbookEntry).values({
    id,
    signer,
    message: entryMessage,
    imageUrl,
    timestamp: Number(timestamp),
    accountId: signer,
  });
});
