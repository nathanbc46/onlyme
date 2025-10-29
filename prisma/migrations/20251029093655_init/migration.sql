/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,email,line,phone]` on the table `customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."customer_email_line_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "customer_name_key" ON "customer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_name_email_line_phone_key" ON "customer"("name", "email", "line", "phone");
