import path from 'path';
import fs from 'fs';

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const filePath = path.join(process.cwd(), '/public/uploads/downloaded-file.txt'); // Replace with your file name
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', 'attachment; filename="downloaded-file.txt"');
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
}
