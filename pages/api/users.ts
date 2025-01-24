import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise; // Get the MongoClient
    const db = client.db(); // Access the default database

    if (req.method === "POST") {
      const { name, email, password } = req.body;
      console.log("name",name);

      // Insert the user into the "users" collection
      const result = await db.collection("users").insertOne({ name, email, password });
      // console.log("";
       console.log("result",result);
      const user = await db.collection("users").findOne({ _id: result.insertedId });
      return res.status(201).json({ success: true, user });
    }

    if (req.method === "GET") {
      const users = await db.collection("users").find().toArray();
      return res.status(200).json({ success: true, users });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
