import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { promises as fs } from 'fs';

// Function to ensure directory exists
async function ensureUploadsDirectoryExists() {
    const dir = join(process.cwd(), 'public/uploads');
    try {
        await fs.access(dir);
    } catch (error) {
        // If directory doesn't exist, create it
        await fs.mkdir(dir, { recursive: true });
    }
}

// GET all media files
export async function GET() {
    try {
        await mongooseConnect();
        const media = await Media.find({}).sort({ createdAt: -1 });
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

// DELETE a media file
export async function DELETE(request) {
    try {
        await mongooseConnect();
        const { id, url } = await request.json();
        if (!id || !url) {
            return NextResponse.json({ error: 'ID and URL are required' }, { status: 400 });
        }

        const deletedMedia = await Media.findByIdAndDelete(id);
        if (!deletedMedia) {
            return NextResponse.json({ error: 'Media not found in DB' }, { status: 404 });
        }

        try {
            const filename = url.split('/').pop();
            const path = join(process.cwd(), 'public/uploads', filename);
            await unlink(path);
        } catch (fileError) {
            console.warn(`File not found on server, but deleted from DB: ${fileError.message}`);
        }

        return NextResponse.json({ success: true, message: 'Media deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete media', details: error.message }, { status: 500 });
    }
}