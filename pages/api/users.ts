import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Email transporter configuration for Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
      },
    });

    // Handle signup
    if (req.method === 'POST' && req.body.name) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Hash password and create verification token
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

      await db.collection('users').insertOne({
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
        subject: 'Verify Your Email',
        html: `<p>Hi ${name},</p><p>Click the link below to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a><p>The link expires in 24 hours.</p>`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(201).json({
        success: true,
        message: 'User created successfully. Please check your email to verify your account.',
      });
    }

    // Handle login
    if (req.method === 'POST' && !req.body.name) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email first' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      return res.status(200).json({ success: true, user: userData });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
