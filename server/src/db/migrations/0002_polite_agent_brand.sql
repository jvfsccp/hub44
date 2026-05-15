DO $$ BEGIN
	CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'paused', 'inactive', 'out_of_stock');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TYPE "public"."product_status" ADD VALUE IF NOT EXISTS 'draft' BEFORE 'active';--> statement-breakpoint
ALTER TYPE "public"."product_status" ADD VALUE IF NOT EXISTS 'paused' BEFORE 'inactive';--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."store_status" AS ENUM('pending', 'approved', 'rejected', 'inactive');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"store_id" text,
	"street" text NOT NULL,
	"number" text NOT NULL,
	"complement" text,
	"district" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "owner_id" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "cnpj" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "phone" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "status" "public"."store_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
UPDATE "stores" SET "owner_id" = (SELECT "id" FROM "users" ORDER BY "created_at" LIMIT 1) WHERE "owner_id" IS NULL;--> statement-breakpoint
UPDATE "stores" SET "slug" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint
UPDATE "stores" SET "cnpj" = "id" WHERE "cnpj" IS NULL;--> statement-breakpoint
UPDATE "stores" SET "phone" = '' WHERE "phone" IS NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "cnpj" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "status" "public"."product_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
UPDATE "products" SET "slug" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "image_url" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "addresses" ADD CONSTRAINT "addresses_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_unique_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "stores_slug_unique" ON "stores" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "stores_cnpj_unique" ON "stores" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "addresses_user_id_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "addresses_store_id_idx" ON "addresses" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_store_id_idx" ON "products" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_store_slug_unique" ON "products" USING btree ("store_id", "slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stores_owner_id_idx" ON "stores" USING btree ("owner_id");
