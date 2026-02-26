-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('INDIVIDUAL', 'PROFESSIONAL', 'ADMIN');

-- CreateTable
CREATE TABLE "insurance_companies" (
    "id" UUID NOT NULL,
    "name" VARCHAR,
    "contact_email" VARCHAR,
    "phone_number" VARCHAR,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "insurance_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" UUID NOT NULL,
    "insurance_company_id" UUID,
    "family_name" VARCHAR,
    "primary_contact_email" VARCHAR,
    "subscription_status" VARCHAR NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "family_id" UUID,
    "email" VARCHAR NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "phone_number" VARCHAR,
    "date_of_birth" DATE NOT NULL,
    "gender_birth" VARCHAR,
    "gender_actual" VARCHAR,
    "role" VARCHAR NOT NULL DEFAULT 'family_member',
    "user_type" "UserType" NOT NULL DEFAULT 'INDIVIDUAL',
    "profile_picture_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "blood_type" VARCHAR,
    "height" DECIMAL(65,30),
    "weight" DECIMAL(65,30),
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronic_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "category" VARCHAR,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type_id" UUID NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "scheduled_time" TIME(6) NOT NULL,
    "recurrence" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" DATE,
    "end_date" DATE,
    "last_triggered_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "target_age_min" INTEGER,
    "target_age_max" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" VARCHAR NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_image_url" TEXT,
    "reading_time_minutes" INTEGER,
    "author" VARCHAR,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(6),
    "target_audience" JSONB,
    "seo_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "category" VARCHAR,
    "website_url" TEXT,
    "logo_url" TEXT,
    "contact_email" VARCHAR,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_extern" BOOLEAN NOT NULL DEFAULT true,
    "affiliate_program" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "partner_id" UUID,
    "article_id" UUID,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "recommendation_type" VARCHAR NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_at" TIMESTAMP(6),
    "clicked_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reminder_id" UUID,
    "notification_type" VARCHAR,
    "title" VARCHAR,
    "message" TEXT,
    "sent_at" TIMESTAMP(6) NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnary" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "nb_persons_followed" INTEGER NOT NULL DEFAULT 1,
    "has_general_practitioner" BOOLEAN,
    "general_practitioner_name" VARCHAR,
    "physical_activity_frequency" VARCHAR,
    "diet_type" VARCHAR,
    "uses_alternative_medicine" BOOLEAN NOT NULL DEFAULT false,
    "alternative_medicine_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_health_check" VARCHAR,
    "enabled_reminder_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reminder_frequency" VARCHAR,
    "enabled_notification_channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "questionnary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secret" VARCHAR,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" UUID NOT NULL,
    "webhook_id" UUID NOT NULL,
    "event" VARCHAR NOT NULL,
    "payload" JSONB NOT NULL,
    "response_status" INTEGER,
    "response_body" TEXT,
    "error" TEXT,
    "triggered_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_blacklist" (
    "id" UUID NOT NULL,
    "token" VARCHAR NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_family_id_idx" ON "users"("family_id");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "health_profiles_user_id_key" ON "health_profiles"("user_id");

-- CreateIndex
CREATE INDEX "reminders_user_id_is_active_idx" ON "reminders"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "reminders_is_active_start_date_end_date_idx" ON "reminders"("is_active", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "reminders_last_triggered_at_idx" ON "reminders"("last_triggered_at");

-- CreateIndex
CREATE INDEX "articles_category_id_is_published_idx" ON "articles"("category_id", "is_published");

-- CreateIndex
CREATE INDEX "articles_is_published_published_at_idx" ON "articles"("is_published", "published_at");

-- CreateIndex
CREATE INDEX "articles_created_at_idx" ON "articles"("created_at");

-- CreateIndex
CREATE INDEX "recommendations_user_id_is_dismissed_idx" ON "recommendations"("user_id", "is_dismissed");

-- CreateIndex
CREATE INDEX "recommendations_priority_created_at_idx" ON "recommendations"("priority", "created_at");

-- CreateIndex
CREATE INDEX "notification_logs_user_id_sent_at_idx" ON "notification_logs"("user_id", "sent_at");

-- CreateIndex
CREATE INDEX "notification_logs_reminder_id_idx" ON "notification_logs"("reminder_id");

-- CreateIndex
CREATE INDEX "notification_logs_delivered_idx" ON "notification_logs"("delivered");

-- CreateIndex
CREATE UNIQUE INDEX "questionnary_user_id_key" ON "questionnary"("user_id");

-- CreateIndex
CREATE INDEX "webhooks_is_active_idx" ON "webhooks"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_token_key" ON "token_blacklist"("token");

-- CreateIndex
CREATE INDEX "token_blacklist_expires_at_idx" ON "token_blacklist"("expires_at");

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_insurance_company_id_fkey" FOREIGN KEY ("insurance_company_id") REFERENCES "insurance_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_profiles" ADD CONSTRAINT "health_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "reminder_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "article_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnary" ADD CONSTRAINT "questionnary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_webhook_id_fkey" FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
