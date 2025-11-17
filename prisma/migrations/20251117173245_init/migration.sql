-- CreateTable
CREATE TABLE "BeagleProgram" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyManagerName" TEXT NOT NULL,
    "propertyManagerSlug" TEXT NOT NULL,
    "pageTitle" TEXT NOT NULL,
    "introText" TEXT NOT NULL,
    "insuranceVerificationUrl" TEXT NOT NULL,
    "programHeading" TEXT NOT NULL DEFAULT 'View your Beagle program',
    "programSubheading" TEXT NOT NULL,
    "products" JSONB NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BeagleProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BeagleProgram_propertyManagerSlug_key" ON "BeagleProgram"("propertyManagerSlug");

-- CreateIndex
CREATE INDEX "BeagleProgram_propertyManagerSlug_idx" ON "BeagleProgram"("propertyManagerSlug");

-- CreateIndex
CREATE INDEX "BeagleProgram_isPublished_idx" ON "BeagleProgram"("isPublished");
