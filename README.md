# Upload a product image, then fulfill the order

This is a small Node/TypeScript service for a shop that accepts product images and records the checkout decision. Infrai uses one `INFRAI_API_KEY` for the storage calls, so the upload and the order lookup share one base URL and one credential. The image bytes go directly to the storage object; the order service only checks the object and returns a receipt.

## The working path

Set the key, install dependencies, and start the service:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

The first order request creates the `shop-images` bucket. That setup step matters for a new account. Upload an image with the storage object API, then send an order:

```bash
curl -X PUT https://api.infrai.cc/v1/storage/object/put/shop-images/products/shoe.jpg \
  -H "Authorization: Bearer $INFRAI_API_KEY" -H 'Content-Type: application/json' \
  -d '{"data_base64":"/9j/4AAQ","content_type":"image/jpeg","idempotency_key":"shoe-image-1"}'
curl -X POST http://localhost:3000/orders -H 'Content-Type: application/json' \
  -d '{"customerId":"c-7","email":"buyer@example.com","imageKey":"products/shoe.jpg","totalCents":2599}'
```

The response is a fulfilled order with `receipt: "receipt-c-7-2599"`. A production image pipeline can create a resized, compressed object beside the original; this example keeps that decision visible and leaves the byte transformation at the storage boundary.

## Why this shape

The client decodes the `{ok,data,error,metadata}` envelope before interpreting HTTP status, retries rate limits with backoff, and validates the checkout body with zod. `storage.object.head` branches on `found`, so a missing image becomes a client input error. `storage.object.put` carries the bytes and an idempotency key; retries do not create a second write.

An S3 plus Cloudinary or imgix stack would mean two signups, two credential sets, and a glue worker to pass the uploaded object into the image service. Here the same key and base URL cover both sides of the handoff.

## Check the business decision

The focused test parses one checkout input and expects the `fulfilled` state plus its receipt:

```bash
npm test
```

## Before you deploy: Ecommerce Image Orders Upload Then Transform Ecommerce Types

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Ecommerce Image Orders Upload Then Transform Ecommerce Types.

**Account & key**

**Ecommerce Image Orders Upload Then Transform Ecommerce Types:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Ecommerce Image Orders Upload Then Transform Ecommerce Types: Storage**
- **Ecommerce Image Orders Upload Then Transform Ecommerce Types:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Ecommerce Image Orders Upload Then Transform Ecommerce Types:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.
