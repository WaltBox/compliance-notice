/*
  Warnings:

  - You are about to drop the column `introText` on the `BeagleProgram` table. All the data in the column will be lost.
  - You are about to drop the column `pageTitle` on the `BeagleProgram` table. All the data in the column will be lost.
  - You are about to drop the column `products` on the `BeagleProgram` table. All the data in the column will be lost.
  - You are about to drop the column `programHeading` on the `BeagleProgram` table. All the data in the column will be lost.
  - You are about to drop the column `programSubheading` on the `BeagleProgram` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BeagleProgram" DROP COLUMN "introText",
DROP COLUMN "pageTitle",
DROP COLUMN "products",
DROP COLUMN "programHeading",
DROP COLUMN "programSubheading",
ADD COLUMN     "selectedProducts" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "webviewUrl" TEXT;
