UPDATE "orders"
SET "payment_method" = 'pix'
WHERE "payment_method" = 'boleto';
--> statement-breakpoint
ALTER TYPE "payment_method" RENAME TO "payment_method_old";
--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('card', 'pix');
--> statement-breakpoint
ALTER TABLE "orders"
ALTER COLUMN "payment_method" TYPE "payment_method"
USING "payment_method"::text::"payment_method";
--> statement-breakpoint
DROP TYPE "payment_method_old";
