"use client";

import { useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

type PaddleCheckoutProps = {
  priceId: string;
  companyId: string;
  children: React.ReactNode;
  className?: string;
};

export default function PaddleCheckout({
  priceId,
  companyId,
  children,
  className,
}: PaddleCheckoutProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
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

      const clientToken =
        process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

      const environment = "production";

      if (!clientToken) {
        throw new Error(
          "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured."
        );
      }

      const paddle: Paddle | undefined =
        await initializePaddle({
          token: clientToken,
          environment,
        });

      if (!paddle) {
        throw new Error(
          "Paddle could not be initialized."
        );
      }

      paddle.Checkout.open({
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
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