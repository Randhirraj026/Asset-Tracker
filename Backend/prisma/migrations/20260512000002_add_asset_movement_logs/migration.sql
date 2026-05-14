-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('OUT', 'IN', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ValidationResult" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "asset_movement_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "asset_id" UUID,
    "asset_identifier" VARCHAR(100),
    "previous_status" "AssetStatus",
    "requested_status" "AssetStatus",
    "movement_type" "MovementType" NOT NULL,
    "validation_result" "ValidationResult" NOT NULL,
    "scanned_by" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "asset_movement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_movement_logs_asset_id_idx" ON "asset_movement_logs"("asset_id");

-- CreateIndex
CREATE INDEX "asset_movement_logs_movement_type_idx" ON "asset_movement_logs"("movement_type");

-- CreateIndex
CREATE INDEX "asset_movement_logs_validation_result_idx" ON "asset_movement_logs"("validation_result");

-- CreateIndex
CREATE INDEX "asset_movement_logs_timestamp_idx" ON "asset_movement_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "asset_movement_logs" ADD CONSTRAINT "asset_movement_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_movement_logs" ADD CONSTRAINT "asset_movement_logs_scanned_by_fkey" FOREIGN KEY ("scanned_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
