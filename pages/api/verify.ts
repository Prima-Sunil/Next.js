import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is missing' });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    if (user.verificationExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Token has expired' });
    }

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { isVerified: true }, $unset: { verificationToken: '', verificationExpires: '' } }
    );

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
