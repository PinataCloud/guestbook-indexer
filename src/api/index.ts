import { Hono } from "hono";
import { db } from "ponder:api";
import schema from "ponder:schema";


const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, world!");
});

app.get("/entries", async (c) => {
  const entries = await db
    .select()
    .from(schema.guestbookEntry)
  return c.json(entries)
})

export default app;
