import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(['patient', 'researcher']).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, userType } = result.data;
    
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUser) {
      // Check if user has a password (meaning they registered with credentials)
      if (existingUser.password) {
        return NextResponse.json(
          { error: 'Email already registered. Please sign in.' },
          { status: 400 }
        );
      } else {
        // User signed up with Google but now wants to add password
        return NextResponse.json(
          { error: 'This email is registered with Google. Please sign in with Google.' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const [user] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      userType: userType || null,
    }).returning();

    // Generate verification token
    const verificationToken = await generateVerificationToken(email);

    // Send verification email
    await sendVerificationEmail(
      email,
      verificationToken.token,
    );

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}