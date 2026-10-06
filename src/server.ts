import { createServer } from "node:http";
import { fulfill, orderBody } from "./order.ts";
import { infrai } from "./infrai.ts";

const BUCKET = "shop-images";
const port = Number(process.env.PORT ?? 3000);
let bucketReady: Promise<unknown> | undefined;
function ensureBucket() { return bucketReady ??= infrai.storage.bucket.create({ name: BUCKET }); }

async function json(request: import("node:http").IncomingMessage): Promise<unknown> {
  let text = ""; for await (const chunk of request) text += chunk; return JSON.parse(text || "{}");
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/orders") {
      const body = await json(request); const parsed = orderBody.parse(body); await ensureBucket();
      const original = await infrai.storage.object.head(BUCKET, parsed.imageKey);
      if (!original.found) throw new Error("image is not uploaded");
      const order = fulfill(parsed);
      response.writeHead(201, { "content-type": "application/json" }); response.end(JSON.stringify(order)); return;
    }
    response.writeHead(404); response.end("Not found");
  } catch (error) { response.writeHead(400, { "content-type": "application/json" }); response.end(JSON.stringify({ error: (error as Error).message })); }
});
server.listen(port, () => console.log(`order service listening on ${port}`));
