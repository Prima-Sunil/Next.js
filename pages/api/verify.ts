import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Verification token is required" 
      });
    }

    // Find user with the verification token
    const user = await db.collection("users").findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() }  // Check if token hasn't expired
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired verification token" 
      });
    }

    // Update user verification status
    await db.collection("users").updateOne(
      { verificationToken: token },
      { 
        $set: { 
          isVerified: true,
          verifiedAt: new Date()
        },
        $unset: { 
          verificationToken: "",
          verificationExpires: "" 
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
}
