const { MongoClient } = require('mongodb');
const { config } = require('./config');

let client;
let database;

async function connectDB() {
  client = new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    maxPoolSize: 20,
    retryWrites: true
  });
  await client.connect();
  database = client.db(config.mongoDb);
  await Promise.all([
    database.collection('users').createIndex({ telegramIds: 1 }),
    database.collection('users').createIndex({ username: 1 }),
    database.collection('users').createIndex({ lastActiveAt: 1 }),
    database.collection('users').createIndex({ role: 1 }),
    database.collection('chats').createIndex({ userId: 1, createdAt: -1 }),
    database.collection('messages').createIndex({ userId: 1, createdAt: -1 }),
    database.collection('memory').createIndex({ userId: 1, createdAt: -1 }),
    database.collection('activity').createIndex({ createdAt: -1 }),
    database.collection('groups').createIndex({ chatId: 1 }, { unique: true }),
    database.collection('forceChannels').createIndex({ channel: 1 }, { unique: true })
  ]);
  console.log(`MongoDB connected: ${config.mongoDb}`);
}

function db() {
  if (!database) throw new Error('MongoDB is not connected.');
  return database;
}

async function closeDB() { if (client) await client.close(); }

module.exports = { connectDB, closeDB, db };
