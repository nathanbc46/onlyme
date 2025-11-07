/*
  Warnings:

  - Made the column `cost` on table `order_item` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cost` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
/*
ALTER TABLE "order_item" ALTER COLUMN "cost" SET NOT NULL,
ALTER COLUMN "cost" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "cost" SET NOT NULL,
ALTER COLUMN "cost" SET DEFAULT 0;
*/

-- Fix null cost before applying NOT NULL
UPDATE "order_item" SET "cost" = 0 WHERE "cost" IS NULL;
UPDATE "product" SET "cost" = 0 WHERE "cost" IS NULL;

ALTER TABLE "order_item" ALTER COLUMN "cost" SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN "cost" SET NOT NULL;

