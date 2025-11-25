-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "rentersKitCanOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tenantLiabilityWaiverCanOptIn" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OptInResponse" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "optedInToTenantLiabilityWaiver" BOOLEAN NOT NULL DEFAULT false,
    "optedInToRentersKit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OptInResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OptInResponse_formId_idx" ON "OptInResponse"("formId");

-- AddForeignKey
ALTER TABLE "OptInResponse" ADD CONSTRAINT "OptInResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
