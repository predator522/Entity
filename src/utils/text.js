function chunks(text, size = 3900) { const out=[]; let s=String(text||''); while(s.length>size){ let i=s.lastIndexOf('\n',size); if(i<1000)i=size; out.push(s.slice(0,i)); s=s.slice(i).trimStart(); } if(s)out.push(s); return out; }
function esc(text){ return String(text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
module.exports={chunks,esc};
