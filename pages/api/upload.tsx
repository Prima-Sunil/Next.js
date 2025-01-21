// import formidable from 'formidable';
// import fs from 'fs';
// import path from 'path';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const uploadDir = path.join(process.cwd(), '/public/uploads');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const form = new formidable.IncomingForm({
//       uploadDir,
//       keepExtensions: true, // Keep the file extension
//     });

//     form.parse(req, (err, fields, files) => {
//       if (err) {
//         res.status(500).json({ message: 'Error parsing the files' });
//         return;
//       }
//       res.status(200).json({ message: 'File uploaded successfully', files });
//     });
//   } else {
//     res.status(405).json({ message: 'Method not allowed' });
//   }
// }
