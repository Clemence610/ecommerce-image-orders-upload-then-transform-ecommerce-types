import { z } from "zod";

export const orderBody = z.object({
  customerId: z.string().min(1),
  email: z.string().email(),
  imageKey: z.string().min(1),
  totalCents: z.number().int().nonnegative()
});
export type Order = z.infer<typeof orderBody> & { status: "paid" | "fulfilled"; receipt: string };

export function fulfill(input: unknown): Order {
  const value = orderBody.parse(input);
  return { ...value, status: "fulfilled", receipt: `receipt-${value.customerId}-${value.totalCents}` };
}
