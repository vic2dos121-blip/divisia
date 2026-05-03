import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, INSTRUMENT_LABELS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PnlPage() {
  const contracts = await prisma.contract.findMany({
    include: {
      counterparty: true,
      fixings: {
        where: { pnl: { not: null } },
        orderBy: { fixingDate: 'asc' },
      },
      mtmEntries: { orderBy: { date: 'desc' }, take: 1 },
    },
  })

  const contractsWithPnl = contracts.map(c => ({
    ...c,
    realizedPnl: c.fixings.reduce((s, f) => s + (f.pnl || 0), 0),
    latestMtm: c.mtmEntries[0]?.mtmValue || 0,
    completedFixings: c.fixings.length,
  }))

  const totalRealized = contractsWithPnl.reduce((s, c) => s + c.realizedPnl, 0)
  const totalMtm = contractsWithPnl.reduce((s, c) => s + c.latestMtm, 0)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">P&L Global</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">P&L Realizado Total</p>
          <p className={`text-3xl font-bold ${totalRealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalRealized >= 0 ? '+' : ''}{formatCurrency(totalRealized, 'EUR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Suma de todos los fixings liquidados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">MtM Agregado (último)</p>
          <p className={`text-3xl font-bold ${totalMtm >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalMtm >= 0 ? '+' : ''}{formatCurrency(totalMtm, 'EUR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Suma del último MtM por contrato</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">P&L Total Estimado</p>
          <p className={`text-3xl font-bold ${(totalRealized + totalMtm) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(totalRealized + totalMtm) >= 0 ? '+' : ''}{formatCurrency(totalRealized + totalMtm, 'EUR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Realizado + MtM abierto</p>
        </div>
      </div>

      {/* Per-contract breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Desglose por contrato</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500">
              <th className="px-6 py-3 text-left font-medium">Referencia</th>
              <th className="px-6 py-3 text-left font-medium">Tipo</th>
              <th className="px-6 py-3 text-left font-medium">Contraparte</th>
              <th className="px-6 py-3 text-right font-medium">Fixings liquidados</th>
              <th className="px-6 py-3 text-right font-medium">P&L Realizado</th>
              <th className="px-6 py-3 text-right font-medium">Último MtM</th>
              <th className="px-6 py-3 text-right font-medium">Total estimado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {contractsWithPnl.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-xs text-gray-600">{c.reference}</td>
                <td className="px-6 py-3 text-xs text-gray-600">{INSTRUMENT_LABELS[c.instrumentType] || c.instrumentType}</td>
                <td className="px-6 py-3 text-xs text-gray-600">{c.counterparty.name.split(' ').slice(0, 2).join(' ')}</td>
                <td className="px-6 py-3 text-right text-xs text-gray-500">{c.completedFixings}</td>
                <td className={`px-6 py-3 text-right font-semibold ${c.realizedPnl >= 0 ? 'text-green-600' : c.realizedPnl < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {c.realizedPnl !== 0 ? `${c.realizedPnl >= 0 ? '+' : ''}${formatCurrency(c.realizedPnl, 'EUR')}` : '—'}
                </td>
                <td className={`px-6 py-3 text-right font-semibold ${c.latestMtm >= 0 ? 'text-green-600' : c.latestMtm < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {c.latestMtm !== 0 ? `${c.latestMtm >= 0 ? '+' : ''}${formatCurrency(c.latestMtm, 'EUR')}` : '—'}
                </td>
                <td className={`px-6 py-3 text-right font-bold ${(c.realizedPnl + c.latestMtm) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {(c.realizedPnl + c.latestMtm) !== 0
                    ? `${(c.realizedPnl + c.latestMtm) >= 0 ? '+' : ''}${formatCurrency(c.realizedPnl + c.latestMtm, 'EUR')}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={4} className="px-6 py-3 text-sm text-gray-900">TOTAL</td>
              <td className={`px-6 py-3 text-right text-sm ${totalRealized >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totalRealized >= 0 ? '+' : ''}{formatCurrency(totalRealized, 'EUR')}
              </td>
              <td className={`px-6 py-3 text-right text-sm ${totalMtm >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totalMtm >= 0 ? '+' : ''}{formatCurrency(totalMtm, 'EUR')}
              </td>
              <td className={`px-6 py-3 text-right text-sm font-bold ${(totalRealized + totalMtm) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {(totalRealized + totalMtm) >= 0 ? '+' : ''}{formatCurrency(totalRealized + totalMtm, 'EUR')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
