/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { S3 } from 'aws-sdk';

import formidable, { IncomingForm } from 'formidable';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, 
  },
};

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
  region: process.env.AWS_REGION, 
});


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
    });
    
    form.parse(req, async (err, fields, files:any) => {
      if (err) {
        console.error('Error parsing the file:', err);
        return res.status(500).json({ message: 'Error parsing the file' });
      }

      // edit code for make a folder at s3 bucket
      // pass user id from frontend
     const userId=fields.userId;
     if(!userId){
      return res.status(400).json({ message: 'User Id is required' });
     }

      if (!files.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const file = files.file[0]; 
      const fileStream = fs.createReadStream(file.filepath);

      if (!process.env.AWS_BUCKET_NAME) {
        return res.status(500).json({ message: 'S3 bucket name is not defined' });
      }

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME, 
        Key: `${userId}/uploads/${file.originalFilename}`, 
        Body: fileStream,
        ContentType: file.mimetype || undefined, 
      };

      try {
        const uploadResult = await s3.upload(params).promise();
        console.log('File uploaded successfully:', uploadResult);
        res.status(200).json({
          success: true,
          message: 'File uploaded successfully',
          url: uploadResult.Location, 
        });
      } catch (error) {
        console.error('Error uploading to S3:', error);
        res.status(500).json({ success: false, message: 'File upload failed' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
