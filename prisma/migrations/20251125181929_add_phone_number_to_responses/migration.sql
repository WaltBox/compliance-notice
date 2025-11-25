-- AlterTable
ALTER TABLE "OptInResponse" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "OptOutResponse" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "UpgradeSelection" ADD COLUMN     "phoneNumber" TEXT;
