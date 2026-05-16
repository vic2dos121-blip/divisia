import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { contractId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const entries = await prisma.mtmEntry.findMany({
    where: { contractId: params.contractId },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: Request, { params }: { params: { contractId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { date, mtmValue, spotRate, source, notes } = body

    const entry = await prisma.mtmEntry.create({
      data: {
        contractId: params.contractId,
        date: new Date(date),
        mtmValue,
        spotRate: spotRate ?? null,
        source: source ?? null,
        notes: notes ?? null,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error creating MtM entry' }, { status: 500 })
  }
}
