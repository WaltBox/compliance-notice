-- CreateTable
CREATE TABLE "SmsCampaignLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminEmail" TEXT NOT NULL,
    "totalRecipients" INTEGER NOT NULL,
    "successfulSends" INTEGER NOT NULL DEFAULT 0,
    "failedSends" INTEGER NOT NULL DEFAULT 0,
    "messagePreview" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "SmsCampaignLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsCampaignLog_adminEmail_idx" ON "SmsCampaignLog"("adminEmail");

-- CreateIndex
CREATE INDEX "SmsCampaignLog_createdAt_idx" ON "SmsCampaignLog"("createdAt");
