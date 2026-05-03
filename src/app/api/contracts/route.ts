import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const contracts = await prisma.contract.findMany({
    include: { counterparty: true, _count: { select: { fixings: true } } },
    orderBy: { tradeDate: 'desc' },
  })
  return NextResponse.json(contracts)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const contract = await prisma.contract.create({ data: body })
    return NextResponse.json(contract, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error creating contract' }, { status: 500 })
  }
}
