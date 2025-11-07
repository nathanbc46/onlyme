/*
  Warnings:

  - You are about to drop the column `totalItemCOst` on the `order_item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "totalItemCOst",
ADD COLUMN     "totalItemCost" DECIMAL(65,30) DEFAULT 0;
