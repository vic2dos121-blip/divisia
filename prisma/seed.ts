import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Counterparties
  const hamiltonCourt = await prisma.counterparty.upsert({
    where: { id: 'hamilton-court-fx' },
    update: {},
    create: {
      id: 'hamilton-court-fx',
      name: 'Hamilton Court FX SIM S.p.A. - Sucursal en España',
      type: 'broker',
      country: 'España (IT)',
      contact: 'Carlos Gomez',
    },
  })

  const bbva = await prisma.counterparty.upsert({
    where: { id: 'bbva' },
    update: {},
    create: {
      id: 'bbva',
      name: 'Banco Bilbao Vizcaya Argentaria S.A.',
      type: 'banco',
      country: 'España',
      contact: 'Derivatives - derivatives.confirmations@bbva.com',
    },
  })

  // ─── CONTRATO 1: TARF EKI 2:1 (TRE15EAEF0) ─────────────────────────────────
  const tarf1 = await prisma.contract.upsert({
    where: { reference: 'TRE15EAEF0' },
    update: {},
    create: {
      reference: 'TRE15EAEF0',
      instrumentType: 'TARF_EKI',
      instrumentName: '2:1 Target Accrual Redemption Forward con Knock In Europeo (TARF)',
      counterpartyId: hamiltonCourt.id,
      currencyPair: 'EUR/USD',
      buyCurrency: 'EUR',
      sellCurrency: 'USD',
      tradeDate: new Date('2025-02-07'),
      startDate: new Date('2025-05-20'),
      endDate: new Date('2026-12-15'),
      status: 'active',
      notionalAmount: 100000,
      gearedAmount: 200000,
      gearRatio: 2.0,
      maxNotional: 4200000,
      maxObligation: 8400000,
      strikeRate: 1.0850,
      ekiBarrier: 1.0050,
      maxBenefit: 0.01,
      totalFixings: 42,
      fixingFrequency: 'biweekly',
      notes: 'Contrato firmado 10/02/2025. Fijaciones quincenales.',
    },
  })

  // Fixings para TRE15EAEF0 (primeros 10 para seed, el resto se generan igual)
  const tarfFixingDates = [
    { f: '2025-05-20', d: '2025-05-22' },
    { f: '2025-06-03', d: '2025-06-05' },
    { f: '2025-06-17', d: '2025-06-20' },
    { f: '2025-07-01', d: '2025-07-03' },
    { f: '2025-07-15', d: '2025-07-17' },
    { f: '2025-07-29', d: '2025-07-31' },
    { f: '2025-08-12', d: '2025-08-14' },
    { f: '2025-08-26', d: '2025-08-28' },
    { f: '2025-09-09', d: '2025-09-11' },
    { f: '2025-09-23', d: '2025-09-25' },
    { f: '2025-10-07', d: '2025-10-09' },
    { f: '2025-10-21', d: '2025-10-23' },
    { f: '2025-11-04', d: '2025-11-06' },
    { f: '2025-11-18', d: '2025-11-20' },
    { f: '2025-12-02', d: '2025-12-04' },
    { f: '2025-12-16', d: '2025-12-18' },
    { f: '2025-12-30', d: '2026-01-02' },
    { f: '2026-01-13', d: '2026-01-15' },
    { f: '2026-01-27', d: '2026-01-29' },
    { f: '2026-02-10', d: '2026-02-12' },
    { f: '2026-02-24', d: '2026-02-26' },
    { f: '2026-03-10', d: '2026-03-12' },
    { f: '2026-03-24', d: '2026-03-26' },
    { f: '2026-04-07', d: '2026-04-09' },
    { f: '2026-04-21', d: '2026-04-23' },
    { f: '2026-05-05', d: '2026-05-07' },
    { f: '2026-05-19', d: '2026-05-21' },
    { f: '2026-06-02', d: '2026-06-04' },
    { f: '2026-06-16', d: '2026-06-18' },
    { f: '2026-06-30', d: '2026-07-02' },
    { f: '2026-07-14', d: '2026-07-16' },
    { f: '2026-07-28', d: '2026-07-30' },
    { f: '2026-08-11', d: '2026-08-13' },
    { f: '2026-08-25', d: '2026-08-27' },
    { f: '2026-09-08', d: '2026-09-10' },
    { f: '2026-09-22', d: '2026-09-24' },
    { f: '2026-10-06', d: '2026-10-08' },
    { f: '2026-10-20', d: '2026-10-22' },
    { f: '2026-11-03', d: '2026-11-05' },
    { f: '2026-11-17', d: '2026-11-19' },
    { f: '2026-12-01', d: '2026-12-03' },
    { f: '2026-12-15', d: '2026-12-17' },
  ]

  for (let i = 0; i < tarfFixingDates.length; i++) {
    const { f, d } = tarfFixingDates[i]
    await prisma.fixing.upsert({
      where: { contractId_fixingNumber: { contractId: tarf1.id, fixingNumber: i + 1 } },
      update: {},
      create: {
        contractId: tarf1.id,
        fixingNumber: i + 1,
        fixingDate: new Date(f),
        deliveryDate: new Date(d),
        notionalAmount: 100000,
        gearedAmount: 200000,
        strikeRate: 1.0850,
      },
    })
  }

  // ─── CONTRATO 2: GEARED FORWARD 1:1 (BOP0018VPXW) ──────────────────────────
  const gearedFwd = await prisma.contract.upsert({
    where: { reference: 'BOP0018VPXW' },
    update: {},
    create: {
      reference: 'BOP0018VPXW',
      instrumentType: 'GEARED_FORWARD',
      instrumentName: '1:1 Geared Forward',
      counterpartyId: hamiltonCourt.id,
      currencyPair: 'EUR/USD',
      buyCurrency: 'USD',
      sellCurrency: 'EUR',
      tradeDate: new Date('2024-06-10'),
      startDate: new Date('2025-08-18'),
      endDate: new Date('2025-08-18'),
      status: 'active',
      notionalAmount: 500000,
      gearedAmount: 500000,
      gearRatio: 1.0,
      maxNotional: 500000,
      maxObligation: 500000,
      strikeRate: 1.0770,
      totalFixings: 1,
      fixingFrequency: 'one-shot',
      notes: 'Opción única. Si fixing < 1.0770: derecho a comprar USD. Si fixing > 1.0770: obligación a comprar USD.',
    },
  })

  await prisma.fixing.upsert({
    where: { contractId_fixingNumber: { contractId: gearedFwd.id, fixingNumber: 1 } },
    update: {},
    create: {
      contractId: gearedFwd.id,
      fixingNumber: 1,
      fixingDate: new Date('2025-08-18'),
      deliveryDate: new Date('2025-08-20'),
      notionalAmount: 500000,
      gearedAmount: 500000,
      strikeRate: 1.0770,
    },
  })

  // ─── CONTRATO 3: ACCUMULATOR (BOP0018VQNU) ──────────────────────────────────
  const accumulator = await prisma.contract.upsert({
    where: { reference: 'BOP0018VQNU' },
    update: {},
    create: {
      reference: 'BOP0018VQNU',
      instrumentType: 'ACCUMULATOR',
      instrumentName: 'Leveraged Resurrecting Accumulator (European Barrier)',
      counterpartyId: hamiltonCourt.id,
      currencyPair: 'EUR/USD',
      buyCurrency: 'EUR',
      sellCurrency: 'USD',
      tradeDate: new Date('2024-06-10'),
      startDate: new Date('2024-06-17'),
      endDate: new Date('2025-08-20'),
      status: 'active',
      notionalAmount: 24193.55,
      gearedAmount: 48387.10,
      gearRatio: 2.0,
      maxNotional: 1500000.10,
      maxObligation: 3000000.20,
      strikeRate: 1.0770,
      nonAccumBarrier: 1.1300,
      gearedAccumBarrier: 1.0100,
      totalFixings: 62,
      fixingFrequency: 'weekly',
      notes: 'Acumulador semanal. Entrega única el 20/08/2025 por el nocional acumulado total.',
    },
  })

  // Algunos fixings del acumulador (pasados - ya resueltos con datos de ejemplo)
  const accumFixings = [
    { f: '2024-06-17', d: '2025-08-20', n: 1, rate: 1.0742, scenario: 'A', status: 'exercised' },
    { f: '2024-06-24', d: '2025-08-20', n: 2, rate: 1.0752, scenario: 'A', status: 'exercised' },
    { f: '2024-07-01', d: '2025-08-20', n: 3, rate: 1.0835, scenario: 'A', status: 'exercised' },
    { f: '2024-07-08', d: '2025-08-20', n: 4, rate: 1.0792, scenario: 'A', status: 'exercised' },
    { f: '2024-07-15', d: '2025-08-20', n: 5, rate: 1.0910, scenario: 'C', status: 'not_exercised' },
    { f: '2024-07-22', d: '2025-08-20', n: 6, rate: 1.0880, scenario: 'C', status: 'not_exercised' },
    { f: '2024-07-29', d: '2025-08-20', n: 7, rate: 1.0823, scenario: 'A', status: 'exercised' },
    { f: '2024-08-05', d: '2025-08-20', n: 8, rate: 1.0925, scenario: 'C', status: 'not_exercised' },
    { f: '2024-08-12', d: '2025-08-20', n: 9, rate: 1.1000, scenario: 'C', status: 'not_exercised' },
    { f: '2024-08-19', d: '2025-08-20', n: 10, rate: 1.1100, scenario: 'C', status: 'not_exercised' },
  ]

  for (const fx of accumFixings) {
    await prisma.fixing.upsert({
      where: { contractId_fixingNumber: { contractId: accumulator.id, fixingNumber: fx.n } },
      update: {},
      create: {
        contractId: accumulator.id,
        fixingNumber: fx.n,
        fixingDate: new Date(fx.f),
        deliveryDate: new Date(fx.d),
        notionalAmount: 24193.55,
        gearedAmount: 48387.10,
        strikeRate: 1.0770,
        fixingRate: fx.rate,
        scenario: fx.scenario,
        amountExchanged: fx.status === 'exercised' ? 24193.55 : 0,
        status: fx.status,
        settledAt: fx.status !== 'pending' ? new Date(fx.f) : null,
      },
    })
  }

  // Fixings pendientes del acumulador
  const accumPendingDates = [
    '2024-09-03', '2024-09-09', '2024-09-16', '2024-09-23', '2024-09-30',
    '2024-10-07', '2024-10-15', '2024-10-21', '2024-10-28',
    '2024-11-04', '2024-11-12', '2024-11-18', '2024-11-25',
    '2024-12-02', '2024-12-09', '2024-12-16', '2024-12-23', '2024-12-30',
    '2025-01-06', '2025-01-13', '2025-01-21', '2025-01-27',
    '2025-02-03', '2025-02-10', '2025-02-18', '2025-02-24',
    '2025-03-03', '2025-03-10', '2025-03-17', '2025-03-24', '2025-03-31',
    '2025-04-07', '2025-04-14', '2025-04-22', '2025-04-28',
    '2025-05-05', '2025-05-12', '2025-05-19', '2025-05-27',
    '2025-06-02', '2025-06-09', '2025-06-16', '2025-06-23', '2025-06-30',
    '2025-07-07', '2025-07-14', '2025-07-21', '2025-07-28',
    '2025-08-04', '2025-08-11', '2025-08-18',
  ]

  for (let i = 0; i < accumPendingDates.length; i++) {
    const n = accumFixings.length + i + 1
    await prisma.fixing.upsert({
      where: { contractId_fixingNumber: { contractId: accumulator.id, fixingNumber: n } },
      update: {},
      create: {
        contractId: accumulator.id,
        fixingNumber: n,
        fixingDate: new Date(accumPendingDates[i]),
        deliveryDate: new Date('2025-08-20'),
        notionalAmount: 24193.55,
        gearedAmount: 48387.10,
        strikeRate: 1.0770,
      },
    })
  }

  // ─── CONTRATO 4: FORWARD BBVA (B00018664687) ────────────────────────────────
  const bbvaForward = await prisma.contract.upsert({
    where: { reference: 'B00018664687' },
    update: {},
    create: {
      reference: 'B00018664687',
      instrumentType: 'FORWARD',
      instrumentName: 'Forward sobre Divisas EUR/USD (2 Strikes + Target)',
      counterpartyId: bbva.id,
      currencyPair: 'EUR/USD',
      buyCurrency: 'EUR',
      sellCurrency: 'USD',
      tradeDate: new Date('2026-01-14'),
      startDate: new Date('2026-03-19'),
      endDate: new Date('2028-01-13'),
      status: 'active',
      notionalAmount: 50000,
      maxNotional: 4800000,
      strikeRate: 1.1185,
      strike2Rate: 1.0850,
      targetBenefit: 0.30,
      totalFixings: 96,
      fixingFrequency: 'weekly',
      notes: 'UTI: K8MS7FD7N5Z2WQ51AZ710000ST263990MX68274444. Nivel objetivo beneficio: 0.30 EUR/USD. Si fixing > Strike1: nocional simple. Si fixing ≤ Strike2: 2x nocional.',
    },
  })

  // Generar los 96 fixings semanales del BBVA forward
  const bbvaStart = new Date('2026-03-19')
  for (let i = 0; i < 96; i++) {
    const fixingDate = new Date(bbvaStart)
    fixingDate.setDate(bbvaStart.getDate() + i * 7)
    const deliveryDate = new Date(fixingDate)
    deliveryDate.setDate(fixingDate.getDate() + 2)

    await prisma.fixing.upsert({
      where: { contractId_fixingNumber: { contractId: bbvaForward.id, fixingNumber: i + 1 } },
      update: {},
      create: {
        contractId: bbvaForward.id,
        fixingNumber: i + 1,
        fixingDate,
        deliveryDate,
        notionalAmount: 50000,
        gearedAmount: 100000,
        strikeRate: 1.1185,
      },
    })
  }

  // MtM de ejemplo para TARF
  await prisma.mtmEntry.upsert({
    where: { id: 'mtm-tarf1-mar25' },
    update: {},
    create: {
      id: 'mtm-tarf1-mar25',
      contractId: tarf1.id,
      date: new Date('2025-03-01'),
      mtmValue: 15200,
      spotRate: 1.0830,
      source: 'Hamilton Court FX',
      notes: 'Valoración mensual',
    },
  })

  await prisma.mtmEntry.upsert({
    where: { id: 'mtm-tarf1-apr25' },
    update: {},
    create: {
      id: 'mtm-tarf1-apr25',
      contractId: tarf1.id,
      date: new Date('2025-04-01'),
      mtmValue: 22400,
      spotRate: 1.0920,
      source: 'Hamilton Court FX',
      notes: 'Valoración mensual',
    },
  })

  console.log('✅ Seed completado:')
  console.log(`   Contrapartes: Hamilton Court FX + BBVA`)
  console.log(`   Contratos: TRE15EAEF0, BOP0018VPXW, BOP0018VQNU, B00018664687`)
  console.log(`   Fixings generados para todos los contratos`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
