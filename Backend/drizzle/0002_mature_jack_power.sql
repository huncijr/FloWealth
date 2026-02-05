CREATE TABLE "Nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"themes_id" integer NOT NULL,
	"product_name" varchar(40) NOT NULL,
	"product_title" varchar(40) NOT NULL,
	"estimated_time" timestamp,
	"quantity" smallint NOT NULL,
	"est_price" numeric(10, 2),
	"cost" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Nodes" ADD CONSTRAINT "Nodes_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Nodes" ADD CONSTRAINT "Nodes_themes_id_Themes_id_fk" FOREIGN KEY ("themes_id") REFERENCES "public"."Themes"("id") ON DELETE no action ON UPDATE no action;