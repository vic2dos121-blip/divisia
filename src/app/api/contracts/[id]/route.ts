import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      counterparty: true,
      fixings: { orderBy: { fixingNumber: 'asc' } },
      mtmEntries: { orderBy: { date: 'desc' } },
    },
  })
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contract)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const updated = await prisma.contract.update({ where: { id: params.id }, data: body })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: 'Error updating contract' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    await prisma.contract.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Error deleting contract' }, { status: 500 })
  }
}
