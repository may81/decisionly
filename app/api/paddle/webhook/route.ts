
import { NextRequest, NextResponse } from "next/server";
import { EventName, Paddle } from "@paddle/paddle-node-sdk";

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
const webhookSecret: string = paddleWebhookSecret;

export async function POST(request: NextRequest) {
  try {
    const signatureHeader = request.headers.get("paddle-signature");

    if (!signatureHeader) {
      return NextResponse.json(
        { error: "Missing Paddle signature." },
        { status: 400 }
      );
    }

    const signature: string = signatureHeader;

    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        { error: "Empty webhook body." },
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

    // ...
  } catch (error) {
    console.error("[Paddle Webhook] Error:", error);

    return NextResponse.json(
      { error: "Invalid or failed Paddle webhook." },
      { status: 400 }
    );
  }
}