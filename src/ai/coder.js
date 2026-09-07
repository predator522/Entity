const {
  groqApiKey,
  groqModel,
  openRouterApiKey,
  openRouterModel
} = require("../config");

const { ENTITY_SYSTEM } = require("./prompt");

const CODER_SYSTEM = `
${ENTITY_SYSTEM}

You are Entity 4.5's coding engine.

When the user asks for code:
- Follow the exact language/framework requested.
- If they ask for Node.js, produce Node.js.
- If they ask for Python, produce Python.
- If they ask for HTML/CSS/JS, produce those technologies.
- Do not respond with a frontend-only refusal.
- Give complete, runnable code when the user asks for full code.
- Do not invent imports that the project does not need.
- Prefer clear project structure when a multi-file project is requested.
- Do not reveal API keys or secrets.
`;

async function callGroq(message) {
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
        messages: [
          {
            role: "system",
            content: CODER_SYSTEM
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2,
        max_completion_tokens: 12000
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Groq coding error: ${response.status} ${
        data?.error?.message || ""
      }`.trim()
    );
  }

  const result =
    data?.choices?.[0]?.message?.content;

  if (!result) {
    throw new Error(
      "Groq coding returned an empty response."
    );
  }

  return result;
}

async function callOpenRouter(message) {
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
            content: CODER_SYSTEM
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2,
        max_tokens: 12000
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `OpenRouter coding error: ${response.status} ${
        data?.error?.message || ""
      }`.trim()
    );
  }

  const result =
    data?.choices?.[0]?.message?.content;

  if (!result) {
    throw new Error(
      "OpenRouter coding returned an empty response."
    );
  }

  return result;
}

async function askCoder(message) {
  try {
    return await callGroq(message);
  } catch (error) {
    console.error(
      "Groq coding failed:",
      error.message
    );

    return await callOpenRouter(message);
  }
}

module.exports = {
  askCoder
};
