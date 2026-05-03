import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: { counterparty: true, fixings: { orderBy: { fixingNumber: 'asc' } }, mtmEntries: { orderBy: { date: 'desc' } } },
  })
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contract)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const updated = await prisma.contract.update({ where: { id: params.id }, data: body })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: 'Error updating contract' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.contract.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Error deleting contract' }, { status: 500 })
  }
}
