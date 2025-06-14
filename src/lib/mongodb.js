// lib/mongodb.js
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function mongooseConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default mongooseConnect;
