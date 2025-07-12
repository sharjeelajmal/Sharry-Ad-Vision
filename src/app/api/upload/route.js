import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import mongooseConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { promises as fs } from 'fs';

// Function to ensure directory exists
async function ensureUploadsDirectoryExists() {
    const dir = join(process.cwd(), 'public/uploads');
    try {
        await fs.access(dir);
    } catch (error) {
        await fs.mkdir(dir, { recursive: true });
    }
}

export async function POST(request) {
    try {
        // Ensure the uploads directory exists before proceeding
        await ensureUploadsDirectoryExists();

        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const path = join(process.cwd(), 'public/uploads', filename);
        await writeFile(path, buffer);

        const publicUrl = `/uploads/${filename}`;

        // ▼▼▼ NAYA CODE: DATABASE MEIN SAVE KAREIN ▼▼▼
        await mongooseConnect();
        const newMedia = new Media({
            filename: file.name,
            url: publicUrl,
            filetype: file.type.startsWith('video') ? 'video' : 'image',
        });
        await newMedia.save();
        // ▲▲▲ END OF NAYA CODE ▲▲▲

        return NextResponse.json({ success: true, url: publicUrl, media: newMedia });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed.", details: error.message }, { status: 500 });
    }
}