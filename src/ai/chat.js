const {
  groqApiKey,
  groqModel
} = require("../config");

const {
  buildSystemPrompt
} = require("./prompt");

async function askChatAI({
  message,
  memory = [],
  reasoningLevel = "standard",
  history = []
}) {
  const messages = [
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
  ];

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: groqModel,
        messages,
        temperature: 0.7,
        max_completion_tokens: 8192
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Groq error: ${response.status} ${
        data?.error?.message || ""
      }`.trim()
    );
  }

  const result =
    data?.choices?.[0]?.message?.content;

  if (!result) {
    throw new Error("Groq returned an empty response.");
  }

  return result;
}

module.exports = {
  askChatAI
};
