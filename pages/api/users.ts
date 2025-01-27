/* eslint-disable @typescript-eslint/no-unused-vars */
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Handle signup
    if (req.method === 'POST' && req.body.name) {
      const { name, email, password } = req.body;

      // Input validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Check if user exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.collection('users').insertOne({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully'
      });
    }

    // Handle login
    if (req.method === 'POST' && !req.body.name) {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      return res.status(200).json({
        success: true,
        user: userData
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}