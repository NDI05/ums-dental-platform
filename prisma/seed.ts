import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

// CONSTANT IDs FOR IDEMPOTENCY
const ADMIN_ID = 'seed-user-admin';
const CONTENT_ID = 'seed-user-content';
const STUDENT1_ID = 'seed-user-student-1';
const STUDENT2_ID = 'seed-user-student-2';
const STUDENT3_ID = 'seed-user-student-3';

const VIDEO1_ID = 'seed-video-001';
const VIDEO2_ID = 'seed-video-002';
const COMIC1_ID = 'seed-comic-001';
const GAME1_ID = 'seed-game-001';
const GAME2_ID = 'seed-game-002';

const QUIZ_IDS = [
    'seed-quiz-001', 'seed-quiz-002', 'seed-quiz-003', 'seed-quiz-004', 'seed-quiz-005'
];

async function main() {
    console.log('🌱 Starting database seed data...');

    // ============================================
    // CREATE USERS
    // ============================================
    console.log('👤 Seeding Users...');

    const adminPassword = await hashPassword('admin123');
    const studentPassword = await hashPassword('student123');

    const admin = await prisma.user.upsert({
        where: { email: 'admin@ums.ac.id' },
        update: { password: adminPassword, role: 'SUPER_ADMIN' }, // Update password just in case
        create: {
            id: ADMIN_ID,
            email: 'admin@ums.ac.id',
            username: 'Admin UMS',
            password: adminPassword,
            role: 'SUPER_ADMIN',
            totalPoints: 0,
        },
    });

    const contentManager = await prisma.user.upsert({
        where: { email: 'content@ums.ac.id' },
        update: { password: adminPassword, role: 'CONTENT_MANAGER' },
        create: {
            id: CONTENT_ID,
            email: 'content@ums.ac.id',
            username: 'Content Manager',
            password: adminPassword,
            role: 'CONTENT_MANAGER',
            totalPoints: 0,
        },
    });

    // Students
    const students = await Promise.all([
        prisma.user.upsert({
            where: { email: 'andi@student.com' },
            update: { totalPoints: 1250 },
            create: {
                id: STUDENT1_ID,
                email: 'andi@student.com',
                username: 'Andi Setiawan',
                password: studentPassword,
                role: 'STUDENT',
                kelas: '3A',
                totalPoints: 1250,
            },
        }),
        prisma.user.upsert({
            where: { email: 'budi@student.com' },
            update: { totalPoints: 1100 },
            create: {
                id: STUDENT2_ID,
                email: 'budi@student.com',
                username: 'Budi Santoso',
                password: studentPassword,
                role: 'STUDENT',
                kelas: '3B',
                totalPoints: 1100,
            },
        }),
        prisma.user.upsert({
            where: { email: 'citra@student.com' },
            update: { totalPoints: 980 },
            create: {
                id: STUDENT3_ID,
                email: 'citra@student.com',
                username: 'Citra Dewi',
                password: studentPassword,
                role: 'STUDENT',
                kelas: '2A',
                totalPoints: 980,
            },
        }),
    ]);

    console.log(`✅ ${students.length + 2} Users Seeded.`);

    // ============================================
    // CREATE QUIZZES
    // ============================================
    console.log('❓ Seeding Quizzes...');

    const quizData = [
        {
            id: QUIZ_IDS[0],
            question: 'Apakah menyikat gigi harus dilakukan minimal 2 kali sehari?',
            answer: true,
            explanation: 'Menyikat gigi 2 kali sehari (pagi dan malam) membantu membersihkan plak dan bakteri.',
            category: 'DENTAL_HYGIENE',
            difficulty: 'EASY',
            isActive: true,
        },
        {
            id: QUIZ_IDS[1],
            question: 'Apakah makan permen setiap hari baik untuk gigi?',
            answer: false,
            explanation: 'Gula pada permen dapat menyebabkan gigi berlubang karena bakteri mengubahnya menjadi asam.',
            category: 'DENTAL_HYGIENE',
            difficulty: 'EASY',
            isActive: true,
        },
        {
            id: QUIZ_IDS[2],
            question: 'Apakah fluoride membantu mencegah gigi berlubang?',
            answer: true,
            explanation: 'Fluoride memperkuat email gigi dan membantu mencegah kerusakan gigi.',
            category: 'DENTAL_HYGIENE',
            difficulty: 'MEDIUM',
            isActive: true,
        },
        {
            id: QUIZ_IDS[3],
            question: 'Apakah kita harus mengganti sikat gigi setiap 6 bulan?',
            answer: false,
            explanation: 'Sikat gigi sebaiknya diganti setiap 3-4 bulan atau ketika bulu sikat sudah rusak.',
            category: 'DENTAL_HYGIENE',
            difficulty: 'MEDIUM',
            isActive: true,
        },
        {
            id: QUIZ_IDS[4],
            question: 'Apakah gigi susu tidak perlu dirawat karena akan diganti?',
            answer: false,
            explanation: 'Gigi susu penting untuk perkembangan gigi permanen dan harus dirawat dengan baik.',
            category: 'DENTAL_HYGIENE',
            difficulty: 'HARD',
            isActive: true,
        },
    ];

    for (const q of quizData) {
        await prisma.quiz.upsert({
            where: { id: q.id },
            update: {
                question: q.question, // Ensure content is up to date
                answer: q.answer,
                explanation: q.explanation,
                category: q.category,
                difficulty: q.difficulty as any,
                isActive: q.isActive,
            },
            create: {
                id: q.id,
                question: q.question,
                answer: q.answer,
                explanation: q.explanation,
                category: q.category,
                difficulty: q.difficulty as any,
                isActive: q.isActive,
                createdById: admin.id,
            },
        });
    }

    console.log(`✅ ${quizData.length} Quizzes Seeded.`);

    // ============================================
    // CREATE VIDEOS
    // ============================================
    console.log('🎥 Seeding Videos...');

    await prisma.video.upsert({
        where: { youtubeId: 'dQw4w9WgXcQ' },
        update: {},
        create: {
            id: VIDEO1_ID,
            youtubeId: 'dQw4w9WgXcQ',
            title: 'Cara Menyikat Gigi yang Benar',
            description: 'Pelajari teknik menyikat gigi yang benar untuk kesehatan gigi optimal',
            keyPoints: ['Sikat 2x sehari', 'Gerakan memutar', 'Jangan terlalu keras'],
            category: 'Kelas 1',
            thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            isPublished: true,
            publishedAt: new Date(),
            createdById: contentManager.id,
        },
    });

    await prisma.video.upsert({
        where: { youtubeId: 'jNQXAC9IVRw' },
        update: {},
        create: {
            id: VIDEO2_ID,
            youtubeId: 'jNQXAC9IVRw',
            title: 'Pentingnya Flossing',
            description: 'Mengapa benang gigi penting untuk kesehatan mulut',
            keyPoints: ['Membersihkan sela gigi', 'Mencegah plak'],
            category: 'Kelas 2',
            thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id,
        },
    });

    console.log(`✅ 2 Videos Seeded.`);

    // ============================================
    // CREATE COMICS
    // ============================================
    console.log('📚 Seeding Comics...');

    await prisma.comic.upsert({
        where: { id: COMIC1_ID },
        update: {},
        create: {
            id: COMIC1_ID,
            title: 'Petualangan Gigi Sehat',
            description: 'Komik edukatif tentang menjaga kesehatan gigi',
            coverUrl: 'https://via.placeholder.com/400x600?text=Comic+Cover',
            pages: [
                'https://via.placeholder.com/800x1200?text=Page+1',
                'https://via.placeholder.com/800x1200?text=Page+2',
                'https://via.placeholder.com/800x1200?text=Page+3',
                'https://via.placeholder.com/800x1200?text=Page+4',
                'https://via.placeholder.com/800x1200?text=Page+5',
            ],
            totalPages: 5,
            category: 'Edukasi',
            tags: ['kesehatan', 'gigi', 'anak'],
            isPublished: true,
            publishedAt: new Date(),
            createdById: contentManager.id,
        },
    });

    console.log(`✅ 1 Comic Seeded.`);

    // ============================================
    // CREATE GAMES
    // ============================================
    console.log('🎮 Seeding Games...');

    await prisma.miniGame.upsert({
        where: { id: GAME1_ID },
        update: {},
        create: {
            id: GAME1_ID,
            title: 'Tebak Gambar Gigi',
            description: 'Game interaktif untuk mengenal bagian-bagian gigi',
            thumbnailUrl: 'https://via.placeholder.com/400x300?text=Game+Thumbnail',
            gameUrl: 'https://example.com/games/dental-quiz',
            difficulty: 'EASY',
            sortOrder: 1,
            isPublished: true,
            publishedAt: new Date(),
            createdById: admin.id,
        },
    });

    await prisma.miniGame.upsert({
        where: { id: GAME2_ID },
        update: {},
        create: {
            id: GAME2_ID,
            title: 'Puzzle Sikat Gigi',
            description: 'Susun puzzle dan pelajari cara menyikat gigi',
            thumbnailUrl: 'https://via.placeholder.com/400x300?text=Puzzle+Game',
            gameUrl: 'https://example.com/games/brush-puzzle',
            difficulty: 'MEDIUM',
            sortOrder: 2,
            isPublished: true,
            publishedAt: new Date(),
            createdById: contentManager.id,
        },
    });

    console.log(`✅ 2 Games Seeded.`);

    console.log('\n✅ Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
