
import { NextRequest, NextResponse } from "next/server";
import { Paddle } from "@paddle/paddle-node-sdk";

import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const paddleApiKey = process.env.PADDLE_API_KEY;
const paddleWebhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

if (!paddleApiKey) {
  throw new Error("PADDLE_API_KEY is not configured.");
}

if (!paddleWebhookSecret) {
  throw new Error("PADDLE_WEBHOOK_SECRET is not configured.");
}

const paddle = new Paddle(paddleApiKey);
const webhookSecret = paddleWebhookSecret;

const PRICE_TO_PLAN: Record<
  string,
  "pro" | "business"
> = {
  "pri_01m0784wpq5xjxyjg1a8f1kk3m": "pro",
  "pri_01m078kjpwsq7pgxbxvsq362qm": "business",
};

const SUPPORTED_EVENTS = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.activated",
  "subscription.trialing",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
  "subscription.canceled",
]);

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("paddle-signature");

    if (!signature) {
      return NextResponse.json(
        {
          error: "Missing Paddle signature.",
        },
        { status: 400 }
      );
    }

    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        {
          error: "Empty webhook body.",
        },
        { status: 400 }
      );
    }

    const eventData = await paddle.webhooks.unmarshal(
      rawBody,
      webhookSecret,
      signature
    );

    console.log("[Paddle Webhook] Verified:", {
      eventId: eventData.eventId,
      eventType: eventData.eventType,
    });

    /*
     * Only subscription events are processed below.
     *
     * This narrowing is important because Paddle's SDK
     * returns a union containing many different event types.
     */
    if (!SUPPORTED_EVENTS.has(eventData.eventType)) {
      console.log(
        "[Paddle Webhook] Ignored event:",
        eventData.eventType
      );

      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    /*
     * TypeScript still sees eventData.data as a broad union.
     * Parse the verified payload so we can safely work with
     * the subscription fields.
     */
    const rawEvent = JSON.parse(rawBody) as {
      event_type?: string;
      data?: {
        id?: string;
        status?: string;
        customer_id?: string;
        currency_code?: string;
        items?: Array<{
          price?: {
            id?: string;
            product_id?: string;
          };
        }>;
        current_billing_period?: {
          starts_at?: string;
          ends_at?: string;
        };
        scheduled_change?: {
          action?: string;
          effective_at?: string | null;
        } | null;
        custom_data?: Record<string, unknown> | null;
        billing_cycle?: {
          interval?: string;
          frequency?: number;
        } | null;
      };
    };

    const subscription = rawEvent.data;

    if (!subscription) {
      throw new Error(
        "Paddle subscription data is missing."
      );
    }

    const subscriptionId = subscription.id;

    if (!subscriptionId) {
      throw new Error(
        "Paddle subscription ID is missing."
      );
    }

    /*
     * Paddle custom data contains the Decisionly company ID.
     */
    const customData = subscription.custom_data ?? null;

    const companyId =
      typeof customData?.company_id === "string"
        ? customData.company_id
        : null;

    if (!companyId) {
      console.error(
        "[Paddle Webhook] Missing company_id in custom_data:",
        {
          subscriptionId,
          eventType: eventData.eventType,
          customData,
        }
      );

      return NextResponse.json(
        {
          error:
            "Missing company_id in Paddle subscription custom_data.",
        },
        { status: 400 }
      );
    }

    /*
     * Determine the Decisionly plan from the Paddle price.
     */
    const firstItem = subscription.items?.[0];

    const priceId =
      firstItem?.price?.id ?? null;

    const productId =
      firstItem?.price?.product_id ?? null;

    const plan = priceId
      ? PRICE_TO_PLAN[priceId]
      : undefined;

    if (!plan) {
      console.error(
        "[Paddle Webhook] Unsupported Paddle price:",
        {
          subscriptionId,
          companyId,
          priceId,
          productId,
        }
      );

      return NextResponse.json(
        {
          error: "Unsupported Paddle price.",
        },
        { status: 400 }
      );
    }

    const status = subscription.status ?? "active";

    const currentPeriodStart =
      subscription.current_billing_period?.starts_at ??
      null;

    const currentPeriodEnd =
      subscription.current_billing_period?.ends_at ??
      null;

    const scheduledChange =
      subscription.scheduled_change ?? null;

    const customerId =
      subscription.customer_id ?? null;

    const currencyCode =
      subscription.currency_code ?? null;

    const billingCycle =
      subscription.billing_cycle ?? null;

    /*
     * ---------------------------------------------------------
     * 1. Synchronize paddle_subscriptions
     * ---------------------------------------------------------
     */

    const {
      data: existingPaddleSubscription,
      error: findError,
    } = await supabaseAdmin
      .from("paddle_subscriptions")
      .select("id")
      .eq(
        "paddle_subscription_id",
        subscriptionId
      )
      .maybeSingle();

    if (findError) {
      console.error(
        "[Paddle Webhook] Failed to find paddle subscription:",
        findError
      );

      throw new Error(
        "Failed to find existing Paddle subscription."
      );
    }

    const paddleSubscriptionPayload = {
      company_id: companyId,
      paddle_customer_id: customerId,
      paddle_subscription_id: subscriptionId,
      status,
      price_id: priceId,
      product_id: productId,
      currency_code: currencyCode,
      billing_cycle_interval:
        billingCycle?.interval ?? null,
      billing_cycle_frequency:
        billingCycle?.frequency ?? null,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      scheduled_change: scheduledChange,
      custom_data: customData,
      updated_at: new Date().toISOString(),
    };

    if (existingPaddleSubscription?.id) {
      const {
        error: updatePaddleError,
      } = await supabaseAdmin
        .from("paddle_subscriptions")
        .update(paddleSubscriptionPayload)
        .eq(
          "id",
          existingPaddleSubscription.id
        );

      if (updatePaddleError) {
        console.error(
          "[Paddle Webhook] Failed to update paddle_subscriptions:",
          updatePaddleError
        );

        throw new Error(
          "Failed to update Paddle subscription."
        );
      }
    } else {
      const {
        error: insertPaddleError,
      } = await supabaseAdmin
        .from("paddle_subscriptions")
        .insert({
          ...paddleSubscriptionPayload,
          created_at: new Date().toISOString(),
        });

      if (insertPaddleError) {
        console.error(
          "[Paddle Webhook] Failed to insert paddle_subscriptions:",
          insertPaddleError
        );

        throw new Error(
          "Failed to insert Paddle subscription."
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 2. Synchronize subscriptions
     * ---------------------------------------------------------
     */

    const {
      data: existingSubscription,
      error: subscriptionFindError,
    } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("company_id", companyId)
      .maybeSingle();

    if (subscriptionFindError) {
      console.error(
        "[Paddle Webhook] Failed to find Decisionly subscription:",
        subscriptionFindError
      );

      throw new Error(
        "Failed to find Decisionly subscription."
      );
    }

    const subscriptionPayload = {
      company_id: companyId,
      plan,
      status,
      paddle_customer_id: customerId,
      paddle_subscription_id: subscriptionId,
      paddle_price_id: priceId,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end:
        scheduledChange?.action === "cancel",
      updated_at: new Date().toISOString(),
    };

    if (existingSubscription?.id) {
      const {
        error: updateSubscriptionError,
      } = await supabaseAdmin
        .from("subscriptions")
        .update(subscriptionPayload)
        .eq(
          "id",
          existingSubscription.id
        );

      if (updateSubscriptionError) {
        console.error(
          "[Paddle Webhook] Failed to update subscriptions:",
          updateSubscriptionError
        );

        throw new Error(
          "Failed to update Decisionly subscription."
        );
      }
    } else {
      const {
        error: insertSubscriptionError,
      } = await supabaseAdmin
        .from("subscriptions")
        .insert(subscriptionPayload);

      if (insertSubscriptionError) {
        console.error(
          "[Paddle Webhook] Failed to create subscriptions:",
          insertSubscriptionError
        );

        throw new Error(
          "Failed to create Decisionly subscription."
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 3. Success
     * ---------------------------------------------------------
     */

    console.log(
      "[Paddle Webhook] Subscription synchronized:",
      {
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        companyId,
        subscriptionId,
        plan,
        status,
        priceId,
        currentPeriodStart,
        currentPeriodEnd,
      }
    );

    return NextResponse.json({
      success: true,
      companyId,
      subscriptionId,
      plan,
      status,
    });
  } catch (error) {
    console.error(
      "[Paddle Webhook] Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid or failed Paddle webhook.",
      },
      { status: 400 }
    );
  }
}

