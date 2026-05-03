import { prisma } from '@/lib/prisma'
import { NuevoContratoForm } from '@/components/NuevoContratoForm'

export default async function NuevoContratoPage() {
  const counterparties = await prisma.counterparty.findMany({ orderBy: { name: 'asc' } })
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Nuevo contrato</h1>
      <p className="text-sm text-gray-500 mb-8">Registra una nueva cobertura de divisa</p>
      <NuevoContratoForm counterparties={counterparties} />
    </div>
  )
}
