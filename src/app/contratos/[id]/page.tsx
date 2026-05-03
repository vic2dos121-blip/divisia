import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, INSTRUMENT_LABELS, INSTRUMENT_COLORS, STATUS_LABELS, STATUS_COLORS, FIXING_STATUS_LABELS, FIXING_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { FixingRow } from '@/components/FixingRow'
import { MtmSection } from '@/components/MtmSection'

export const dynamic = 'force-dynamic'

export default async function ContratoDetailPage({ params }: { params: { id: string } }) {
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      counterparty: true,
      fixings: { orderBy: { fixingNumber: 'asc' } },
      mtmEntries: { orderBy: { date: 'desc' } },
    },
  })

  if (!contract) notFound()

  const completedFixings = contract.fixings.filter(f => f.status !== 'pending')
  const pendingFixings = contract.fixings.filter(f => f.status === 'pending')
  const totalPnl = contract.fixings.reduce((s, f) => s + (f.pnl || 0), 0)
  const latestMtm = contract.mtmEntries[0]

  // Figura consumida acumulada para TARF
  const figConsumed = contract.accumulatedBenefit
  const figMax = contract.maxBenefit
  const figPct = figMax ? Math.min((figConsumed / figMax) * 100, 100) : null

  return (
    <div className="p-8 max-w-6xl">
      {/* Back */}
      <Link href="/contratos" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Contratos
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{contract.reference}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INSTRUMENT_COLORS[contract.instrumentType]}`}>
                {INSTRUMENT_LABELS[contract.instrumentType]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[contract.status]}`}>
                {STATUS_LABELS[contract.status]}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{contract.instrumentName}</h1>
            <p className="text-sm text-gray-500 mt-1">{contract.counterparty.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">P&L realizado</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl, 'EUR')}
            </p>
            {latestMtm && (
              <p className="text-xs text-gray-400 mt-1">
                MtM: <span className={latestMtm.mtmValue >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {latestMtm.mtmValue >= 0 ? '+' : ''}{formatCurrency(latestMtm.mtmValue, 'EUR')}
                </span>
                <span className="text-gray-300 mx-1">·</span>
                {formatDate(latestMtm.date)}
              </p>
            )}
          </div>
        </div>

        {/* Key terms grid */}
        <div className="grid grid-cols-6 gap-4 mt-6 pt-5 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400 mb-1">Par de divisas</p>
            <p className="text-sm font-semibold">{contract.currencyPair}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Fecha contrato</p>
            <p className="text-sm font-semibold">{formatDate(contract.tradeDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Inicio</p>
            <p className="text-sm font-semibold">{formatDate(contract.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Vencimiento</p>
            <p className="text-sm font-semibold">{formatDate(contract.endDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Nocional / fixing</p>
            <p className="text-sm font-semibold">{formatCurrency(contract.notionalAmount, 'USD')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Total fixings</p>
            <p className="text-sm font-semibold">{completedFixings.length} / {contract.totalFixings}</p>
          </div>
        </div>

        {/* Rates row */}
        <div className="grid grid-cols-6 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Strike rate</p>
            <p className="text-sm font-semibold text-indigo-700">{contract.strikeRate.toFixed(4)}</p>
          </div>
          {contract.strike2Rate && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Strike 2</p>
              <p className="text-sm font-semibold text-indigo-600">{contract.strike2Rate.toFixed(4)}</p>
            </div>
          )}
          {contract.ekiBarrier && (
            <div>
              <p className="text-xs text-gray-400 mb-1">EKI Barrier</p>
              <p className="text-sm font-semibold text-red-600">{contract.ekiBarrier.toFixed(4)}</p>
            </div>
          )}
          {contract.nonAccumBarrier && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Non-Accum. Barrier</p>
              <p className="text-sm font-semibold text-orange-600">{contract.nonAccumBarrier.toFixed(4)}</p>
            </div>
          )}
          {contract.gearedAccumBarrier && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Geared Accum.</p>
              <p className="text-sm font-semibold text-amber-600">{contract.gearedAccumBarrier.toFixed(4)}</p>
            </div>
          )}
          {contract.gearedAmount && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Importe apalancado</p>
              <p className="text-sm font-semibold">{formatCurrency(contract.gearedAmount, 'USD')}</p>
              <p className="text-xs text-gray-400">ratio {contract.gearRatio}:1</p>
            </div>
          )}
          {contract.maxNotional && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Nocional máximo</p>
              <p className="text-sm font-semibold">{formatCurrency(contract.maxNotional, 'USD')}</p>
            </div>
          )}
        </div>

        {/* Target/Benefit progress (for TARF) */}
        {figMax !== null && figPct !== null && (
          <div className="mt-5 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">
                Figuras consumidas: <span className="text-gray-800">{figConsumed.toFixed(4)}</span> / {figMax.toFixed(4)}
              </p>
              <p className="text-xs text-gray-400">{figPct.toFixed(1)}% del target</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                style={{ width: `${figPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Target benefit for BBVA forward */}
        {contract.targetBenefit && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-500">
              Nivel objetivo de beneficio: <span className="font-semibold text-gray-800">{contract.targetBenefit.toFixed(4)} EUR/USD</span>
              <span className="text-gray-300 mx-2">·</span>
              Beneficio acumulado: <span className="font-semibold text-gray-800">{contract.accumulatedBenefit.toFixed(4)}</span>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Fixings table */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">
              Fixings
              <span className="ml-2 text-xs font-normal text-gray-400">
                {completedFixings.length} completados · {pendingFixings.length} pendientes
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="px-4 py-2.5 text-left font-medium">#</th>
                  <th className="px-4 py-2.5 text-left font-medium">Fixing</th>
                  <th className="px-4 py-2.5 text-left font-medium">Entrega</th>
                  <th className="px-4 py-2.5 text-right font-medium">Nocional</th>
                  <th className="px-4 py-2.5 text-right font-medium">Strike</th>
                  <th className="px-4 py-2.5 text-right font-medium">Tipo real</th>
                  <th className="px-4 py-2.5 text-center font-medium">Escenario</th>
                  <th className="px-4 py-2.5 text-right font-medium">P&L</th>
                  <th className="px-4 py-2.5 text-center font-medium">Estado</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contract.fixings.map(fixing => (
                  <FixingRow key={fixing.id} fixing={fixing} contractId={contract.id} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MtM panel */}
        <div className="col-span-1">
          <MtmSection contractId={contract.id} mtmEntries={contract.mtmEntries} />
        </div>
      </div>
    </div>
  )
}
