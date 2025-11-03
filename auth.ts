import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from '@/db';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { users, accounts, sessions, verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Custom ORCID Provider
const ORCIDProvider = (options: any) => ({
  id: "orcid",
  name: "ORCID",
  type: "oauth" as const,
  wellKnown: "https://orcid.org/.well-known/openid-configuration",
  authorization: {
    url: "https://orcid.org/oauth/authorize",
    params: { scope: "/authenticate" }
  },
  token: "https://orcid.org/oauth/token",
  userinfo: {
    url: async (tokens: any) => {
      // ORCID userinfo endpoint requires the ORCID iD from the token
      const orcid = tokens.orcid;
      return `https://pub.orcid.org/v3.0/${orcid}/record`;
    },
  },
  profile(profile: any) {
    return {
      id: profile.orcid || profile['orcid-identifier']?.path,
      name: profile.name || `${profile.person?.name?.['given-names']?.value || ''} ${profile.person?.name?.['family-name']?.value || ''}`.trim(),
      email: profile.email || profile.person?.emails?.email?.[0]?.email,
      image: null,
      orcid: profile.orcid || profile['orcid-identifier']?.path,
    };
  },
  ...options,
});

export const authOptions: NextAuthOptions = {
  // Note: When using JWT strategy, adapter is only used for OAuth account linking
  // For credentials provider, we handle users manually
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true, // Allow linking Google account with existing email
    }),
    ORCIDProvider({
      clientId: process.env.ORCID_CLIENT_ID || '',
      clientSecret: process.env.ORCID_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }) as any,
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const result = loginSchema.safeParse(credentials);

        if (!result.success) {
          return null;
        }

        const { email, password } = result.data;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user?.password) {
          return null;
        }

        const passwordsMatch = await bcryptjs.compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        // Check if email is verified - ENFORCED
        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account, trigger }: any) {
      // Initial sign in or token update
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.provider = account?.provider;
      }
      
      // Fetch userType from database
      if (token.email) {
        // Look up by email (works for both credentials and OAuth)
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, token.email),
        });
        
        if (dbUser) {
          token.id = dbUser.id.toString();
          token.userType = dbUser.userType || null;
          token.orcidId = dbUser.orcidId || null; // Add ORCID to token
        }
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.provider = token.provider;
        session.user.userType = token.userType;
        session.user.orcidId = token.orcidId; // Add ORCID to session
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      // For OAuth sign-ins, ensure user exists in our database
      if (account?.provider === 'google' || account?.provider === 'orcid') {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });
        
        // If user doesn't exist, create them
        if (!existingUser) {
          const newUserData: any = {
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(), // OAuth accounts are pre-verified
          };
          
          // Add ORCID ID if signing in with ORCID
          if (account?.provider === 'orcid' && user.orcid) {
            newUserData.orcidId = user.orcid;
          }
          
          await db.insert(users).values(newUserData);
        } else if (account?.provider === 'orcid' && user.orcid && !existingUser.orcidId) {
          // Update existing user with ORCID ID if they sign in with ORCID for first time
          await db.update(users)
            .set({ orcidId: user.orcid })
            .where(eq(users.email, user.email));
        }
      }
      
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export default NextAuth(authOptions);