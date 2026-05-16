'use client'

import { useState } from 'react'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { MtmEntry } from '@prisma/client'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  contractId: string
  mtmEntries: MtmEntry[]
}

export function MtmSection({ contractId, mtmEntries: initial }: Props) {
  const [entries, setEntries] = useState<MtmEntry[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mtmValue: '',
    spotRate: '',
    source: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/mtm/${contractId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(form.date).toISOString(),
          mtmValue: parseFloat(form.mtmValue),
          spotRate: form.spotRate ? parseFloat(form.spotRate) : null,
          source: form.source || null,
          notes: form.notes || null,
        }),
      })
      const newEntry = await res.json()
      setEntries(prev => [newEntry, ...prev])
      setShowForm(false)
      setForm({ date: new Date().toISOString().split('T')[0], mtmValue: '', spotRate: '', source: '', notes: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">Mark-to-Market</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="w-3 h-3" />
          Añadir
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="px-5 py-4 border-b border-gray-50 bg-indigo-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Fecha</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm(d => ({ ...d, date: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Valor MtM (EUR)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="15000.00"
                value={form.mtmValue}
                onChange={e => setForm(d => ({ ...d, mtmValue: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Spot EUR/USD</label>
              <input
                type="number"
                step="0.0001"
                placeholder="1.0850"
                value={form.spotRate}
                onChange={e => setForm(d => ({ ...d, spotRate: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Fuente</label>
              <input
                type="text"
                placeholder="BBVA, Hamilton..."
                value={form.source}
                onChange={e => setForm(d => ({ ...d, source: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Notas</label>
            <input
              type="text"
              placeholder="Valoración mensual..."
              value={form.notes}
              onChange={e => setForm(d => ({ ...d, notes: e.target.value }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-gray-50">
        {entries.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-xs text-gray-400">Sin valoraciones registradas</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
            >
              Añadir primera valoración
            </button>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="px-5 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                <span className={`text-sm font-semibold flex items-center gap-1 ${entry.mtmValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.mtmValue >= 0
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />
                  }
                  {entry.mtmValue >= 0 ? '+' : ''}{formatCurrency(entry.mtmValue, 'EUR')}
                </span>
              </div>
              {entry.spotRate && (
                <p className="text-xs text-gray-400">Spot: {entry.spotRate.toFixed(4)}</p>
              )}
              {entry.source && (
                <p className="text-xs text-gray-400">Fuente: {entry.source}</p>
              )}
              {entry.notes && (
                <p className="text-xs text-gray-500 mt-1 italic">{entry.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
