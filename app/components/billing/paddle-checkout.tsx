
"use client";

import { useState } from "react";
import {
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";

type PaddleCheckoutProps = {
  priceId: string;
  companyId: string;
  children: React.ReactNode;
  className?: string;
};

type BillingResponse = {
  success?: boolean;
  companyId?: string;
  subscription?: {
    paddle_customer_id?: string | null;
    paddle_subscription_id?: string | null;
    paddle_price_id?: string | null;
    plan?: string;
    status?: string;
  };
  error?: string;
};

export default function PaddleCheckout({
  priceId,
  companyId,
  children,
  className,
}: PaddleCheckoutProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (loading) return;

    if (!companyId) {
      console.error("Paddle Checkout: company ID is missing.");
      return;
    }

    if (!priceId) {
      console.error("Paddle Checkout: price ID is missing.");
      return;
    }

    try {
      setLoading(true);

      /*
       * ---------------------------------------------------------
       * 1. LIVE CLIENT-SIDE TOKEN
       * ---------------------------------------------------------
       */

      const clientToken =
        process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

      if (!clientToken) {
        throw new Error(
          "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured."
        );
      }

      /*
       * ---------------------------------------------------------
       * 2. GET PADDLE CUSTOMER ID
       * ---------------------------------------------------------
       */

      let paddleCustomerId: string | null = null;

      try {
        const billingResponse = await fetch("/api/billing", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (billingResponse.ok) {
          const billing: BillingResponse =
            await billingResponse.json();

          paddleCustomerId =
            billing.subscription?.paddle_customer_id ?? null;

          /*
           * Safety check:
           * Retain requires a real Paddle customer ID.
           */
          if (
            paddleCustomerId &&
            !paddleCustomerId.startsWith("ctm_")
          ) {
            console.warn(
              "[Paddle Checkout] Invalid Paddle customer ID received."
            );

            paddleCustomerId = null;
          }
        } else {
          console.warn(
            "[Paddle Checkout] Unable to load billing information."
          );
        }
      } catch (billingError) {
        console.warn(
          "[Paddle Checkout] Billing lookup failed:",
          billingError
        );
      }

      /*
       * ---------------------------------------------------------
       * 3. INITIALIZE PADDLE
       * ---------------------------------------------------------
       *
       * pwCustomer belongs here, not inside Checkout.open().
       */

      const paddle: Paddle | undefined =
        await initializePaddle({
          token: clientToken,
          environment: "production",

          ...(paddleCustomerId
            ? {
                pwCustomer: {
                  id: paddleCustomerId,
                },
              }
            : {
                pwCustomer: {},
              }),
        });

      if (!paddle) {
        throw new Error(
          "Paddle could not be initialized."
        );
      }

      /*
       * ---------------------------------------------------------
       * 4. OPEN CHECKOUT
       * ---------------------------------------------------------
       */

      paddle.Checkout.open({
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],

        /*
         * Keep company_id.
         *
         * The Decisionly webhook uses this value to associate
         * Paddle transactions/subscriptions with the company.
         */
        customData: {
          company_id: companyId,
        },
      });
    } catch (error) {
      console.error(
        "Paddle Checkout error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

