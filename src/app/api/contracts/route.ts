import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const contracts = await prisma.contract.findMany({
    include: { counterparty: true, _count: { select: { fixings: true } } },
    orderBy: { tradeDate: 'desc' },
  })
  return NextResponse.json(contracts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const contract = await prisma.contract.create({ data: body })
    return NextResponse.json(contract, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error creating contract' }, { status: 500 })
  }
}
