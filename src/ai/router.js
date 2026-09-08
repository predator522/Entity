const { chat } = require('./chat');
const { generateImage } = require('./image');
const imagePattern = /\b(gen(?:erate)?|create|make|draw|render)\b(?:\s+me)?(?:\s+an?)?\s+(?:image|picture|photo|artwork)\b/i;
const codingPattern = /\b(code|coding|javascript|python|node\.js|html|css|function|debug|bug|error|api|regex|script)\b/i;
async function route({ text, history, memory, reasoning }) { if (imagePattern.test(text)) return { type: 'image', data: await generateImage(text) }; return { type: codingPattern.test(text) ? 'code' : 'chat', data: await chat(history, text, memory, reasoning) }; }
module.exports = { route };
