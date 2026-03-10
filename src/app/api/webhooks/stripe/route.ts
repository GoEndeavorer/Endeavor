import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { payment, endeavor, member } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { endeavorId, userId, type } = session.metadata || {};

    if (!endeavorId || !userId || !type) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const amountTotal = session.amount_total || 0;

    // Update payment record
    await db
      .update(payment)
      .set({
        status: "completed",
        amount: amountTotal,
        stripePaymentIntentId: session.payment_intent as string,
      })
      .where(eq(payment.stripeSessionId, session.id));

    if (type === "join") {
      // Auto-add as approved member after payment
      const [existing] = await db
        .select()
        .from(member)
        .where(
          and(eq(member.endeavorId, endeavorId), eq(member.userId, userId))
        )
        .limit(1);

      if (!existing) {
        await db.insert(member).values({
          endeavorId,
          userId,
          role: "collaborator",
          status: "approved",
        });
      } else if (existing.status !== "approved") {
        await db
          .update(member)
          .set({ status: "approved" })
          .where(eq(member.id, existing.id));
      }
    }

    if (type === "donation") {
      // Update funding raised
      await db
        .update(endeavor)
        .set({
          fundingRaised: sql`${endeavor.fundingRaised} + ${Math.round(amountTotal / 100)}`,
        })
        .where(eq(endeavor.id, endeavorId));
    }
  }

  return NextResponse.json({ received: true });
}
