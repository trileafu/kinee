import { VercelRequest, VercelResponse } from '@vercel/node/dist';
import { clientDb } from '../index.js';
import jsonwebtoken from 'jsonwebtoken';
import pkg from 'bcryptjs';
const { compare } = pkg;

export default function (
  req: VercelRequest,
  res: VercelResponse
): VercelResponse | void {
  if (req.method != 'POST') return res.status(405).send('');
  clientDb.connect().then((client) => {
    let db = client.db('kinee');
    db.collection('accounts')
      .findOne({ email: req.body.email })
      .then((account) => {
        if (!account) return res.status(404).send('');
        compare(req.body.password, account['password'])
          .then((result) => {
            if (result) {
              return res.json({
                token: jsonwebtoken.sign(
                  {
                    email: account['email'],
                  },
                  `${process.env['JWT_SECRET']}`,
                  { expiresIn: '8h' }
                ),
              });
            } else {
              return res.status(404).send('');
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        return res.status(500).send(err);
      });
  });
}
