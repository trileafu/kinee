import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express, { NextFunction, Request, Response } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { Db, MongoClient } from 'mongodb';

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

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');
  console.log(process.env);
  const client = new MongoClient(
    'mongodb://kinee:kineepublic@trileafu-shard-00-00.s92hh.mongodb.net:27017,trileafu-shard-00-01.s92hh.mongodb.net:27017,trileafu-shard-00-02.s92hh.mongodb.net:27017/?ssl=true&replicaSet=atlas-q3vmyy-shard-0&authSource=admin&retryWrites=true&w=majority&appName=trileafu'
  );
  const commonEngine = new CommonEngine();
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

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y',
    })
  );

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
