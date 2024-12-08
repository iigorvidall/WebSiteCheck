import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const updatedSite = await prisma.clientSite.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error('Failed to update the client site:', error);
    return NextResponse.json({ error: 'Failed to update the client site' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const site = await prisma.clientSite.findUnique({
      where: { id: Number(id) },
    });
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (error) {
    console.error('Failed to fetch the client site:', error);
    return NextResponse.json({ error: 'Failed to fetch the client site' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.clientSite.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Failed to delete the client site:', error);
    return NextResponse.json({ error: 'Failed to delete the client site' }, { status: 500 });
  }
}

