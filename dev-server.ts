import express, { NextFunction, Request, Response } from 'express';
import { MongoClient, Db } from 'mongodb';
import { sign, verify } from 'jsonwebtoken';
import { exit } from 'process';

enum Gender {
  Unspecified,
  Male,
  Female,
}

function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log(req.headers);
  if (!req.headers.authorization) {
    res.sendStatus(403);
  }
  if (!req.headers.authorization!.startsWith('Bearer')) {
    res.sendStatus(403);
  }
  let data = verify(
    req.headers.authorization!.split(' ')[1],
    `${process.env['JWT_SECRET']}`
  );
}

export function app(): express.Express {
  const server = express();
  const client = new MongoClient(process.env['MONGO_URI']!);
  let db: Db;
  client.connect().then(() => (db = client.db('kinee')));

  server.use(express.json());

  server.post('/api/account/register', (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.fullname) {
      res.status(400);
      return res.send('Data tidak lengkap');
    }
    db.collection('accounts')
      .find({ email: req.body.email })
      .toArray()
      .then((accounts) => {
        if (accounts.length > 0) {
          res.status(400);
          return res.send('Sur-el sudah digunakan');
        } else {
          db.collection('accounts').insertOne({
            email: req.body.email,
            password: req.body.password,
            fullname: req.body.fullname,
            gender: req.body.gender || 0,
          });
          return res.sendStatus(201);
        }
      })
      .catch((err) => {
        res.status(500);
        return res.send(err);
      });
    return;
  });

  server.post('/api/account/login', (req, res) => {
    db.collection('accounts')
      .find({ email: req.body.email, password: req.body.password })
      .toArray()
      .then((accounts) => {
        if (accounts.length < 1) return res.sendStatus(404);
        return res.send(
          sign(
            {
              email: accounts[0]['email'],
              fullname: accounts[0]['fullname'],
            },
            `${process.env['JWT_SECRET']}`,
            { expiresIn: '8h' }
          )
        );
      });
  });

  server.get('/api/account/me', authenticateToken, (req, res) => {
    db.collection('accounts')
      .find({ email: req.body.email, password: req.body.password })
      .toArray()
      .then((accounts) => {
        if (accounts.length < 1) return res.sendStatus(404);
        return;
      });
  });

  return server;
}

const port = 4000;
const server = app();
server.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
