import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, formatDateShort, INSTRUMENT_LABELS, INSTRUMENT_COLORS, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, AlertTriangle, TrendingUp, TrendingDown, Shield, Clock } from 'lucide-react'
import { addDays } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const [contracts, upcomingFixings, allFixings] = await Promise.all([
    prisma.contract.findMany({
      include: { counterparty: true, _count: { select: { fixings: true } } },
      orderBy: { tradeDate: 'desc' },
    }),
    prisma.fixing.findMany({
      where: {
        status: 'pending',
        fixingDate: { lte: addDays(new Date(), 30) },
      },
      include: { contract: { include: { counterparty: true } } },
      orderBy: { fixingDate: 'asc' },
      take: 8,
    }),
    prisma.fixing.findMany({
      where: { pnl: { not: null } },
      select: { pnl: true },
    }),
  ])

  const activeContracts = contracts.filter(c => c.status === 'active')
  const totalNotionalUSD = activeContracts.reduce((s, c) => s + c.notionalAmount * c.totalFixings, 0)
  const totalObligation = activeContracts.reduce((s, c) => s + (c.maxObligation || c.notionalAmount * c.totalFixings), 0)
  const totalPnl = allFixings.reduce((s, f) => s + (f.pnl || 0), 0)

  return { contracts, upcomingFixings, totalNotionalUSD, totalObligation, totalPnl, activeContracts }
}

export default async function DashboardPage() {
  const { contracts, upcomingFixings, totalNotionalUSD, totalObligation, totalPnl, activeContracts } = await getDashboardData()

  const today = new Date()
  const nextFixing = upcomingFixings[0]

  const statCards = [
    {
      label: 'Contratos activos',
      value: activeContracts.length.toString(),
      sub: `de ${contracts.length} total`,
      icon: Shield,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Nocional total USD',
      value: formatCurrency(totalNotionalUSD, 'USD'),
      sub: 'Exposición máxima',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Obligación máxima USD',
      value: formatCurrency(totalObligation, 'USD'),
      sub: 'Escenario apalancado',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'P&L realizado',
      value: formatCurrency(Math.abs(totalPnl), 'EUR'),
      sub: totalPnl >= 0 ? '↑ Ganancia acumulada' : '↓ Pérdida acumulada',
      icon: totalPnl >= 0 ? TrendingUp : TrendingDown,
      color: totalPnl >= 0 ? 'text-green-600' : 'text-red-600',
      bg: totalPnl >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{formatDate(today)} · Cuadros Eléctricos Nazarenos S.L.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Contratos */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Contratos activos</h2>
            <Link href="/contratos" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {contracts.filter(c => c.status === 'active').map(contract => (
              <Link
                key={contract.id}
                href={`/contratos/${contract.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-gray-500">{contract.reference}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${INSTRUMENT_COLORS[contract.instrumentType] || 'bg-gray-100 text-gray-700'}`}>
                      {INSTRUMENT_LABELS[contract.instrumentType] || contract.instrumentType}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{contract.counterparty.name.split(' ').slice(0, 3).join(' ')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Strike: {contract.strikeRate} · Vto: {formatDateShort(contract.endDate)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(contract.notionalAmount, 'USD')}</p>
                  <p className="text-xs text-gray-400">{contract._count.fixings} fixings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Próximos fixings */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Próximos fixings</h2>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingFixings.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No hay fixings en los próximos 30 días</p>
              </div>
            ) : (
              upcomingFixings.map(fixing => {
                const daysUntil = Math.ceil((fixing.fixingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysUntil <= 3
                return (
                  <Link
                    key={fixing.id}
                    href={`/contratos/${fixing.contractId}`}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {daysUntil === 0 ? 'HOY' : `+${daysUntil}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800">{fixing.contract.reference}</p>
                      <p className="text-xs text-gray-400">{formatDate(fixing.fixingDate)} · #{fixing.fixingNumber}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-gray-700">{formatCurrency(fixing.notionalAmount, 'USD')}</p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
          {nextFixing && (
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-400">
                Próximo fixing: <span className="font-medium text-gray-600">{formatDate(nextFixing.fixingDate)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
