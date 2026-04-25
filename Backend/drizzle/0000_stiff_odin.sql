CREATE TABLE "Otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"temp_user_data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"themes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"given_name" text,
	"picture" text,
	"sub" text,
	"is_google_user" boolean DEFAULT false,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Users_email_unique" UNIQUE("email"),
	CONSTRAINT "email_check" CHECK ("Users"."email" LIKE '%@%')
);
--> statement-breakpoint
CREATE TABLE "ai_conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"note_id" integer,
	"title" varchar(255) DEFAULT '',
	"messages" jsonb NOT NULL,
	"total_tokens" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"themes_id" integer,
	"theme" text,
	"picture" text,
	"product_title" varchar(40) NOT NULL,
	"products" jsonb NOT NULL,
	"estimated_time" timestamp,
	"estcost" numeric(10, 2),
	"cost" numeric(10, 2),
	"message" text,
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_token_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"tokens_used" integer DEFAULT 0,
	"max_tokens" integer DEFAULT 90000,
	"last_reset_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "Themes" ADD CONSTRAINT "Themes_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversation" ADD CONSTRAINT "ai_conversation_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversation" ADD CONSTRAINT "ai_conversation_note_id_Notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."Notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_token_usage" ADD CONSTRAINT "user_token_usage_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;