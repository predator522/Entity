const { askChatAI } = require("./chat");
const { askFallback } = require("./fallback");
const { askCoder } = require("./coder");
const { generateImage } = require("./image");

function looksLikeImageRequest(message) {
  const text = message.toLowerCase();

  const patterns = [
    "generate an image",
    "generate image",
    "create an image",
    "make an image",
    "draw an image",
    "draw me",
    "create a picture",
    "make a picture",
    "generate a picture",
    "image of",
    "picture of",
    "generate artwork",
    "create artwork",
    "make artwork",
    "render an image"
  ];

  return patterns.some(
    pattern => text.includes(pattern)
  );
}

function looksLikeCodingRequest(message) {
  const text = message.toLowerCase();

  const patterns = [
    "write code",
    "write me code",
    "code this",
    "build a website",
    "create a website",
    "build a bot",
    "create a bot",
    "make a bot",
    "telegram bot",
    "discord bot",
    "whatsapp bot",
    "node.js bot",
    "nodejs bot",
    "python bot",
    "javascript code",
    "write a script",
    "create a script",
    "build an api",
    "create an api",
    "fix this code",
    "debug this code",
    "debug my code",
    "program this",
    "implement this",
    "write the full code",
    "send the full code",
    "full source code"
  ];

  return patterns.some(
    pattern => text.includes(pattern)
  );
}

function detectEngine(message) {
  if (looksLikeImageRequest(message)) {
    return "image";
  }

  if (looksLikeCodingRequest(message)) {
    return "coding";
  }

  return "chat";
}

async function routeAI({
  message,
  memory,
  reasoningLevel,
  history
}) {
  const engine = detectEngine(message);

  if (engine === "image") {
    return {
      type: "image",
      engine: "magicstudio",
      result: await generateImage(message)
    };
  }

  if (engine === "coding") {
    return {
      type: "text",
      engine: "groq-coding",
      result: await askCoder(message)
    };
  }

  try {
    return {
      type: "text",
      engine: "groq",
      result: await askChatAI({
        message,
        memory,
        reasoningLevel,
        history
      })
    };
  } catch (error) {
    console.error(
      "Groq chat failed:",
      error.message
    );

    return {
      type: "text",
      engine: "openrouter",
      result: await askFallback({
        message,
        memory,
        reasoningLevel,
        history
      })
    };
  }
}

module.exports = {
  routeAI,
  detectEngine
};
