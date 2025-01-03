ALTER TABLE "accounts" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "ai_chat_conversations" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "ai_chat_conversations" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "ai_raports" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "ai_raports" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "categories" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "categories" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "moneyboxes" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "moneyboxes" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "recurring_transactions" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "recurring_transactions" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "saving_goals" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "saving_goals" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
DROP INDEX IF EXISTS "recurring_transactions_account_id_created_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "transactions_account_id_created_at_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recurring_transactions_account_id_created_at_idx" ON "recurring_transactions" USING btree ("account_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_account_id_created_at_idx" ON "transactions" USING btree ("account_id","created_at");