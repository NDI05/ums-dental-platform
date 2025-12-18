import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Serve OpenAPI YAML file
export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'docs', 'api', 'openapi.yaml');
        const fileContent = fs.readFileSync(filePath, 'utf8');

        return new NextResponse(fileContent, {
            headers: {
                'Content-Type': 'text/yaml',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch {
        return new NextResponse('Error generating OpenAPI spec', { status: 500 });
    }
}
