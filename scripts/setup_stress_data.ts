
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SESSION_CODE = 'STRESS100';
const HOST_EMAIL = 'admin@ums.ac.id'; // Ensure this matches seed

async function main() {
    console.log('🧪 Setting up Stress Test Data...');

    // 1. Get Host ID
    const host = await prisma.user.findUnique({
        where: { email: HOST_EMAIL }
    });

    if (!host) {
        console.error(`❌ Host user (${HOST_EMAIL}) not found. Run seed first.`);
        process.exit(1);
    }

    // 2. Upsert Quiz Session
    const session = await prisma.quizSession.upsert({
        where: { code: SESSION_CODE },
        update: {
            status: 'ACTIVE',
            isShuffled: true,
            timerPerQuestion: 30
        },
        create: {
            code: SESSION_CODE,
            title: 'Stress Test Session (100 Users)',
            status: 'ACTIVE',
            hostId: host.id,
            timerPerQuestion: 30,
            isShuffled: true
        }
    });

    console.log(`✅ Session '${SESSION_CODE}' is READY (Status: ${session.status}).`);

    // 3. Ensure Quizzes Exist (Seed check)
    const count = await prisma.quiz.count();
    console.log(`✅ Quizzes available: ${count}`);

    if (count < 5) {
        console.warn('⚠️ Warning: Low quiz count. Seed data might be incomplete.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
