CREATE TYPE "public"."currency" AS ENUM('PLN', 'USD', 'EUR');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('withdraw', 'deposit');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"account_name" varchar NOT NULL,
	"balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"currency" "currency" NOT NULL,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"conversation_log" jsonb NOT NULL,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_raports" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_start_date" timestamp NOT NULL,
	"period_end_date" timestamp NOT NULL,
	"reviewed_data" varchar,
	"account_id" integer NOT NULL,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"category_name" varchar NOT NULL,
	"parent_category_id" integer,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "moneyboxes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"currency" "currency" NOT NULL,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recurring_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"interval" interval NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar,
	"amount" numeric(12, 2) NOT NULL,
	"type" "transaction_type" NOT NULL,
	"account_id" integer NOT NULL,
	"category_id" integer,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saving_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"moneybox_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"target_amount" numeric(12, 2) NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar,
	"amount" numeric(12, 2) NOT NULL,
	"type" "transaction_type" NOT NULL,
	"account_id" integer NOT NULL,
	"category_id" integer,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar,
	"createdAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_chat_conversations" ADD CONSTRAINT "ai_chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_raports" ADD CONSTRAINT "ai_raports_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_categories_id_fk" FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moneyboxes" ADD CONSTRAINT "moneyboxes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saving_goals" ADD CONSTRAINT "saving_goals_moneybox_id_moneyboxes_id_fk" FOREIGN KEY ("moneybox_id") REFERENCES "public"."moneyboxes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saving_goals" ADD CONSTRAINT "saving_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_chat_conversations_user_id_idx" ON "ai_chat_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_raports_account_id_idx" ON "ai_raports" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_user_id_idx" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moneyboxes_user_id_idx" ON "moneyboxes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recurring_transactions_account_id_category_id_idx" ON "recurring_transactions" USING btree ("account_id","category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recurring_transactions_account_id_type_idx" ON "recurring_transactions" USING btree ("account_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recurring_transactions_account_id_created_at_idx" ON "recurring_transactions" USING btree ("account_id","createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saving_goals_user_id_idx" ON "saving_goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saving_goals_moneybox_id_idx" ON "saving_goals" USING btree ("moneybox_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_account_id_category_id_idx" ON "transactions" USING btree ("account_id","category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_account_id_type_idx" ON "transactions" USING btree ("account_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_account_id_created_at_idx" ON "transactions" USING btree ("account_id","createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_full_name_idx" ON "users" USING btree ("last_name","first_name");