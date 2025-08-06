import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { customAlphabet } from 'nanoid';

// Optional: Generate a unique name to avoid conflicts
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
);

export async function POST(request) {
  const file = request.body;
  const contentType = request.headers.get('content-type');
  // Get the original filename from the search parameters
  const { searchParams } = new URL(request.url);
  const originalFilename = searchParams.get('filename') || 'unknown-file';

  if (!file || !originalFilename) {
    return NextResponse.json(
      { error: 'No file or filename provided.' },
      { status: 400 }
    );
  }

  try {
    const uniqueId = nanoid();
    const blobFilename = `${uniqueId}-${originalFilename.replace(/\s/g, '_')}`;

    // Upload the file to Vercel Blob
    const blob = await put(blobFilename, file, {
      contentType: contentType,
      access: 'public',
    });

    // Connect to MongoDB and save the metadata
    await mongooseConnect();
    const newMedia = new Media({
      filename: originalFilename,
      url: blob.url, // Use the public URL from Vercel Blob
      filetype: contentType.startsWith('video') ? 'video' : 'image',
    });
    await newMedia.save();

    // Return a success response with the new media object
    return NextResponse.json({ success: true, url: blob.url, media: newMedia });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: 'Upload failed.', details: error.message },
      { status: 500 }
    );
  }
}