const {
  openRouterApiKey,
  openRouterModel
} = require("../config");

const {
  buildSystemPrompt
} = require("./prompt");

async function askFallback({
  message,
  memory = [],
  reasoningLevel = "standard",
  history = []
}) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt({
              reasoningLevel,
              memory
            })
          },
          ...history.map(item => ({
            role: item.role === "assistant"
              ? "assistant"
              : "user",
            content: item.text
          })),
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 8192
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `OpenRouter error: ${response.status} ${
        data?.error?.message || ""
      }`.trim()
    );
  }

  const result =
    data?.choices?.[0]?.message?.content;

  if (!result) {
    throw new Error(
      "OpenRouter returned an empty response."
    );
  }

  return result;
}

module.exports = {
  askFallback
};
