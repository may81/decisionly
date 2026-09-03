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

export const paddle = new Paddle(apiKey, {
  environment: Environment.production,
});