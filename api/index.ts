import { MongoClient } from 'mongodb';
import jsonwebtoken from 'jsonwebtoken';
import { VercelRequest } from '@vercel/node/dist';

interface AccountToken extends jsonwebtoken.JwtPayload {
  email: string;
}

export function authenticateToken(
  req: VercelRequest
): AccountToken | undefined {
  if (!req.headers.authorization) return;
  if (!req.headers.authorization!.startsWith('Bearer')) return;
  try {
    let data = jsonwebtoken.verify(
      req.headers.authorization!.split(' ')[1],
      `${process.env['JWT_SECRET']}`
    ) as AccountToken;
    if (data.exp! < Date.now() / 1000) return;
    return {
      email: data.email,
    };
  } catch {
    return;
  }
}

export const clientDb = new MongoClient(process.env['MONGO_URI']!);
