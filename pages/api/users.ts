/* eslint-disable @typescript-eslint/no-unused-vars */
import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";

const getVerificationEmailTemplate = (name: string, verificationUrl: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>
    <body class="bg-gray-100 p-4">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header Section -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
          <h1 class="text-2xl font-bold text-white">Email Verification</h1>
        </div>
        
        <!-- Main Content -->
        <div class="p-8">
          <!-- Welcome Message -->
          <div class="text-center mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-2">Welcome, ${name}!</h2>
            <p class="text-gray-600">
              Thanks for joining us! Please verify your email address to get started.
            </p>
          </div>
          
          <!-- Verification Button -->
          <div class="text-center mb-8">
            <a href="${verificationUrl}"
               class="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg 
                      transition-colors duration-200 transform hover:scale-105">
              Verify Email Address
            </a>
          </div>
          
          <!-- Time Notice -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="text-blue-800 text-center text-sm">
              ⏰ This verification link will expire in 24 hours
            </p>
          </div>
          
          <!-- Security Notice -->
          <div class="text-center mb-8">
            <p class="text-gray-600 text-sm">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          
          <!-- Fallback URL Section -->
          <div class="border-t border-gray-200 pt-6 mt-6">
            <p class="text-gray-600 text-sm mb-2">
              If you're having trouble with the button above, copy and paste the URL below into your web browser:
            </p>
            <p class="text-blue-600 text-sm break-all">
              ${verificationUrl}
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Email transporter configuration for Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
      },
    });

    // Handle signup
    if (req.method === "POST" && req.body.name) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email format" });
      }

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      // Hash password and create verification token
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

      await db.collection("users").insertOne({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        isVerified: false,
        verificationToken,
        verificationExpires,
      });

      // Send verification email
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: getVerificationEmailTemplate(name, verificationUrl),
      };

      await transporter.sendMail(mailOptions);

      return res.status(201).json({
        success: true,
        message:
          "User created successfully. Please check your email to verify your account.",
      });
    }

    // Handle login
    if (req.method === "POST" && !req.body.name) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
      }

      const user = await db.collection("users").findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      if (!user.isVerified) {
        return res
          .status(403)
          .json({ success: false, message: "Please verify your email first" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      return res.status(200).json({ success: true, user: userData });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
