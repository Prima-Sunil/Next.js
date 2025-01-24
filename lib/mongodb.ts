// import mongoose from "mongoose";

// const connectionDatabase = async () => {
//   try {
//     if (!process.env.MONGO_URI) {
//       throw new Error("MONGO_URI is not defined in environment variables");
//     }

//     const data = await mongoose.connect(process.env.MONGO_URI);

//     console.log("Database connected successfully",data);
//   } catch (err) {
//     console.error("Database connection error:", err);
//     throw err;
//   }
// };

import { MongoClient, MongoClientOptions } from 'mongodb';

// Extend the global object directly
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// MongoDB connection URI
const uri = 'mongodb+srv://sunil:root123@cluster0.eafjb.mongodb.net/db?retryWrites=true&w=majority';

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Use a global variable in development to prevent multiple instances
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, always create a new MongoClient instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
