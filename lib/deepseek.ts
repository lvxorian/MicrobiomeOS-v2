import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set in environment variables.");
  }
  _client = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey,
    timeout: 90000,
    maxRetries: 0,
  });
  return _client;
}

export const deepseek: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
}) as OpenAI;
