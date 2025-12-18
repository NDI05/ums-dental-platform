import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const workbook = new ExcelJS.Workbook();

        // 1. Create Main Template Sheet
        const sheet = workbook.addWorksheet('Template');

        // Define Headers
        sheet.columns = [
            { header: 'Question', key: 'question', width: 50 },
            { header: 'Category', key: 'category', width: 25 },
            { header: 'Difficulty', key: 'difficulty', width: 15 },
            { header: 'Answer', key: 'answer', width: 10 },
            { header: 'Explanation', key: 'explanation', width: 50 }
        ];

        // Add Sample Data
        sheet.addRow({
            question: 'Sikat gigi sebaiknya dilakukan minimal berapa kali sehari?',
            category: 'Perawatan & Pencegahan',
            difficulty: 'EASY',
            answer: 'TRUE',
            explanation: 'Minimal 2 kali sehari: pagi setelah sarapan dan malam sebelum tidur.'
        });

        // 2. Create Hidden Validation Sheet
        const validationSheet = workbook.addWorksheet('DataValidation');
        validationSheet.state = 'hidden';

        // Fetch Dynamic Categories
        const start = Date.now();
        const dbCategories = await prisma.quizCategory.findMany({
            select: { name: true },
            orderBy: { name: 'asc' }
        });

        let categories = dbCategories.map(c => c.name);

        // Fallback if empty
        if (categories.length === 0) {
            categories = ['Umum', 'Anatomi Gigi', 'Penyakit Gigi & Gusi'];
        }

        // Add Difficulties Data
        const difficulties = ['EASY', 'MEDIUM', 'HARD'];

        // Add Answers Data
        const answers = ['TRUE', 'FALSE'];

        // Write data to Validation Sheet
        // Col A: Categories
        categories.forEach((cat, index) => {
            validationSheet.getCell(`A${index + 1}`).value = cat;
        });

        // Col B: Difficulties
        difficulties.forEach((diff, index) => {
            validationSheet.getCell(`B${index + 1}`).value = diff;
        });

        // Col C: Answers
        answers.forEach((ans, index) => {
            validationSheet.getCell(`C${index + 1}`).value = ans;
        });

        // 3. Apply Data Validation using references
        // Validation Limit: 100 rows
        const maxRows = 100;

        // Category (Col B) -> Reference Validation!A1:A6
        for (let i = 2; i <= maxRows; i++) {
            sheet.getCell(`B${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`DataValidation!$A$1:$A$${categories.length}`]
            };
        }

        // Difficulty (Col C) -> Reference Validation!B1:B3
        for (let i = 2; i <= maxRows; i++) {
            sheet.getCell(`C${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`DataValidation!$B$1:$B$${difficulties.length}`]
            };
        }

        // Answer (Col D) -> Reference Validation!C1:C2
        for (let i = 2; i <= maxRows; i++) {
            sheet.getCell(`D${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`DataValidation!$C$1:$C$${answers.length}`]
            };
        }

        // Styling
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        sheet.getRow(1).alignment = { horizontal: 'center' };

        // Generate Buffer
        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                // filename updated to provoke fresh download
                'Content-Disposition': 'attachment; filename="Template_Soal_Kuis_UMS.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error('Template generation error:', error);
        return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
    }
}
