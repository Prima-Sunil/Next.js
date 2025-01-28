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
      maxFileSize: 50 * 1024 * 1024, 
    });
    // console.log(fields.folderName);

    form.parse(req, async (err, fields, files: any) => {
      console.log(fields.folderName);
      if (err) {
        console.error('Error parsing the files:', err);
        return res.status(500).json({ message: 'Error parsing the files' });
      }
      const userId=fields.userId;
      if(!userId){
        return res.status(400).json({ message: 'User Id is required' });
      }
      if (!files.files || !Array.isArray(files.files)) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      if (!process.env.AWS_BUCKET_NAME) {
        return res.status(500).json({ message: 'S3 bucket name is not defined' });
      }

      try {
        const uploadedFiles: { fileName: string; url: string }[] = [];

        for (const file of files.files) {
          const fileStream = fs.createReadStream(file.filepath);
          const s3Key=`${userId}/uploads/${file.originalFilename}`;

         
          // const folderName = fields.folderName ; 
          // const s3Key = `${folderName}/${file.originalFilename}`; 
          console.log({s3Key});

          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: fileStream,
            ContentType: file.mimetype || undefined,
          };

          const uploadResult = await s3.upload(params).promise();
          console.log(`Uploaded: ${file.originalFilename} -> ${uploadResult.Location}`);

          uploadedFiles.push({
            fileName: file.originalFilename,
            url: uploadResult.Location,
          });
        }

        
        res.status(200).json({
          success: true,
          message: 'Folder uploaded successfully',
          files: uploadedFiles,
        });
      } catch (error) {
        console.error('Error uploading folder to S3:', error);
        res.status(500).json({ success: false, message: 'Folder upload failed' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
