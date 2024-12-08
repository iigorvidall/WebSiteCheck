import { NextResponse } from 'next/server'
import { AdminRepository } from '../../repository/adminRepository'

const adminRepo = new AdminRepository()

export async function GET() {
  try {
    const admins = await adminRepo.getAll()
    return NextResponse.json(admins)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch administrators' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newAdmin = await adminRepo.create(data)
    return NextResponse.json(newAdmin, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create administrator' }, { status: 500 })
  }
}

