import type { Contract, Counterparty, Fixing, MtmEntry } from '@prisma/client'

export type ContractWithRelations = Contract & {
  counterparty: Counterparty
  fixings: Fixing[]
  mtmEntries: MtmEntry[]
}

export type ContractSummary = Contract & {
  counterparty: Counterparty
  _count: { fixings: number; mtmEntries: number }
  fixings: Fixing[]
}

export type DashboardStats = {
  totalContracts: number
  activeContracts: number
  totalNotionalUSD: number
  totalObligationUSD: number
  pendingFixings: number
  nextFixingDate: Date | null
  totalPnl: number
  latestMtm: number
}
