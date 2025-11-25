-- AlterTable
ALTER TABLE "BeagleProgram" ADD COLUMN     "insuranceNotRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noticeInsuranceText" TEXT,
ADD COLUMN     "noticeIntroText" TEXT,
ADD COLUMN     "noticeTitle" TEXT;
