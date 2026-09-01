import { NextResponse } from "next/server";
import { EventName } from "@paddle/paddle-node-sdk";

import { paddle } from "@/lib/paddle/client";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaddleCustomData = {
  company_id?: string;
};

type PaddleEventData = {
  id?: string;
  status?: string;
  customerId?: string;
  subscriptionId?: string;
  transactionId?: string;
  customData?: PaddleCustomData | null;
  items?: Array<{
    price?: {
      id?: string;
      productId?: string;
      billingCycle?: {
        interval?: string;
        frequency?: number;
      } | null;
    };
  }>;
  currencyCode?: string;
  billingCycle?: {
    interval?: string;
    frequency?: number;
  } | null;
  currentBillingPeriod?: {
    startsAt?: string | null;
    endsAt?: string | null;
  } | null;
  scheduledChange?: unknown;
  invoiceNumber?: string | null;
  details?: {
    totals?: {
      total?: string;
      tax?: string;
    };
  };
};

type PaddleWebhookEvent = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  notificationId: string;
  data: PaddleEventData;
};

function getCompanyId(
  data: PaddleEventData
): string | null {
  const companyId =
    data.customData?.company_id;

  if (
    typeof companyId !== "string" ||
    companyId.trim() === ""
  ) {
    return null;
  }

  return companyId;
}

async function saveWebhookEvent(
  event: PaddleWebhookEvent
) {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("paddle_webhook_events")
      .insert({
        event_id: event.eventId,
        event_type: event.eventType,
        notification_id:
          event.notificationId,
        occurred_at:
          event.occurredAt,
        payload: event,
        processed: false,
      })
      .select("id")
      .maybeSingle();

  if (error) {
    /*
     * PostgreSQL unique violation means
     * Paddle delivered an event that we
     * already received.
     */
    if (error.code === "23505") {
      return {
        duplicate: true,
        id: null,
      };
    }

    throw error;
  }

  return {
    duplicate: false,
    id: data?.id ?? null,
  };
}

async function markWebhookProcessed(
  webhookId: string
) {
  const supabase =
    await createClient();

  const { error } =
    await supabase
      .from("paddle_webhook_events")
      .update({
        processed: true,
        processed_at:
          new Date().toISOString(),
        error_message: null,
      })
      .eq("id", webhookId);

  if (error) {
    throw error;
  }
}

async function markWebhookFailed(
  webhookId: string,
  errorMessage: string
) {
  const supabase =
    await createClient();

  await supabase
    .from("paddle_webhook_events")
    .update({
      processed: false,
      error_message:
        errorMessage.slice(0, 2000),
    })
    .eq("id", webhookId);
}

async function upsertCustomer(
  event: PaddleWebhookEvent
) {
  const companyId =
    getCompanyId(event.data);

  const paddleCustomerId =
    event.data.customerId;

  if (!companyId || !paddleCustomerId) {
    console.warn(
      "Paddle customer event does not contain company_id/customerId.",
      event.eventId
    );

    return;
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase
      .from("paddle_customers")
      .upsert(
        {
          company_id: companyId,
          paddle_customer_id:
            paddleCustomerId,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "company_id",
        }
      );

  if (error) {
    throw error;
  }
}

async function upsertSubscription(
  event: PaddleWebhookEvent
) {
  const data = event.data;

  const companyId =
    getCompanyId(data);

  const subscriptionId =
    data.id;

  const customerId =
    data.customerId;

  if (
    !companyId ||
    !subscriptionId ||
    !customerId
  ) {
    throw new Error(
      `Subscription event ${event.eventId} is missing company_id, subscription id, or customer id.`
    );
  }

  const firstItem =
    data.items?.[0];

  const price =
    firstItem?.price;

  const billingCycle =
    data.billingCycle ??
    price?.billingCycle ??
    null;

  const currentPeriod =
    data.currentBillingPeriod;

  const supabase =
    await createClient();

  const { error } =
    await supabase
      .from("paddle_subscriptions")
      .upsert(
        {
          company_id: companyId,

          paddle_customer_id:
            customerId,

          paddle_subscription_id:
            subscriptionId,

          status:
            data.status ?? "unknown",

          price_id:
            price?.id ?? null,

          product_id:
            price?.productId ?? null,

          currency_code:
            data.currencyCode ?? null,

          billing_cycle_interval:
            billingCycle?.interval ??
            null,

          billing_cycle_frequency:
            billingCycle?.frequency ??
            null,

          current_period_start:
            currentPeriod?.startsAt ??
            null,

          current_period_end:
            currentPeriod?.endsAt ??
            null,

          scheduled_change:
            data.scheduledChange ??
            null,

          custom_data:
            data.customData ??
            null,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "paddle_subscription_id",
        }
      );

  if (error) {
    throw error;
  }
}

async function upsertTransaction(
  event: PaddleWebhookEvent
) {
  const data = event.data;

  const companyId =
    getCompanyId(data);

  const transactionId =
    data.id;

  if (
    !companyId ||
    !transactionId
  ) {
    throw new Error(
      `Transaction event ${event.eventId} is missing company_id or transaction id.`
    );
  }

  const totals =
    data.details?.totals;

  const supabase =
    await createClient();

  const { error } =
    await supabase
      .from("paddle_transactions")
      .upsert(
        {
          company_id: companyId,

          paddle_transaction_id:
            transactionId,

          paddle_customer_id:
            data.customerId ??
            null,

          paddle_subscription_id:
            data.subscriptionId ??
            null,

          status:
            data.status ??
            "completed",

          invoice_number:
            data.invoiceNumber ??
            null,

          currency_code:
            data.currencyCode ??
            null,

          total_amount:
            totals?.total ??
            null,

          tax_amount:
            totals?.tax ??
            null,

          custom_data:
            data.customData ??
            null,

          occurred_at:
            event.occurredAt,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "paddle_transaction_id",
        }
      );

  if (error) {
    throw error;
  }
}

async function processEvent(
  event: PaddleWebhookEvent
) {
  switch (event.eventType) {
    case EventName.CustomerCreated:
    case EventName.CustomerUpdated: {
      await upsertCustomer(event);
      break;
    }

    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionActivated:
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionPaused:
    case EventName.SubscriptionPastDue:
    case EventName.SubscriptionTrialing: {
      await upsertSubscription(event);
      break;
    }

    case EventName.TransactionCompleted:
    case EventName.TransactionUpdated:
    case EventName.TransactionPaid:
    case EventName.TransactionPaymentFailed: {
      await upsertTransaction(event);
      break;
    }

    default: {
      console.log(
        `Ignoring unsupported Paddle event: ${event.eventType}`
      );
    }
  }
}

export async function POST(
  request: Request
) {
  let webhookId: string | null = null;

  try {
    const signature =
      request.headers.get(
        "paddle-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing Paddle-Signature header.",
        },
        { status: 400 }
      );
    }

    const secret =
      process.env.PADDLE_WEBHOOK_SECRET;

    if (!secret) {
      console.error(
        "PADDLE_WEBHOOK_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Paddle webhook secret is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * IMPORTANT:
     *
     * Do not call request.json().
     *
     * Paddle signature verification requires
     * the original raw request body.
     */
    const rawBody =
      await request.text();

    if (!rawBody) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Empty webhook body.",
        },
        { status: 400 }
      );
    }

    const event =
      await paddle.webhooks.unmarshal(
        rawBody,
        secret,
        signature
      );

    const webhookEvent =
      event as unknown as PaddleWebhookEvent;

    /*
     * Store the event before processing it.
     *
     * event_id has a UNIQUE constraint, so
     * duplicate deliveries are automatically
     * detected.
     */
    const saved =
      await saveWebhookEvent(
        webhookEvent
      );

    if (saved.duplicate) {
      console.log(
        `Duplicate Paddle event ignored: ${webhookEvent.eventId}`
      );

      return new NextResponse(
        "ok",
        { status: 200 }
      );
    }

    webhookId =
      saved.id;

    if (!webhookId) {
      throw new Error(
        "Unable to create webhook event record."
      );
    }

    /*
     * Process the verified event.
     */
    await processEvent(
      webhookEvent
    );

    /*
     * Mark event as successfully
     * processed.
     */
    await markWebhookProcessed(
      webhookId
    );

    console.log(
      `Paddle webhook processed: ${webhookEvent.eventType} (${webhookEvent.eventId})`
    );

    return new NextResponse(
      "ok",
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Paddle webhook error:",
      error
    );

    if (webhookId) {
      await markWebhookFailed(
        webhookId,
        error instanceof Error
          ? error.message
          : "Unknown webhook processing error."
      ).catch(
        (markError) => {
          console.error(
            "Failed to mark webhook as failed:",
            markError
          );
        }
      );
    }

    /*
     * Return non-2xx so Paddle can retry
     * the notification when processing fails.
     */
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}