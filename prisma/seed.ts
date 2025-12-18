import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting minimal database seed...');

    // ============================================
    // CREATE USERS ONLY
    // ============================================
    console.log('Creating users...');

    const adminPassword = await hashPassword('admin123');
    const studentPassword = await hashPassword('student123');

    const admin = await prisma.user.upsert({
        where: { email: 'admin@ums.ac.id' },
        update: {},
        create: {
            email: 'admin@ums.ac.id',
            username: 'Admin UMS',
            password: adminPassword,
            role: 'SUPER_ADMIN',
            totalPoints: 0,
        },
    });

    const contentManager = await prisma.user.upsert({
        where: { email: 'content@ums.ac.id' },
        update: {},
        create: {
            email: 'content@ums.ac.id',
            username: 'Content Manager',
            password: adminPassword,
            role: 'CONTENT_MANAGER',
            totalPoints: 0,
        },
    });

    const students = await Promise.all([
        prisma.user.upsert({
            where: { email: 'andi@student.com' },
            update: {},
            create: {
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
            update: {},
            create: {
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
            update: {},
            create: {
                email: 'citra@student.com',
                username: 'Citra Dewi',
                password: studentPassword,
                role: 'STUDENT',
                kelas: '2A',
                totalPoints: 980,
            },
        }),
    ]);

    console.log(`✅ Created ${students.length + 2} users`);

    // ============================================
    // CREATE QUIZZES FOR TESTING
    // ============================================
    console.log('\\nCreating quizzes...');

    const quizzes = await Promise.all([
        prisma.quiz.create({
            data: {
                question: 'Apakah menyikat gigi harus dilakukan minimal 2 kali sehari?',
                answer: true,
                explanation: 'Menyikat gigi 2 kali sehari (pagi dan malam) membantu membersihkan plak dan bakteri.',
                category: 'DENTAL_HYGIENE',
                difficulty: 'EASY',
                isActive: true,
                createdById: admin.id,
            },
        }),
        prisma.quiz.create({
            data: {
                question: 'Apakah makan permen setiap hari baik untuk gigi?',
                answer: false,
                explanation: 'Gula pada permen dapat menyebabkan gigi berlubang karena bakteri mengubahnya menjadi asam.',
                category: 'DENTAL_HYGIENE',
                difficulty: 'EASY',
                isActive: true,
                createdById: admin.id,
            },
        }),
        prisma.quiz.create({
            data: {
                question: 'Apakah fluoride membantu mencegah gigi berlubang?',
                answer: true,
                explanation: 'Fluoride memperkuat email gigi dan membantu mencegah kerusakan gigi.',
                category: 'DENTAL_HYGIENE',
                difficulty: 'MEDIUM',
                isActive: true,
                createdById: admin.id,
            },
        }),
        prisma.quiz.create({
            data: {
                question: 'Apakah kita harus mengganti sikat gigi setiap 6 bulan?',
                answer: false,
                explanation: 'Sikat gigi sebaiknya diganti setiap 3-4 bulan atau ketika bulu sikat sudah rusak.',
                category: 'DENTAL_HYGIENE',
                difficulty: 'MEDIUM',
                isActive: true,
                createdById: admin.id,
            },
        }),
        prisma.quiz.create({
            data: {
                question: 'Apakah gigi susu tidak perlu dirawat karena akan diganti?',
                answer: false,
                explanation: 'Gigi susu penting untuk perkembangan gigi permanen dan harus dirawat dengan baik.',
                category: 'DENTAL_HYGIENE',
                difficulty: 'HARD',
                isActive: true,
                createdById: admin.id,
            },
        }),
    ]);

    console.log(`✅ Created ${quizzes.length} quizzes`);

    // ============================================
    // CREATE VIDEOS FOR TESTING
    // ============================================
    console.log('\nCreating videos...');

    const videos = await Promise.all([
        prisma.video.create({
            data: {
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
        }),
        prisma.video.create({
            data: {
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
        }),
    ]);

    console.log(`✅ Created ${videos.length} videos`);

    // ============================================
    // CREATE COMICS FOR TESTING
    // ============================================
    console.log('\nCreating comics...');

    await prisma.comic.create({
        data: {
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

    console.log(`✅ Created 1 comic with 5 pages`);

    // ============================================
    // CREATE GAMES FOR TESTING
    // ============================================
    console.log('\nCreating games...');

    const games = await Promise.all([
        prisma.miniGame.create({
            data: {
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
        }),
        prisma.miniGame.create({
            data: {
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
        }),
    ]);

    console.log(`✅ Created ${games.length} games`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${students.length + 2}`);
    console.log(`   - Quizzes: ${quizzes.length}`);
    console.log(`   - Videos: ${videos.length}`);
    console.log(`   - Comics: 1 (with 5 pages)`);
    console.log(`   - Games: ${games.length}`);
    console.log(`\n🎮 Ready for testing!`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

console.log('\n🔑 Test Credentials:');
console.log('   Admin: admin@ums.ac.id / admin123');
console.log('   Content Manager: content@ums.ac.id / admin123');
console.log('   Student: andi@student.com / student123');
console.log('\n💡 Full content seeding will be done through the API endpoints.');
