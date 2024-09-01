import express, { NextFunction, Request, Response } from 'express';
import { MongoClient, Db } from 'mongodb';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      email: string;
    }
  }
}

interface AccountToken extends JwtPayload {
  email: string;
}

function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.headers.authorization) {
    res.sendStatus(403);
    return;
  }
  if (!req.headers.authorization!.startsWith('Bearer')) {
    res.sendStatus(403);
    return;
  }
  try {
    let data = verify(
      req.headers.authorization!.split(' ')[1],
      `${process.env['JWT_SECRET']}`
    ) as AccountToken;
    if (data.exp! < Date.now() / 1000) {
      res.sendStatus(403);
      return;
    } else {
      req.email = data.email;
    }
  } catch {
    res.sendStatus(403);
    return;
  }
  next();
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
      .findOne({ email: req.body.email })
      .then((account) => {
        if (account) {
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
      .findOne({ email: req.body.email, password: req.body.password })
      .then((account) => {
        if (!account) return res.sendStatus(404);
        return res.send(
          sign(
            {
              email: account['email'],
            },
            `${process.env['JWT_SECRET']}`,
            { expiresIn: '8h' }
          )
        );
      });
  });

  server.get('/api/account/me', authenticateToken, (req, res) => {
    db.collection('accounts')
      .findOne({ email: req.email })
      .then((account) => {
        if (!account) return res.sendStatus(404);
        res.json({
          email: account['email'],
          fullname: account['fullname'],
          gender: account['gender'],
        });
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
