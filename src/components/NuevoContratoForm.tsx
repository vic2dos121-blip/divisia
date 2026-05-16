'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Counterparty } from '@prisma/client'

const INSTRUMENT_TYPES = [
  { value: 'TARF_EKI', label: 'TARF con EKI (Target Accrual Redemption Forward + Knock-In)' },
  { value: 'GEARED_FORWARD', label: 'Geared Forward (Forward apalancado)' },
  { value: 'ACCUMULATOR', label: 'Accumulator (Acumulador con barreras)' },
  { value: 'FORWARD', label: 'Forward estándar (con 1 o 2 strikes)' },
  { value: 'OPTION', label: 'Opción de divisa' },
  { value: 'SWAP', label: 'Swap de divisas' },
  { value: 'OTHER', label: 'Otro' },
]

interface Props {
  counterparties: Counterparty[]
}

export function NuevoContratoForm({ counterparties }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [instrumentType, setInstrumentType] = useState('TARF_EKI')
  const [form, setForm] = useState({
    reference: '',
    instrumentName: '',
    counterpartyId: counterparties[0]?.id || '',
    currencyPair: 'EUR/USD',
    buyCurrency: 'EUR',
    sellCurrency: 'USD',
    tradeDate: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    notionalAmount: '',
    gearedAmount: '',
    gearRatio: '2',
    maxNotional: '',
    maxObligation: '',
    strikeRate: '',
    strike2Rate: '',
    ekiBarrier: '',
    nonAccumBarrier: '',
    gearedAccumBarrier: '',
    maxBenefit: '',
    targetBenefit: '',
    totalFixings: '',
    fixingFrequency: 'biweekly',
    notes: '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        reference: form.reference,
        instrumentType,
        instrumentName: form.instrumentName || INSTRUMENT_TYPES.find(t => t.value === instrumentType)?.label || instrumentType,
        counterpartyId: form.counterpartyId,
        currencyPair: form.currencyPair,
        buyCurrency: form.buyCurrency,
        sellCurrency: form.sellCurrency,
        tradeDate: new Date(form.tradeDate).toISOString(),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        notionalAmount: parseFloat(form.notionalAmount),
        strikeRate: parseFloat(form.strikeRate),
        totalFixings: parseInt(form.totalFixings),
        fixingFrequency: form.fixingFrequency,
        notes: form.notes || null,
      }

      if (form.gearedAmount) payload.gearedAmount = parseFloat(form.gearedAmount)
      if (form.gearRatio) payload.gearRatio = parseFloat(form.gearRatio)
      if (form.maxNotional) payload.maxNotional = parseFloat(form.maxNotional)
      if (form.maxObligation) payload.maxObligation = parseFloat(form.maxObligation)
      if (form.strike2Rate) payload.strike2Rate = parseFloat(form.strike2Rate)
      if (form.ekiBarrier) payload.ekiBarrier = parseFloat(form.ekiBarrier)
      if (form.nonAccumBarrier) payload.nonAccumBarrier = parseFloat(form.nonAccumBarrier)
      if (form.gearedAccumBarrier) payload.gearedAccumBarrier = parseFloat(form.gearedAccumBarrier)
      if (form.maxBenefit) payload.maxBenefit = parseFloat(form.maxBenefit)
      if (form.targetBenefit) payload.targetBenefit = parseFloat(form.targetBenefit)

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const contract = await res.json()
      router.push(`/contratos/${contract.id}`)
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  const showEKI = instrumentType === 'TARF_EKI'
  const showAccumBarriers = instrumentType === 'ACCUMULATOR'
  const showStrike2 = instrumentType === 'FORWARD'
  const showGear = ['TARF_EKI', 'GEARED_FORWARD', 'ACCUMULATOR'].includes(instrumentType)
  const showMaxBenefit = instrumentType === 'TARF_EKI'
  const showTarget = instrumentType === 'FORWARD'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-8">
      {/* Tipo de instrumento */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Tipo de instrumento</h2>
        <div className="grid grid-cols-2 gap-3">
          {INSTRUMENT_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setInstrumentType(t.value)}
              className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                instrumentType === t.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Datos generales */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Datos generales</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Referencia del contrato *" hint="Ej: TRE15EAEF0">
            <input required value={form.reference} onChange={e => set('reference', e.target.value)}
              className={inputClass} placeholder="TRE15EAEF0" />
          </Field>
          <Field label="Contraparte *">
            <select required value={form.counterpartyId} onChange={e => set('counterpartyId', e.target.value)} className={inputClass}>
              {counterparties.map(cp => <option key={cp.id} value={cp.id}>{cp.name}</option>)}
            </select>
          </Field>
          <Field label="Nombre del producto" hint="Opcional, se auto-rellena">
            <input value={form.instrumentName} onChange={e => set('instrumentName', e.target.value)}
              className={inputClass} placeholder="Nombre del producto en el contrato" />
          </Field>
          <Field label="Par de divisas">
            <select value={form.currencyPair} onChange={e => set('currencyPair', e.target.value)} className={inputClass}>
              <option value="EUR/USD">EUR/USD</option>
              <option value="USD/EUR">USD/EUR</option>
              <option value="EUR/GBP">EUR/GBP</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Fechas */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Fechas</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Fecha contrato *">
            <input required type="date" value={form.tradeDate} onChange={e => set('tradeDate', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Primer fixing *">
            <input required type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Último fixing / vencimiento *">
            <input required type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      {/* Importes */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Importes y fixings</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Nocional por fixing (USD) *">
            <input required type="number" step="0.01" value={form.notionalAmount} onChange={e => set('notionalAmount', e.target.value)} className={inputClass} placeholder="100000" />
          </Field>
          {showGear && (
            <>
              <Field label="Importe apalancado (USD)">
                <input type="number" step="0.01" value={form.gearedAmount} onChange={e => set('gearedAmount', e.target.value)} className={inputClass} placeholder="200000" />
              </Field>
              <Field label="Ratio apalancamiento">
                <input type="number" step="0.5" value={form.gearRatio} onChange={e => set('gearRatio', e.target.value)} className={inputClass} placeholder="2" />
              </Field>
            </>
          )}
          <Field label="Nocional total máximo (USD)">
            <input type="number" step="0.01" value={form.maxNotional} onChange={e => set('maxNotional', e.target.value)} className={inputClass} placeholder="4200000" />
          </Field>
          <Field label="Obligación máxima (USD)">
            <input type="number" step="0.01" value={form.maxObligation} onChange={e => set('maxObligation', e.target.value)} className={inputClass} placeholder="8400000" />
          </Field>
          <Field label="Número de fixings *">
            <input required type="number" value={form.totalFixings} onChange={e => set('totalFixings', e.target.value)} className={inputClass} placeholder="42" />
          </Field>
          <Field label="Frecuencia fixings">
            <select value={form.fixingFrequency} onChange={e => set('fixingFrequency', e.target.value)} className={inputClass}>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quincenal</option>
              <option value="monthly">Mensual</option>
              <option value="one-shot">Único</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Tipos y barreras */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Tipos de cambio y barreras</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Strike rate *" hint="Tipo de cambio principal">
            <input required type="number" step="0.0001" value={form.strikeRate} onChange={e => set('strikeRate', e.target.value)} className={inputClass} placeholder="1.0850" />
          </Field>
          {showStrike2 && (
            <Field label="Strike 2" hint="Segundo nivel de activación">
              <input type="number" step="0.0001" value={form.strike2Rate} onChange={e => set('strike2Rate', e.target.value)} className={inputClass} placeholder="1.0850" />
            </Field>
          )}
          {showEKI && (
            <Field label="EKI Barrier" hint="European Knock-In">
              <input type="number" step="0.0001" value={form.ekiBarrier} onChange={e => set('ekiBarrier', e.target.value)} className={inputClass} placeholder="1.0050" />
            </Field>
          )}
          {showAccumBarriers && (
            <>
              <Field label="Non-Accumulation Barrier" hint="Barrera superior (sin acumulación)">
                <input type="number" step="0.0001" value={form.nonAccumBarrier} onChange={e => set('nonAccumBarrier', e.target.value)} className={inputClass} placeholder="1.1300" />
              </Field>
              <Field label="Geared Accumulation Barrier" hint="Barrera inferior (acumulación 2x)">
                <input type="number" step="0.0001" value={form.gearedAccumBarrier} onChange={e => set('gearedAccumBarrier', e.target.value)} className={inputClass} placeholder="1.0100" />
              </Field>
            </>
          )}
          {showMaxBenefit && (
            <Field label="Máximo beneficio" hint="Target que cancela el TARF (ej: 0.01)">
              <input type="number" step="0.0001" value={form.maxBenefit} onChange={e => set('maxBenefit', e.target.value)} className={inputClass} placeholder="0.01" />
            </Field>
          )}
          {showTarget && (
            <Field label="Nivel objetivo de beneficio" hint="Target que cancela el Forward (ej: 0.30)">
              <input type="number" step="0.0001" value={form.targetBenefit} onChange={e => set('targetBenefit', e.target.value)} className={inputClass} placeholder="0.30" />
            </Field>
          )}
        </div>
      </section>

      {/* Notas */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Notas</h2>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className={`${inputClass} h-20 resize-none`}
          placeholder="Observaciones, condiciones especiales, UTI..."
        />
      </section>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Crear contrato'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="text-gray-400 font-normal ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}
