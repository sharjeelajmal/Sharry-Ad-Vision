import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { del } from '@vercel/blob'; // Vercel Blob se 'del' function import karein

// GET all media files (Is function mein koi change nahi hai)
export async function GET() {
    try {
        await mongooseConnect();
        const media = await Media.find({}).sort({ createdAt: -1 });
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

// DELETE a media file (Yeh function update kiya gaya hai)
export async function DELETE(request) {
    try {
        await mongooseConnect();
        // Frontend se 'id' aur 'url' hasil karein
        const { id, url } = await request.json(); 
        
        if (!id || !url) {
            return NextResponse.json({ error: 'ID and URL are required' }, { status: 400 });
        }

        // Step 1: Vercel Blob storage se file delete karein
        await del(url);

        // Step 2: MongoDB database se file ka record delete karein
        const deletedMedia = await Media.findByIdAndDelete(id);
        if (!deletedMedia) {
            // Agar DB mein record na mile, tab bhi theek hai kyunki file Blob se delete ho chuki hai
            return NextResponse.json({ success: true, message: 'File deleted from Blob, but not found in DB.' });
        }

        return NextResponse.json({ success: true, message: 'Media deleted successfully' });

    } catch (error) {
        // Agar Vercel Blob se file delete karte waqt koi error aaye
        if (error.message.includes('Blob not found')) {
             return NextResponse.json({ error: 'File not found on the storage server.' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to delete media', details: error.message }, { status: 500 });
    }
}