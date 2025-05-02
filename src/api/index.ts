import { Hono } from "hono";
import { db } from "ponder:api";
import schema from "ponder:schema";
import { eq } from "drizzle-orm";
import { pinata } from "../pinata";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, world!");
});

app.get("/entries", async (c) => {
  const entries = await db
    .select({
      id: schema.guestbookEntry.id,
      signer: schema.guestbookEntry.signer,
      message: schema.guestbookEntry.message,
      imageUrl: schema.guestbookEntry.imageUrl,
      timestamp: schema.guestbookEntry.timestamp,
      farcasterName: schema.account.farcasterName,
      farcasterDisplayName: schema.account.farcasterDisplayName,
      farcasterAvatar: schema.account.farcasterAvatar,
      ensName: schema.account.ensName,
      lensHandle: schema.account.lensHandle,
    })
    .from(schema.guestbookEntry)
    .leftJoin(schema.account, eq(schema.guestbookEntry.signer, schema.account.address));

  return c.json(entries);
});

app.get("/accounts", async (c) => {
  const accounts = await db
    .select()
    .from(schema.account);

  return c.json(accounts);
});

app.get("/presigned_url", async (c) => {
  const url = await pinata.upload.public.createSignedURL({
    expires: 30,
    mimeTypes: ["image/gif", "application/json"]
  })

  return c.json(url)
})

export default app;
