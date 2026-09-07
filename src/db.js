const { MongoClient } = require("mongodb");
const { mongoUri, mongoDb } = require("./config");

let client;
let db;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(mongoUri);

  await client.connect();

  db = client.db(mongoDb);

  await db.collection("users").createIndex(
    { email: 1 },
    { unique: true, sparse: true }
  );

  await db.collection("users").createIndex(
    { phone: 1 },
    { unique: true, sparse: true }
  );

  await db.collection("users").createIndex(
    { telegramIds: 1 }
  );

  await db.collection("users").createIndex(
    { lastActiveAt: 1 }
  );

  console.log(`MongoDB connected: ${mongoDb}`);

  return db;
}

function users() {
  if (!db) {
    throw new Error("MongoDB is not connected.");
  }

  return db.collection("users");
}

function chats() {
  if (!db) {
    throw new Error("MongoDB is not connected.");
  }

  return db.collection("chats");
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectDB,
  closeDB,
  users,
  chats
};
