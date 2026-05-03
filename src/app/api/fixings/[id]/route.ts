import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { fixingRate, scenario, amountExchanged, pnl, pnlNotes, status, settledAt } = body

    const updated = await prisma.fixing.update({
      where: { id: params.id },
      data: {
        fixingRate: fixingRate ?? undefined,
        scenario: scenario ?? undefined,
        amountExchanged: amountExchanged ?? undefined,
        pnl: pnl ?? undefined,
        pnlNotes: pnlNotes ?? undefined,
        status: status ?? undefined,
        settledAt: settledAt ? new Date(settledAt) : undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error updating fixing' }, { status: 500 })
  }
}
