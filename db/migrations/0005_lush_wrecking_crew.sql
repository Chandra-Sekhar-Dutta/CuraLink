CREATE TABLE "researcher_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"specialties_csv" text DEFAULT '' NOT NULL,
	"interests_csv" text DEFAULT '' NOT NULL,
	"orcid" varchar(19),
	"research_gate" text,
	"affiliation" varchar(255),
	"department" varchar(255),
	"position" varchar(255),
	"phone" varchar(50),
	"available_for_meetings" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "researcher_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "condition_narrative" text;--> statement-breakpoint
ALTER TABLE "researcher_profiles" ADD CONSTRAINT "researcher_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_unique" UNIQUE("user_id");