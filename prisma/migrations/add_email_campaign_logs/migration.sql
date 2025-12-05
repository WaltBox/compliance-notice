-- CreateTable EmailCampaignLog
CREATE TABLE "EmailCampaignLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "messagePreview" TEXT,
    "totalRecipients" INTEGER NOT NULL,
    "successfulSends" INTEGER NOT NULL DEFAULT 0,
    "failedSends" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmailCampaignLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable EmailRecipient
CREATE TABLE "EmailRecipient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "property" TEXT,
    "unit" TEXT,

    CONSTRAINT "EmailRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailCampaignLog_campaignId_idx" ON "EmailCampaignLog"("campaignId");

-- CreateIndex
CREATE INDEX "EmailCampaignLog_createdAt_idx" ON "EmailCampaignLog"("createdAt");

-- CreateIndex
CREATE INDEX "EmailRecipient_campaignId_idx" ON "EmailRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "EmailRecipient_email_idx" ON "EmailRecipient"("email");

-- CreateIndex
CREATE INDEX "EmailRecipient_status_idx" ON "EmailRecipient"("status");

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaignLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

