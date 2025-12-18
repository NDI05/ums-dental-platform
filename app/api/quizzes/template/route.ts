import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Prepare Data
        const headers = [
            'Question',
            'Category',
            'Difficulty',
            'Answer',
            'Explanation'
        ];

        const sampleData = [
            'Sikat gigi sebaiknya dilakukan minimal berapa kali sehari?',
            'Perawatan & Pencegahan',
            'EASY',
            'TRUE',
            'Minimal 2 kali sehari: pagi setelah sarapan dan malam sebelum tidur.'
        ];

        // 2. Fetch Dynamic Data for Reference (Optional context for user)
        // Since XLSX Community Edition doesn't support creating Data Validation (Dropdowns) easily,
        // We will just provide the data in a separate sheet for reference.

        const dbCategories = await prisma.quizCategory.findMany({ select: { name: true } });
        const categories = dbCategories.map(c => c.name);
        if (categories.length === 0) categories.push('Umum', 'Anatomi Gigi', 'Penyakit Gigi & Gusi');

        const referenceData = [
            ['Valid Categories', 'Valid Difficulties', 'Valid Answers'],
            ...Array.from({ length: Math.max(categories.length, 3) }, (_, i) => [
                categories[i] || '',
                ['EASY', 'MEDIUM', 'HARD'][i] || '',
                ['TRUE', 'FALSE'][i] || ''
            ])
        ];

        // 3. Create Workbook
        const wb = XLSX.utils.book_new();

        // Main Sheet
        const wsData = [headers, sampleData];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set Column Widths
        ws['!cols'] = [
            { wch: 50 }, // Question
            { wch: 25 }, // Category
            { wch: 15 }, // Difficulty
            { wch: 10 }, // Answer
            { wch: 50 }  // Explanation
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Template');

        // Reference Sheet
        const wsRef = XLSX.utils.aoa_to_sheet(referenceData);
        wsRef['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsRef, 'ReferenceData');

        // 4. Generate Buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Disposition': 'attachment; filename="Template_Soal_Kuis_UMS.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error('Template generation error:', error);
        return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
    }
}
