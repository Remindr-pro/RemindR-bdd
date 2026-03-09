-- AlterTable
ALTER TABLE "health_profiles" ADD COLUMN     "addictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "diet_type" VARCHAR,
ADD COLUMN     "sport_recurrence" VARCHAR;
