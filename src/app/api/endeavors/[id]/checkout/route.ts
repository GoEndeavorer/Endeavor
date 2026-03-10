import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, payment } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { type } = await request.json();
  const isJoin = type === "join";
  const isDonation = type === "donation";

  if (!isJoin && !isDonation) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (isJoin && (!end.costPerPerson || end.costPerPerson <= 0)) {
    return NextResponse.json(
      { error: "This endeavor is free to join" },
      { status: 400 }
    );
  }

  if (isDonation && !end.fundingEnabled) {
    return NextResponse.json(
      { error: "Funding is not enabled for this endeavor" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  const amount = isJoin ? end.costPerPerson! * 100 : undefined; // cents

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(isJoin
      ? {
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Join: ${end.title}`,
                  description: `Cost to join this endeavor`,
                },
                unit_amount: amount!,
              },
              quantity: 1,
            },
          ],
        }
      : {
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Fund: ${end.title}`,
                  description: `Donation to this endeavor`,
                },
                unit_amount: 100, // $1 minimum, user adjusts via quantity
              },
              adjustable_quantity: {
                enabled: true,
                minimum: 1,
                maximum: 100000,
              },
              quantity: 10, // default $10
            },
          ],
        }),
    success_url: `${baseUrl}/endeavors/${id}?payment=success`,
    cancel_url: `${baseUrl}/endeavors/${id}?payment=cancelled`,
    metadata: {
      endeavorId: id,
      userId: session.user.id,
      type,
    },
  });

  // Record pending payment
  await db.insert(payment).values({
    endeavorId: id,
    userId: session.user.id,
    type: isJoin ? "join" : "donation",
    amount: isJoin ? amount! : 0, // will be updated by webhook
    stripeSessionId: checkoutSession.id,
    status: "pending",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
