const ENDPOINT = 'https://api.omegatech.app/api/ai/magicstudio';
async function generateImage(prompt) { const r = await fetch(`${ENDPOINT}?prompt=${encodeURIComponent(String(prompt))}`); if (!r.ok) throw new Error(`Image API HTTP ${r.status}`); const type = r.headers.get('content-type') || ''; if (!type.startsWith('image/')) throw new Error(`Image API returned ${type}`); const b = Buffer.from(await r.arrayBuffer()); if (!b.length) throw new Error('Empty image response.'); return b; }
module.exports = { generateImage };
