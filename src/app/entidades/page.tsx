import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EntidadesPage() {
  const counterparties = await prisma.counterparty.findMany({
    include: {
      contracts: {
        select: { id: true, notionalAmount: true, status: true, instrumentType: true, reference: true },
      },
    },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Entidades</h1>
      <p className="text-sm text-gray-500 mb-8">Bancos y brokers con los que operas</p>

      <div className="grid grid-cols-2 gap-5">
        {counterparties.map(cp => {
          const activeContracts = cp.contracts.filter(c => c.status === 'active')
          const totalNotional = activeContracts.reduce((s, c) => s + c.notionalAmount, 0)
          const instrumentTypes = Array.from(new Set(activeContracts.map(c => c.instrumentType)))

          return (
            <div key={cp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{cp.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{cp.type === 'banco' ? 'Banco' : 'Broker'} · {cp.country}</p>
                  {cp.contact && <p className="text-xs text-gray-400 mt-0.5">{cp.contact}</p>}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{activeContracts.length}</p>
                  <p className="text-xs text-gray-500">Contratos activos</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(totalNotional, 'USD')}</p>
                  <p className="text-xs text-gray-500">Nocional/fixing</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{cp.contracts.length}</p>
                  <p className="text-xs text-gray-500">Total histórico</p>
                </div>
              </div>

              {activeContracts.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Contratos activos:</p>
                  <div className="space-y-1">
                    {activeContracts.map(c => (
                      <Link
                        key={c.id}
                        href={`/contratos/${c.id}`}
                        className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <span className="font-mono">{c.reference}</span>
                        <span className="text-gray-400">{c.instrumentType}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
