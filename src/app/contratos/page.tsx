import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, formatDateShort, INSTRUMENT_LABELS, INSTRUMENT_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ContratosPage() {
  const contracts = await prisma.contract.findMany({
    include: {
      counterparty: true,
      _count: { select: { fixings: true, mtmEntries: true } },
      fixings: { where: { status: 'pending' }, orderBy: { fixingDate: 'asc' }, take: 1 },
      mtmEntries: { orderBy: { date: 'desc' }, take: 1 },
    },
    orderBy: { tradeDate: 'desc' },
  })

  const activeCount = contracts.filter(c => c.status === 'active').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contratos</h1>
          <p className="text-sm text-gray-500 mt-1">{activeCount} activos · {contracts.length} total</p>
        </div>
        <Link
          href="/contratos/nuevo"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo contrato
        </Link>
      </div>

      <div className="space-y-3">
        {contracts.map(contract => {
          const nextFixing = contract.fixings[0]
          const latestMtm = contract.mtmEntries[0]
          const daysToFixing = nextFixing
            ? Math.ceil((nextFixing.fixingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null

          return (
            <Link
              key={contract.id}
              href={`/contratos/${contract.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {contract.reference}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INSTRUMENT_COLORS[contract.instrumentType]}`}>
                        {INSTRUMENT_LABELS[contract.instrumentType] || contract.instrumentType}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[contract.status]}`}>
                        {STATUS_LABELS[contract.status] || contract.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{contract.instrumentName}</h3>
                    <p className="text-xs text-gray-500">{contract.counterparty.name}</p>
                  </div>

                  {/* Right - key figures */}
                  <div className="grid grid-cols-4 gap-6 shrink-0 text-right">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Nocional</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(contract.notionalAmount, 'USD')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Strike</p>
                      <p className="text-sm font-semibold text-gray-900">{contract.strikeRate.toFixed(4)}</p>
                      {contract.ekiBarrier && (
                        <p className="text-xs text-gray-400">EKI: {contract.ekiBarrier.toFixed(4)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Vencimiento</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDateShort(contract.endDate)}</p>
                      <p className="text-xs text-gray-400">{contract._count.fixings} fixings</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Próximo fixing</p>
                      {nextFixing ? (
                        <>
                          <p className={`text-sm font-semibold ${daysToFixing !== null && daysToFixing <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatDateShort(nextFixing.fixingDate)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {daysToFixing === 0 ? 'hoy' : daysToFixing === 1 ? 'mañana' : `en ${daysToFixing} días`}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">—</p>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                </div>

                {/* MtM bar */}
                {latestMtm && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                      MtM {formatDate(latestMtm.date)}:
                    </span>
                    <span className={`text-xs font-semibold ${latestMtm.mtmValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {latestMtm.mtmValue >= 0 ? '+' : ''}{formatCurrency(latestMtm.mtmValue, 'EUR')}
                    </span>
                    {latestMtm.spotRate && (
                      <span className="text-xs text-gray-400">Spot: {latestMtm.spotRate.toFixed(4)}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {contracts.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400 text-sm mb-4">No hay contratos registrados</p>
          <Link
            href="/contratos/nuevo"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Añadir primer contrato
          </Link>
        </div>
      )}
    </div>
  )
}
