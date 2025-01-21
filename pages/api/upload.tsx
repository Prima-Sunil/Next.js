import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const filePath = path.join(process.cwd(), '/public/uploads');
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    const file = await new Promise((resolve, reject) => {
      const contentDisposition = req.headers['content-disposition'];
      if (!contentDisposition) {
        res.status(400).json({ message: 'Content-Disposition header is missing' });
        return;
      }
      const filename = contentDisposition.split('filename=')[1];
      const fullPath = path.join(filePath, filename.replace(/"/g, ''));
      const stream = fs.createWriteStream(fullPath);

      req.pipe(stream);
      req.on('end', () => resolve(fullPath));
      console.log("hlo sunil")
      req.on('error', (err: NodeJS.ErrnoException) => reject(err));
    });

    res.status(200).json({ message: 'File uploaded successfully', file });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
