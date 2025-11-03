import { pgTable, serial, text, varchar, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password'), // Hashed password
  image: text('image'),
  emailVerified: timestamp('emailVerified'),
  userType: varchar('user_type', { length: 50 }), // 'patient' or 'researcher'
  orcidId: varchar('orcid_id', { length: 19 }), // ORCID iDs are 16 digits with hyphens (e.g., 0000-0002-1825-0097)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'), // Changed from timestamp to integer for Unix timestamp
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).unique().notNull(),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expires: timestamp('expires').notNull(),
});

// Patient profile: one per user
export const patientProfiles = pgTable('patient_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  conditionNarrative: text('condition_narrative'), // Free-text description from patient
  conditionsCsv: text('conditions_csv').notNull().default(''), // Comma-separated extracted conditions
  city: varchar('city', { length: 255 }),
  country: varchar('country', { length: 255 }),
  showGlobal: boolean('show_global').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Researcher profile: one per user
export const researcherProfiles = pgTable('researcher_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  specialtiesCsv: text('specialties_csv').notNull().default(''), // Comma-separated specialties
  interestsCsv: text('interests_csv').notNull().default(''), // Comma-separated research interests
  orcid: varchar('orcid', { length: 19 }), // Can be different from user's orcidId if manually entered
  researchGate: text('research_gate'), // ResearchGate profile URL
  affiliation: varchar('affiliation', { length: 255 }), // Institution/Organization
  department: varchar('department', { length: 255 }),
  position: varchar('position', { length: 255 }), // e.g., Senior Research Scientist
  phone: varchar('phone', { length: 50 }),
  availableForMeetings: boolean('available_for_meetings').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Favorites: store arbitrary item ids by kind per user
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  kind: varchar('kind', { length: 32 }).notNull(), // 'experts' | 'trials' | 'publications'
  itemId: varchar('item_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // naive uniqueness enforcement via partial unique key on (userId, kind, itemId)
}, (table) => {
  return {
    uq: sql`UNIQUE (${table.userId}, ${table.kind}, ${table.itemId})`,
  } as any;
});