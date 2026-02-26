-- CreateIndex
CREATE INDEX "articles_category_id_is_published_idx" ON "articles"("category_id", "is_published");

-- CreateIndex
CREATE INDEX "articles_is_published_published_at_idx" ON "articles"("is_published", "published_at");

-- CreateIndex
CREATE INDEX "articles_created_at_idx" ON "articles"("created_at");

-- CreateIndex
CREATE INDEX "notification_logs_user_id_sent_at_idx" ON "notification_logs"("user_id", "sent_at");

-- CreateIndex
CREATE INDEX "notification_logs_reminder_id_idx" ON "notification_logs"("reminder_id");

-- CreateIndex
CREATE INDEX "notification_logs_delivered_idx" ON "notification_logs"("delivered");

-- CreateIndex
CREATE INDEX "recommendations_user_id_is_dismissed_idx" ON "recommendations"("user_id", "is_dismissed");

-- CreateIndex
CREATE INDEX "recommendations_priority_created_at_idx" ON "recommendations"("priority", "created_at");

-- CreateIndex
CREATE INDEX "reminders_user_id_is_active_idx" ON "reminders"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "reminders_is_active_start_date_end_date_idx" ON "reminders"("is_active", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "reminders_last_triggered_at_idx" ON "reminders"("last_triggered_at");

-- CreateIndex
CREATE INDEX "token_blacklist_expires_at_idx" ON "token_blacklist"("expires_at");

-- CreateIndex
CREATE INDEX "users_family_id_idx" ON "users"("family_id");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "webhooks_is_active_idx" ON "webhooks"("is_active");
