const IMAGE_API =
  "https://api.omegatech.app/api/ai/magicstudio";

async function generateImage(userPrompt) {
  const prompt = cleanImagePrompt(userPrompt);

  const params = new URLSearchParams({
    prompt
  });

  const response = await fetch(
    `${IMAGE_API}?${params.toString()}`
  );

  if (!response.ok) {
    const error = new Error(
      `MagicStudio error: ${response.status}`
    );

    error.status = response.status;

    throw error;
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.startsWith("image/")) {
    const text = await response.text();

    throw new Error(
      `MagicStudio did not return an image. Content-Type: ${contentType}. ${text.slice(0, 300)}`
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (!buffer.length) {
    throw new Error(
      "MagicStudio returned an empty image."
    );
  }

  return buffer;
}

function cleanImagePrompt(message) {
  return String(message)
    .replace(
      /^(generate|create|make|draw|render)\s+(an?\s+)?(image|picture|photo|artwork)\s*(of\s*)?/i,
      ""
    )
    .trim() || String(message);
}

module.exports = {
  generateImage
};
