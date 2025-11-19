-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "beagleProgramId" TEXT NOT NULL,
    "tenantLiabilityWaiverCanOptOut" BOOLEAN NOT NULL DEFAULT false,
    "rentersKitCanOptOut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptOutResponse" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "optedOutOfTenantLiabilityWaiver" BOOLEAN NOT NULL DEFAULT false,
    "optedOutOfRentersKit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OptOutResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Form_beagleProgramId_key" ON "Form"("beagleProgramId");

-- CreateIndex
CREATE INDEX "Form_beagleProgramId_idx" ON "Form"("beagleProgramId");

-- CreateIndex
CREATE INDEX "OptOutResponse_formId_idx" ON "OptOutResponse"("formId");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_beagleProgramId_fkey" FOREIGN KEY ("beagleProgramId") REFERENCES "BeagleProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptOutResponse" ADD CONSTRAINT "OptOutResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
