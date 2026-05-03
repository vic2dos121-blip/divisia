import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, FIXING_STATUS_COLORS, FIXING_STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const today = new Date()
  const start = addDays(today, -7)
  const end = addDays(today, 60)

  const fixings = await prisma.fixing.findMany({
    where: { fixingDate: { gte: start, lte: end } },
    include: { contract: { include: { counterparty: true } } },
    orderBy: { fixingDate: 'asc' },
  })

  // Group by date
  const byDate = fixings.reduce<Record<string, typeof fixings>>((acc, f) => {
    const key = format(f.fixingDate, 'yyyy-MM-dd')
    if (!acc[key]) acc[key] = []
    acc[key].push(f)
    return acc
  }, {})

  // Get unique dates sorted
  const dates = Object.keys(byDate).sort()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Calendario de fixings</h1>
      <p className="text-sm text-gray-500 mb-8">Próximos 60 días · {fixings.filter(f => f.status === 'pending').length} pendientes</p>

      <div className="space-y-1">
        {dates.map(dateKey => {
          const dayFixings = byDate[dateKey]
          const date = new Date(dateKey + 'T12:00:00')
          const isPast = date < today && !isToday(date)
          const isTodayDate = isToday(date)
          const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          return (
            <div key={dateKey} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isTodayDate ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-100'}`}>
              <div className={`flex items-center gap-4 px-5 py-3 border-b ${isTodayDate ? 'bg-indigo-50 border-indigo-100' : isPast ? 'bg-gray-50 border-gray-50' : 'bg-white border-gray-50'}`}>
                <div className={`text-center w-10 ${isTodayDate ? 'text-indigo-700' : isPast ? 'text-gray-400' : 'text-gray-900'}`}>
                  <p className="text-xs font-medium uppercase">{format(date, 'EEE', { locale: es })}</p>
                  <p className="text-xl font-bold leading-none">{format(date, 'd')}</p>
                  <p className="text-xs text-gray-400">{format(date, 'MMM', { locale: es })}</p>
                </div>
                <div className="flex-1">
                  <span className={`text-xs font-medium ${isTodayDate ? 'text-indigo-700' : isPast ? 'text-gray-500' : 'text-gray-700'}`}>
                    {isTodayDate ? '🔴 HOY' : isPast ? 'Pasado' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{dayFixings.length} fixing{dayFixings.length > 1 ? 's' : ''}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    {formatCurrency(dayFixings.reduce((s, f) => s + f.notionalAmount, 0), 'USD')}
                  </p>
                  <p className="text-xs text-gray-400">nocional del día</p>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {dayFixings.map(fixing => (
                  <Link
                    key={fixing.id}
                    href={`/contratos/${fixing.contractId}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-mono text-xs text-gray-500 w-28 shrink-0">{fixing.contract.reference}</span>
                    <span className="text-xs text-gray-600 flex-1">{fixing.contract.instrumentName.substring(0, 40)}...</span>
                    <span className="text-xs text-gray-500">{fixing.contract.counterparty.name.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="text-xs text-right w-24">{formatCurrency(fixing.notionalAmount, 'USD')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FIXING_STATUS_COLORS[fixing.status]} w-20 text-center`}>
                      {FIXING_STATUS_LABELS[fixing.status]}
                    </span>
                    {fixing.pnl != null && (
                      <span className={`text-xs font-semibold w-20 text-right ${fixing.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fixing.pnl >= 0 ? '+' : ''}{formatCurrency(fixing.pnl, 'EUR')}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
