import { NextRequest, NextResponse } from 'next/server';
import { AdminRepository } from '../../../repository/adminRepository'

const adminRepository = new AdminRepository();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const admin = await adminRepository.getById(Number(id));
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    return NextResponse.json(admin);
  } catch (error) {
    console.error('Failed to fetch admin:', error);
    return NextResponse.json({ error: 'Failed to fetch admin' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const updatedAdmin = await adminRepository.update(Number(id), body);
    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Failed to update admin:', error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const deletedAdmin = await adminRepository.delete(Number(id));
    return NextResponse.json({ message: 'Admin deleted successfully', admin: deletedAdmin });
  } catch (error) {
    console.error('Failed to delete admin:', error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}

