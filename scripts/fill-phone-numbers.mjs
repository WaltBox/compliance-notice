import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const FAKE_PHONE = '(555) 000-0000';

/**
 * Fill phone numbers for responses that don't have them
 */
async function fillPhoneNumbers() {
  try {
    console.log('Starting phone number fill script...\n');

    // Update OptOutResponses
    const optOutResult = await prisma.optOutResponse.updateMany({
      where: {
        OR: [
          { phoneNumber: null },
          { phoneNumber: '' },
        ],
      },
      data: {
        phoneNumber: FAKE_PHONE,
      },
    });

    console.log(`✓ Updated ${optOutResult.count} OptOutResponse records`);

    // Update OptInResponses
    const optInResult = await prisma.optInResponse.updateMany({
      where: {
        OR: [
          { phoneNumber: null },
          { phoneNumber: '' },
        ],
      },
      data: {
        phoneNumber: FAKE_PHONE,
      },
    });

    console.log(`✓ Updated ${optInResult.count} OptInResponse records`);

    // Update UpgradeSelections
    const upgradeResult = await prisma.upgradeSelection.updateMany({
      where: {
        OR: [
          { phoneNumber: null },
          { phoneNumber: '' },
        ],
      },
      data: {
        phoneNumber: FAKE_PHONE,
      },
    });

    console.log(`✓ Updated ${upgradeResult.count} UpgradeSelection records`);

    const totalUpdated = optOutResult.count + optInResult.count + upgradeResult.count;
    console.log(`\n✅ Total records updated: ${totalUpdated}`);

  } catch (error) {
    console.error('❌ Error filling phone numbers:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fillPhoneNumbers();










