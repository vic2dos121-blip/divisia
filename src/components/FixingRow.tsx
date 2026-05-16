'use client'

import { useState } from 'react'
import { formatDate, formatCurrency, FIXING_STATUS_LABELS, FIXING_STATUS_COLORS } from '@/lib/utils'
import type { Fixing } from '@prisma/client'
import { Edit2, Check, X } from 'lucide-react'

interface Props {
  fixing: Fixing
  contractId: string
}

export function FixingRow({ fixing, contractId }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    fixingRate: fixing.fixingRate?.toString() || '',
    scenario: fixing.scenario || '',
    amountExchanged: fixing.amountExchanged?.toString() || '',
    pnl: fixing.pnl?.toString() || '',
    pnlNotes: fixing.pnlNotes || '',
    status: fixing.status,
  })
  const [saving, setSaving] = useState(false)

  const isPast = new Date(fixing.fixingDate) < new Date()

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/fixings/${fixing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixingRate: editData.fixingRate ? parseFloat(editData.fixingRate) : null,
          scenario: editData.scenario || null,
          amountExchanged: editData.amountExchanged ? parseFloat(editData.amountExchanged) : null,
          pnl: editData.pnl ? parseFloat(editData.pnl) : null,
          pnlNotes: editData.pnlNotes || null,
          status: editData.status,
          settledAt: editData.status !== 'pending' ? new Date().toISOString() : null,
        }),
      })
      // Reload page to get fresh data
      window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <tr className="bg-indigo-50 border-l-2 border-indigo-400">
        <td className="px-4 py-2 text-gray-500">#{fixing.fixingNumber}</td>
        <td className="px-4 py-2 text-gray-700">{formatDate(fixing.fixingDate)}</td>
        <td className="px-4 py-2 text-gray-500">{formatDate(fixing.deliveryDate)}</td>
        <td className="px-4 py-2 text-right">{formatCurrency(fixing.notionalAmount, 'USD')}</td>
        <td className="px-4 py-2 text-right">{fixing.strikeRate.toFixed(4)}</td>
        <td className="px-4 py-2">
          <input
            type="number"
            step="0.0001"
            placeholder="1.0850"
            value={editData.fixingRate}
            onChange={e => setEditData(d => ({ ...d, fixingRate: e.target.value }))}
            className="w-20 border border-indigo-300 rounded px-1.5 py-0.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </td>
        <td className="px-4 py-2 text-center">
          <input
            type="text"
            placeholder="A/B/C/D"
            value={editData.scenario}
            onChange={e => setEditData(d => ({ ...d, scenario: e.target.value }))}
            className="w-14 border border-indigo-300 rounded px-1.5 py-0.5 text-xs text-center focus:outline-none"
          />
        </td>
        <td className="px-4 py-2">
          <input
            type="number"
            step="0.01"
            placeholder="P&L €"
            value={editData.pnl}
            onChange={e => setEditData(d => ({ ...d, pnl: e.target.value }))}
            className="w-24 border border-indigo-300 rounded px-1.5 py-0.5 text-xs text-right focus:outline-none"
          />
        </td>
        <td className="px-4 py-2 text-center">
          <select
            value={editData.status}
            onChange={e => setEditData(d => ({ ...d, status: e.target.value }))}
            className="border border-indigo-300 rounded px-1 py-0.5 text-xs focus:outline-none"
          >
            <option value="pending">Pendiente</option>
            <option value="exercised">Ejercido</option>
            <option value="not_exercised">No ejercido</option>
            <option value="leveraged">Apalancado</option>
            <option value="knocked_out">Knock-out</option>
          </select>
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1 rounded bg-green-600 text-white hover:bg-green-700"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className={`hover:bg-gray-50 ${isPast && fixing.status === 'pending' ? 'bg-yellow-50' : ''}`}>
      <td className="px-4 py-2 text-gray-500">#{fixing.fixingNumber}</td>
      <td className="px-4 py-2 text-gray-700">{formatDate(fixing.fixingDate)}</td>
      <td className="px-4 py-2 text-gray-500">{formatDate(fixing.deliveryDate)}</td>
      <td className="px-4 py-2 text-right">{formatCurrency(fixing.notionalAmount, 'USD')}</td>
      <td className="px-4 py-2 text-right font-mono">{fixing.strikeRate.toFixed(4)}</td>
      <td className="px-4 py-2 text-right font-mono text-gray-700">
        {fixing.fixingRate ? fixing.fixingRate.toFixed(4) : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-2 text-center">
        {fixing.scenario ? (
          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono font-medium">
            {fixing.scenario}
          </span>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-2 text-right">
        {fixing.pnl != null ? (
          <span className={fixing.pnl >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {fixing.pnl >= 0 ? '+' : ''}{formatCurrency(fixing.pnl, 'EUR')}
          </span>
        ) : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-2 text-center">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${FIXING_STATUS_COLORS[fixing.status]}`}>
          {FIXING_STATUS_LABELS[fixing.status] || fixing.status}
        </span>
      </td>
      <td className="px-4 py-2">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </td>
    </tr>
  )
}
