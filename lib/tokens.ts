import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function generateVerificationToken(email: string) {
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  // Delete any existing tokens for this email
  await db.delete(verificationTokens)
    .where(eq(verificationTokens.identifier, email));

  const [verificationToken] = await db.insert(verificationTokens)
    .values({
      identifier: email,
      token,
      expires,
    })
    .returning();

  return verificationToken;
}

export async function generatePasswordResetToken(email: string) {
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  const [resetToken] = await db.insert(verificationTokens)
    .values({
      identifier: email,
      token,
      expires,
    })
    .returning();

  return resetToken;
}

export async function generateJWT(payload: object) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
}