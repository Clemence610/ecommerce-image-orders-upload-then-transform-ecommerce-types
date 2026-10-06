import assert from "node:assert/strict";
import { fulfill } from "../src/order.ts";

const order = fulfill({ customerId: "c-7", email: "buyer@example.com", imageKey: "products/shoe.jpg", totalCents: 2599 });
assert.equal(order.status, "fulfilled");
assert.equal(order.receipt, "receipt-c-7-2599");
console.log("order decision test passed");
