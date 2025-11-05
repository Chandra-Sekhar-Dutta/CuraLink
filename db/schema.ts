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

// Connection requests between researchers
export const researcherConnections = pgTable('researcher_connections', {
  id: serial('id').primaryKey(),
  requesterId: integer('requester_id').references(() => users.id).notNull(), // Who sent the request
  receiverId: integer('receiver_id').references(() => users.id).notNull(), // Who received the request
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'accepted' | 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uq: sql`UNIQUE (${table.requesterId}, ${table.receiverId})`,
  } as any;
});

// Chat messages between connected researchers
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Patient search history for experts
export const patientSearchedExperts = pgTable('patient_searched_experts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  expertId: varchar('expert_id', { length: 255 }).notNull(), // ORCID or external ID
  expertData: text('expert_data'), // JSON stringified expert data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Patient search history for trials
export const patientSearchedTrials = pgTable('patient_searched_trials', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  trialId: varchar('trial_id', { length: 255 }).notNull(), // NCT ID or external ID
  trialData: text('trial_data'), // JSON stringified trial data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Patient search history for publications
export const patientSearchedPublications = pgTable('patient_searched_publications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  publicationId: varchar('publication_id', { length: 255 }).notNull(), // PMID or external ID
  publicationData: text('publication_data'), // JSON stringified publication data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Forum posts
export const forumPosts = pgTable('forum_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  userType: varchar('user_type', { length: 20 }).notNull(), // 'patient' | 'researcher'
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }), // e.g., 'Research', 'Treatment', 'Support'
  tags: text('tags'), // Comma-separated tags
  viewCount: integer('view_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Forum replies
export const forumReplies = pgTable('forum_replies', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => forumPosts.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  userType: varchar('user_type', { length: 20 }).notNull(), // 'patient' | 'researcher'
  content: text('content').notNull(),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Researcher projects/trials management
export const researcherProjects = pgTable('researcher_projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active' | 'completed' | 'on-hold'
  phase: varchar('phase', { length: 50 }), // 'Phase I', 'Phase II', etc.
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  funding: varchar('funding', { length: 255 }),
  collaborators: text('collaborators'), // Comma-separated user IDs
  tags: text('tags'), // Comma-separated tags
  visibility: varchar('visibility', { length: 20 }).notNull().default('private'), // 'private' | 'public'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Researcher collaborators
export const researcherCollaborators = pgTable('researcher_collaborators', {
  id: serial('id').primaryKey(),
  researcherId: integer('researcher_id').references(() => users.id).notNull(),
  collaboratorId: integer('collaborator_id').references(() => users.id).notNull(),
  projectId: integer('project_id').references(() => researcherProjects.id), // Optional, can be null for general collaborators
  role: varchar('role', { length: 100 }), // e.g., 'Co-Investigator', 'Research Assistant'
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active' | 'inactive'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    uq: sql`UNIQUE (${table.researcherId}, ${table.collaboratorId}, ${table.projectId})`,
  } as any;
});