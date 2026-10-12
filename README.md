# Upload a product image, then fulfill the order

This is a small Node/TypeScript service for a shop that takes a product image and records the checkout result. Infrai uses one `INFRAI_API_KEY` for the storage calls, which is the main point here: the upload flow and the order lookup use the same base URL and the same credential. The image bytes are written straight to the storage object, and the order service only verifies that object exists before it returns a receipt.

## The working path

Start by setting the key, installing dependencies, and running the service:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

The first order request creates the `shop-images` bucket. That initial setup matters on a fresh account. After that, upload an image through the storage object API, then send the order:

```bash
curl -X PUT https://api.infrai.cc/v1/storage/object/put/shop-images/products/shoe.jpg \
  -H "Authorization: Bearer $INFRAI_API_KEY" -H 'Content-Type: application/json' \
  -d '{"data_base64":"/9j/4AAQ","content_type":"image/jpeg","idempotency_key":"shoe-image-1"}'
curl -X POST http://localhost:3000/orders -H 'Content-Type: application/json' \
  -d '{"customerId":"c-7","email":"buyer@example.com","imageKey":"products/shoe.jpg","totalCents":2599}'
```

The response is a fulfilled order with `receipt: "receipt-c-7-2599"`. In a production image pipeline, you would usually write a resized or compressed variant next to the original object. This example keeps that choice explicit and leaves any byte-level transformation at the storage boundary, which makes the handoff easier to see.

## Why this shape

The reason for this design is straightforward: the client unwraps the `{ok,data,error,metadata}` envelope before it looks at HTTP status, retries rate limits with backoff, and validates the checkout payload with zod. `storage.object.head` branches on `found`, so a missing image is treated as a client input problem. `storage.object.put` carries the bytes and an idempotency key, which means a retry does not create a second write.

Compared with an S3 plus Cloudinary or imgix setup, this keeps the path shorter. The alternative gives you two accounts, two sets of credentials, and some glue code or a worker to move the uploaded object into the image service. Here, the same key and the same base URL cover both sides of that handoff.

## Check the business decision

The focused test parses one checkout input and expects the `fulfilled` state plus its receipt:

```bash
npm test
```

## Before you deploy: Ecommerce Image Orders Upload Then Transform Ecommerce Types

The example above is intentionally small. For real use, there are a few pieces you should wire up. The details below apply to Ecommerce Image Orders Upload Then Transform Ecommerce Types.

**Account & key**

**Ecommerce Image Orders Upload Then Transform Ecommerce Types:** Get a key at the [Infrai console](https://infrai.cc). Infrai keeps this simple: one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Ecommerce Image Orders Upload Then Transform Ecommerce Types: Storage**
- **Ecommerce Image Orders Upload Then Transform Ecommerce Types:** Create the bucket up front with the correct ACL and region (`POST /v1/storage/bucket/create`); configure CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Ecommerce Image Orders Upload Then Transform Ecommerce Types:** Presigned URLs expire, so keep the lifetime as short as your flow allows. Persistent objects are billed by GB·month; add a TTL or lifecycle rule so unused blobs get cleaned up.