/*
  Warnings:

  - You are about to drop the column `createdAt` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `order_item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
