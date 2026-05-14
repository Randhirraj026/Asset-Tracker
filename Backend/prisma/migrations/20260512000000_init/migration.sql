CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "AssetStatus" AS ENUM ('IN_OFFICE', 'OUTSIDE', 'RETURNED', 'MAINTENANCE', 'LOST');
CREATE TYPE "LogStatus" AS ENUM ('OUT', 'IN');
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ASSET_MANAGER', 'RECEPTION');

CREATE TABLE "employees" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "emp_id" VARCHAR(50) NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "email" VARCHAR(150) NOT NULL,
  "department" VARCHAR(100) NOT NULL,
  "designation" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(30),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assets" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "asset_id" VARCHAR(50) NOT NULL,
  "asset_type" VARCHAR(100) NOT NULL,
  "serial_number" VARCHAR(100) NOT NULL,
  "model" VARCHAR(100),
  "qr_code" VARCHAR(255),
  "assigned_employee_id" UUID,
  "assigned_date" TIMESTAMP(3),
  "status" "AssetStatus" NOT NULL DEFAULT 'IN_OFFICE',
  "remarks" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admins" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "username" VARCHAR(80) NOT NULL,
  "email" VARCHAR(150) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'ASSET_MANAGER',
  "last_login" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "asset_logs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "asset_id" UUID NOT NULL,
  "employee_id" UUID,
  "exit_time" TIMESTAMP(3),
  "entry_time" TIMESTAMP(3),
  "total_hours" DECIMAL(10,2),
  "total_days" DECIMAL(10,2),
  "status" "LogStatus" NOT NULL,
  "remarks" TEXT,
  "scanned_by" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "asset_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "admin_id" UUID,
  "action" VARCHAR(120) NOT NULL,
  "module" VARCHAR(80) NOT NULL,
  "ip_address" VARCHAR(80),
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "employees_emp_id_key" ON "employees"("emp_id");
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");
CREATE INDEX "employees_department_idx" ON "employees"("department");
CREATE INDEX "employees_name_idx" ON "employees"("name");

CREATE UNIQUE INDEX "assets_asset_id_key" ON "assets"("asset_id");
CREATE UNIQUE INDEX "assets_serial_number_key" ON "assets"("serial_number");
CREATE UNIQUE INDEX "assets_qr_code_key" ON "assets"("qr_code");
CREATE INDEX "assets_asset_type_idx" ON "assets"("asset_type");
CREATE INDEX "assets_status_idx" ON "assets"("status");
CREATE INDEX "assets_assigned_employee_id_idx" ON "assets"("assigned_employee_id");

CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
CREATE INDEX "admins_role_idx" ON "admins"("role");

CREATE INDEX "asset_logs_asset_id_status_idx" ON "asset_logs"("asset_id", "status");
CREATE INDEX "asset_logs_employee_id_idx" ON "asset_logs"("employee_id");
CREATE INDEX "asset_logs_exit_time_idx" ON "asset_logs"("exit_time");
CREATE INDEX "asset_logs_entry_time_idx" ON "asset_logs"("entry_time");

CREATE INDEX "audit_logs_admin_id_idx" ON "audit_logs"("admin_id");
CREATE INDEX "audit_logs_module_idx" ON "audit_logs"("module");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

ALTER TABLE "assets" ADD CONSTRAINT "assets_assigned_employee_id_fkey" FOREIGN KEY ("assigned_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_logs" ADD CONSTRAINT "asset_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asset_logs" ADD CONSTRAINT "asset_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "asset_logs" ADD CONSTRAINT "asset_logs_scanned_by_fkey" FOREIGN KEY ("scanned_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
