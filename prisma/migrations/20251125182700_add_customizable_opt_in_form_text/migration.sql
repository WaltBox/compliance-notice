/*
  Warnings:

  - You are about to drop the column `optOutFormSubtitle` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `optOutFormTitle` on the `Form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Form" DROP COLUMN "optOutFormSubtitle",
DROP COLUMN "optOutFormTitle";
