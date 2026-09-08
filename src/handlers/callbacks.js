const { renderMenu } = require('./menu');
const { page,confirmBroadcast } = require('./admin');
const { checkForceJoin } = require('../middleware/forceJoin');
async function callbacks(ctx){ const d=ctx.callbackQuery.data; await ctx.answerCbQuery().catch(()=>{}); if(d==='force_check'){await ctx.deleteMessage().catch(()=>{});return checkForceJoin(ctx);} if(d.startsWith('menu_'))return renderMenu(ctx,d); if(d.startsWith('admin_'))return page(ctx,d); if(d==='broadcast_yes')return confirmBroadcast(ctx); if(d==='broadcast_no')return ctx.editMessageText('❌ Broadcast cancelled.'); if(d==='noop')return ctx.answerCbQuery('Use the command shown in the panel.'); }
module.exports={callbacks};
