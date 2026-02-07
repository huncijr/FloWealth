ALTER TABLE "Nodes" RENAME TO "nodes";--> statement-breakpoint
ALTER TABLE "nodes" DROP CONSTRAINT "Nodes_user_id_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "nodes" DROP CONSTRAINT "Nodes_themes_id_Themes_id_fk";
--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "picture" text;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_themes_id_Themes_id_fk" FOREIGN KEY ("themes_id") REFERENCES "public"."Themes"("id") ON DELETE no action ON UPDATE no action;