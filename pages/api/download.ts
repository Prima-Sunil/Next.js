// import path from 'path';
// import fs from 'fs';

// import { NextApiRequest, NextApiResponse } from 'next';

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//     const filePath = path.join(process.cwd(), '/public/uploads/downloaded-file.txt'); // Replace with your file name
//     if (fs.existsSync(filePath)) {
//         res.setHeader('Content-Disposition', 'attachment; filename="downloaded-file.txt"');
//         fs.createReadStream(filePath).pipe(res);
//     } else {
//         res.status(404).json({ message: 'File not found' });
//     }
// }




// pages/api/download.ts
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'downloads', 'sunil.txt');
    const fileContents = fs.readFileSync(filePath);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=sunil.txt');
    
    res.send(fileContents);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}