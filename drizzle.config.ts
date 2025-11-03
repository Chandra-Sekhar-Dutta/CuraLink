import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'ep-falling-poetry-a1wm0nqe.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_mHQUVsXd92li',
    database: 'neondb',
    ssl: true
  },
  verbose: true,
  strict: true,
} satisfies Config;