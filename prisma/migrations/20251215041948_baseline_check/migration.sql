/*
  Warnings:

  - You are about to drop the column `totalItemCost` on the `order_item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "totalItemCost",
ADD COLUMN     "totalcost" DECIMAL(65,30) DEFAULT 0;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
