-- CreateTable
CREATE TABLE "UpgradeSelection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beagleProgramId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "selectedUpgrade" TEXT NOT NULL,
    "selectedUpgradePrice" TEXT NOT NULL,

    CONSTRAINT "UpgradeSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UpgradeSelection_beagleProgramId_idx" ON "UpgradeSelection"("beagleProgramId");

-- AddForeignKey
ALTER TABLE "UpgradeSelection" ADD CONSTRAINT "UpgradeSelection_beagleProgramId_fkey" FOREIGN KEY ("beagleProgramId") REFERENCES "BeagleProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
