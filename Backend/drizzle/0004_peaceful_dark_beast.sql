ALTER TABLE "nodes" DROP CONSTRAINT "nodes_user_id_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;