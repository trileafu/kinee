import { VercelRequest, VercelResponse } from '@vercel/node/dist';
import { authenticateToken, clientDb } from '../index.js';

export default function (
  req: VercelRequest,
  res: VercelResponse
): VercelResponse | void {
  if (req.method != 'GET') return res.status(405).send('');
  let token = authenticateToken(req);
  if (!token) return res.status(403).send('');
  clientDb.connect().then((client) => {
    let db = client.db('kinee');
    if (!db) return res.status(500).send('');
    db.collection('accounts')
      .findOne({ email: token!.email })
      .then((account) => {
        if (!account) {
          return res.status(404).send('');
        } else {
          return res.json({
            email: account['email'],
            fullname: account['fullname'],
            gender: account['gender'],
          });
        }
      })
      .catch((err) => {
        return res.status(500).send(err);
      });
  });
}
