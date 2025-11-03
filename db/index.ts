import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL is not defined - app will run with limited functionality');
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
export const db = sql ? drizzle(sql, { schema }) : null as any;
