const { db } = require('../db');
async function ensureGroup(chat){ await db().collection('groups').updateOne({chatId:chat.id},{$setOnInsert:{chatId:chat.id,title:chat.title||'',responseStyle:'professional',welcomeEnabled:true,leaveEnabled:true,summaryEnabled:true,memoryEnabled:true,roastEnabled:false,createdAt:new Date()},$set:{title:chat.title||'',updatedAt:new Date()}},{upsert:true}); return db().collection('groups').findOne({chatId:chat.id}); }
async function setGroup(chatId,field,value){ await db().collection('groups').updateOne({chatId},{$set:{[field]:value,updatedAt:new Date()}},{upsert:true}); }
module.exports={ensureGroup,setGroup};
