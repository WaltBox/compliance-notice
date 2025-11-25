import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPhoneNumbers() {
  try {
    console.log('\n=== PHONE NUMBER DEBUGGING ===\n');

    // Check OptOutResponses
    const optOutResponses = await prisma.optOutResponse.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    console.log('OptOutResponses (first 5):');
    console.log(JSON.stringify(optOutResponses, null, 2));

    // Count by phone number
    const optOutPhoneCount = await prisma.optOutResponse.groupBy({
      by: ['phoneNumber'],
      _count: true,
    });

    console.log('\nOptOutResponses by phone number:');
    console.log(JSON.stringify(optOutPhoneCount, null, 2));

    // Check OptInResponses
    const optInResponses = await prisma.optInResponse.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    console.log('\nOptInResponses (first 5):');
    console.log(JSON.stringify(optInResponses, null, 2));

    // Count by phone number
    const optInPhoneCount = await prisma.optInResponse.groupBy({
      by: ['phoneNumber'],
      _count: true,
    });

    console.log('\nOptInResponses by phone number:');
    console.log(JSON.stringify(optInPhoneCount, null, 2));

    // Check UpgradeSelections
    const upgradeSelections = await prisma.upgradeSelection.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    console.log('\nUpgradeSelections (first 5):');
    console.log(JSON.stringify(upgradeSelections, null, 2));

    // Count by phone number
    const upgradePhoneCount = await prisma.upgradeSelection.groupBy({
      by: ['phoneNumber'],
      _count: true,
    });

    console.log('\nUpgradeSelections by phone number:');
    console.log(JSON.stringify(upgradePhoneCount, null, 2));

    // Summary
    const optOutCount = await prisma.optOutResponse.count();
    const optOutPlaceholderCount = await prisma.optOutResponse.count({
      where: { phoneNumber: '(555) 000-0000' },
    });
    const optOutValidCount = optOutCount - optOutPlaceholderCount;

    const optInCount = await prisma.optInResponse.count();
    const optInPlaceholderCount = await prisma.optInResponse.count({
      where: { phoneNumber: '(555) 000-0000' },
    });
    const optInValidCount = optInCount - optInPlaceholderCount;

    const upgradeCount = await prisma.upgradeSelection.count();
    const upgradePlaceholderCount = await prisma.upgradeSelection.count({
      where: { phoneNumber: '(555) 000-0000' },
    });
    const upgradeValidCount = upgradeCount - upgradePlaceholderCount;

    console.log('\n=== SUMMARY ===');
    console.log(`OptOut: ${optOutCount} total, ${optOutValidCount} with real numbers, ${optOutPlaceholderCount} placeholder`);
    console.log(`OptIn: ${optInCount} total, ${optInValidCount} with real numbers, ${optInPlaceholderCount} placeholder`);
    console.log(`Upgrade: ${upgradeCount} total, ${upgradeValidCount} with real numbers, ${upgradePlaceholderCount} placeholder`);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPhoneNumbers();

