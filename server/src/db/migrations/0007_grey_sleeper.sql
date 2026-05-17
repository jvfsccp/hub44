CREATE TABLE "product_images" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"path" text NOT NULL,
	"image_url" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_images_product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_path_unique" ON "product_images" USING btree ("path");--> statement-breakpoint
INSERT INTO "product_images" ("id", "product_id", "path", "image_url", "position", "created_at", "updated_at")
SELECT
	"products"."id" || '-legacy-image',
	"products"."id",
	'legacy/products/' || "products"."id" || '/image',
	"products"."image_url",
	1,
	now(),
	now()
FROM "products"
WHERE "products"."image_url" IS NOT NULL;
