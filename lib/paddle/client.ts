import {
  Environment,
  Paddle,
} from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_API_KEY;

if (!apiKey) {
  throw new Error(
    "PADDLE_API_KEY is not configured."
  );
}

const environment =
  process.env.PADDLE_ENV === "sandbox"
    ? Environment.sandbox
    : Environment.production;

export const paddle = new Paddle(apiKey, {
  environment,
});