import { onchainTable } from "ponder";

export const account = onchainTable("account", (t) => ({
  address: t.hex().primaryKey(),
}));

export const guestbookEntry = onchainTable("guestbook_entry", (t) => ({
  id: t.text().primaryKey(), // Could be a combination of tx hash and log index
  signer: t.hex().notNull(), // The address of the person who signed
  message: t.text(), // The message from the URI
  imageUrl: t.text(), // The image URL from the URI
  timestamp: t.integer().notNull(), // When the entry was created
}));

// If you want to store the raw URI data as well
export const uriData = onchainTable("uri_data", (t) => ({
  id: t.text().primaryKey(), // Same as the entry ID
  uri: t.text().notNull(), // The raw URI string
  parsedData: t.json(), // The parsed URI JSON object
}));
