require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearOldJobs() {
  try {
    // Delete all old jobs from Arbeitnow (German jobs)
    const result = await prisma.job.deleteMany({
      where: {
        sourceBoard: 'Arbeitnow'
      }
    });

    console.log(`✅ Deleted ${result.count} German jobs from Arbeitnow`);

    // Get remaining job count
    const remaining = await prisma.job.count();
    console.log(`📊 Total jobs remaining: ${remaining}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearOldJobs();
