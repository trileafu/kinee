import type { VercelRequest, VercelResponse } from '@vercel/node/dist';
import { clientDb } from '../index.js';
import jsonwebtoken from 'jsonwebtoken';

export default function (
  req: VercelRequest,
  res: VercelResponse
): VercelResponse | void {
  if (req.method != 'POST') return res.status(405).send('');
  if (!req.body.email || !req.body.password || !req.body.fullname)
    return res.status(400).send('Data tidak lengkap');
  clientDb.connect().then((client) => {
    let db = client.db('kinee');
    if (!db) return res.status(500).send('');
    db.collection('accounts')
      .findOne({ email: req.body.email })
      .then((account) => {
        if (account) {
          return res.status(400).send('Sur-el sudah digunakan');
        } else {
          db.collection('accounts').insertOne({
            email: req.body.email,
            password: req.body.password,
            fullname: req.body.fullname,
            gender: req.body.gender || 0,
          });
          return res.status(201).send('');
        }
      })
      .catch((err) => {
        return res.status(500).send(err);
      });
  });
}
