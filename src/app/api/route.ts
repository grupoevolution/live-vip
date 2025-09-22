import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const streams = await prisma.liveStream.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ streams });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      thumbnail,
      videoUrl,
      streamerName,
      streamerAvatar,
      category,
      viewerCount,
      isVipOnly
    } = body;

    if (!title || !thumbnail || !streamerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const stream = await prisma.liveStream.create({
      data: {
        title,
        thumbnail,
        videoUrl: videoUrl || '',
        streamerName,
        streamerAvatar: streamerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        category: category || 'Entretenimento',
        viewerCount: viewerCount || Math.floor(Math.random() * 200) + 50,
        isVipOnly: isVipOnly || false,
        isLive: true
      }
    });

    return NextResponse.json({ stream });
  } catch (error) {
    console.error('Error creating stream:', error);
    return NextResponse.json(
      { error: 'Failed to create stream' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }

    const stream = await prisma.liveStream.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ stream });
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json(
      { error: 'Failed to update stream' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }

    await prisma.liveStream.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stream:', error);
    return NextResponse.json(
      { error: 'Failed to delete stream' },
      { status: 500 }
    );
  }
}
